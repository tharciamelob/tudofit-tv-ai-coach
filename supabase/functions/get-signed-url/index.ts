import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Single item request
interface SingleRequest {
  bucket: 'workouts' | 'previews'
  path: string
  expiresIn?: number
}

// Batch request
interface BatchRequest {
  items: Array<{
    bucket: 'workouts' | 'previews'
    path: string
    expiresIn?: number
  }>
}

type RequestBody = SingleRequest | BatchRequest

const isBatchRequest = (body: RequestBody): body is BatchRequest => {
  return 'items' in body && Array.isArray(body.items)
}

Deno.serve(async (req) => {
  console.log(`${req.method} /functions/v1/get-signed-url`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('Invalid token:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Authenticated user: ${user.email}`)

    // Parse request body
    const body: RequestBody = await req.json()

    // Handle batch request
    if (isBatchRequest(body)) {
      const { items } = body
      
      if (!items.length) {
        return new Response(
          JSON.stringify({ error: 'Empty items array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Limit batch size to prevent abuse
      const MAX_BATCH_SIZE = 50
      if (items.length > MAX_BATCH_SIZE) {
        return new Response(
          JSON.stringify({ error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Batch request for ${items.length} signed URLs`)

      // Process all items in parallel
      const results = await Promise.all(
        items.map(async (item, index) => {
          const { bucket, path, expiresIn } = item

          // Validate bucket
          if (!bucket || !['workouts', 'previews'].includes(bucket)) {
            return { index, error: 'Invalid bucket', signedUrl: null }
          }

          // Validate path
          if (!path || typeof path !== 'string') {
            return { index, error: 'Invalid path', signedUrl: null }
          }

          // Set default TTL based on bucket
          const defaultTTL = bucket === 'previews' ? 60 : 900
          const ttl = expiresIn || defaultTTL

          try {
            const { data, error } = await supabase.storage
              .from(bucket)
              .createSignedUrl(path, ttl)

            if (error) {
              console.warn(`Failed to create signed URL for ${bucket}/${path}:`, error.message)
              return { index, error: error.message, signedUrl: null }
            }

            return {
              index,
              signedUrl: data.signedUrl,
              bucket,
              path,
              expiresIn: ttl
            }
          } catch (err) {
            console.warn(`Error processing ${bucket}/${path}:`, err)
            return { index, error: 'Failed to generate URL', signedUrl: null }
          }
        })
      )

      console.log(`Batch complete: ${results.filter(r => r.signedUrl).length}/${items.length} successful`)

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle single request (backwards compatible)
    const { bucket, path, expiresIn } = body as SingleRequest

    // Validate bucket
    if (!bucket || !['workouts', 'previews'].includes(bucket)) {
      console.log(`Invalid bucket: ${bucket}`)
      return new Response(
        JSON.stringify({ error: 'Invalid bucket. Must be "workouts" or "previews"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate path
    if (!path || typeof path !== 'string') {
      console.log(`Invalid path: ${path}`)
      return new Response(
        JSON.stringify({ error: 'Invalid path' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Set default TTL based on bucket
    const defaultTTL = bucket === 'previews' ? 60 : 900
    const ttl = expiresIn || defaultTTL

    console.log(`Generating signed URL for ${bucket}/${path} with TTL ${ttl}s`)

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, ttl)

    if (error) {
      console.error('Error creating signed URL:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create signed URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Signed URL created successfully')

    return new Response(
      JSON.stringify({
        signedUrl: data.signedUrl,
        bucket,
        path,
        expiresIn: ttl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})