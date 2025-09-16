import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, contentType, content } = await req.json();

    if (!userId || !contentType || !content) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user profile for context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Analyze content and generate PDF suggestions
    const systemPrompt = `Você é um assistente especializado em sugerir quando um usuário deve gerar PDFs de seus planos.

Analise o conteúdo fornecido e determine se seria útil para o usuário gerar um PDF. 

Para TREINOS, sugira PDF quando:
- O plano tem múltiplos exercícios ou dias
- É um plano completo e estruturado
- O usuário pode se beneficiar de ter offline
- Há progressões ou periodizações

Para NUTRIÇÃO/CARDÁPIOS, sugira PDF quando:
- É um plano de múltiplos dias
- Tem detalhes nutricionais importantes
- Inclui receitas ou instruções detalhadas
- O usuário pode precisar para compras ou cozinha

Responda APENAS em JSON no formato:
{
  "shouldSuggest": boolean,
  "reason": "motivo específico para sugerir ou não",
  "suggestion": "sugestão amigável para o usuário sobre o PDF"
}`;

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
          { 
            role: 'user', 
            content: `Tipo de conteúdo: ${contentType}\n\nConteúdo para análise:\n${JSON.stringify(content, null, 2)}\n\nPerfil do usuário: ${profile ? JSON.stringify(profile, null, 2) : 'Não disponível'}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(suggestion), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in pdf-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      shouldSuggest: false,
      reason: 'Erro ao analisar conteúdo',
      suggestion: 'Você pode gerar um PDF do seu plano a qualquer momento usando o botão "Baixar PDF".'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});