import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== CHAT CONVERSATION START ===');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:');
    console.log('- OpenAI Key exists:', !!openAIApiKey);
    console.log('- Supabase URL exists:', !!supabaseUrl);
    console.log('- Service Key exists:', !!supabaseServiceKey);
    
    if (!openAIApiKey) {
      console.error('FATAL: OpenAI API key não encontrada');
      return new Response(JSON.stringify({ 
        error: "OpenAI API key não configurada",
        message: "Configure a chave da API do OpenAI para usar esta funcionalidade."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, conversationHistory, chatType, userId } = await req.json();
    console.log('Request data:', { 
      chatType, 
      userId: userId?.substring(0, 8) + '...', 
      messageLength: message?.length,
      historyLength: conversationHistory?.length 
    });
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Determinar se devemos gerar um plano (versão simplificada)
    const shouldGeneratePlan = conversationHistory && conversationHistory.length >= 4 && 
      (message.toLowerCase().includes('sim') || 
       message.toLowerCase().includes('gerar') || 
       message.toLowerCase().includes('criar'));

    console.log('Should generate plan:', shouldGeneratePlan);

    if (shouldGeneratePlan) {
      console.log('Generating plan...');
      return new Response(JSON.stringify({
        message: `Perfeito! Vou criar seu plano personalizado agora. (Em desenvolvimento)`,
        shouldGeneratePlan: true,
        planData: { plan_data: { plan_name: "Plano Teste", description: "Plano em desenvolvimento" } }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Conversa simples com OpenAI
    console.log('Making OpenAI request...');
    
    const systemPrompt = chatType === 'personal' 
      ? "Você é um personal trainer virtual amigável. Faça perguntas para entender os objetivos do usuário."
      : "Você é uma nutricionista virtual amigável. Faça perguntas para entender os objetivos nutricionais do usuário.";

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory || []).slice(-5), // Últimas 5 mensagens
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.8
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    
    const aiResponse = data.choices[0].message.content;

    console.log('=== CHAT CONVERSATION SUCCESS ===');
    
    return new Response(JSON.stringify({
      message: aiResponse,
      shouldGeneratePlan: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('=== CHAT CONVERSATION ERROR ===');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "Desculpe, houve um erro na conversa. Tente novamente em alguns instantes."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});