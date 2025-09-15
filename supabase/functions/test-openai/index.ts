import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== TESTE OPENAI API KEY ===');
    
    // Verificar todas as variáveis de ambiente
    const envVars = Deno.env.toObject();
    console.log('Todas as variáveis de ambiente disponíveis:');
    Object.keys(envVars).forEach(key => {
      if (key.includes('OPENAI') || key.includes('API')) {
        console.log(`${key}: ${envVars[key] ? 'EXISTE (tamanho: ' + envVars[key].length + ')' : 'NÃO EXISTE'}`);
      }
    });
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY não encontrada');
      return new Response(JSON.stringify({ 
        error: "OPENAI_API_KEY não encontrada nas variáveis de ambiente",
        availableKeys: Object.keys(envVars).filter(k => k.includes('OPENAI') || k.includes('API'))
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('OpenAI Key encontrada - primeiros 8 chars:', openAIApiKey.substring(0, 8));
    console.log('OpenAI Key - últimos 4 chars:', openAIApiKey.substring(openAIApiKey.length - 4));
    console.log('OpenAI Key - tamanho total:', openAIApiKey.length);
    
    // Teste simples da API OpenAI
    console.log('Testando chamada para OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Diga apenas "API funcionando"' }],
        max_tokens: 10
      }),
    });

    console.log('Status da resposta OpenAI:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro OpenAI:', errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API retornou status ${response.status}`,
        details: errorText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Resposta OpenAI:', data);
    
    return new Response(JSON.stringify({
      success: true,
      message: "OpenAI API funcionando corretamente!",
      response: data.choices[0].message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro no teste:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});