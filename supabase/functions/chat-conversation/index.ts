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

    // Analisar se o usuário está pronto para gerar um plano
    const shouldGeneratePlan = conversationHistory && conversationHistory.length >= 4 && 
      (message.toLowerCase().includes('sim') || 
       message.toLowerCase().includes('gerar') || 
       message.toLowerCase().includes('criar') ||
       message.toLowerCase().includes('pronto') ||
       message.toLowerCase().includes('vamos') ||
       (message.toLowerCase().includes('quero') && message.toLowerCase().includes('plano')));

    console.log('Should generate plan:', shouldGeneratePlan);

    if (shouldGeneratePlan) {
      console.log('Generating plan...');
      
      try {
        // Gerar plano através das edge functions específicas
        const functionName = chatType === 'nutrition' ? 'generate-nutrition' : 'generate-workout';
        
        // Criar dados básicos do questionário a partir da conversa
        const questionnaireData = {
          user_id: userId,
          created_at: new Date().toISOString(),
          // Para nutrição
          ...(chatType === 'nutrition' && {
            nutrition_goal: 'emagrecimento', // padrão
            meals_per_day: 5,
            food_preferences: [],
            food_restrictions: [],
            allergies: []
          }),
          // Para personal
          ...(chatType === 'personal' && {
            fitness_goal: 'perda_de_peso', // padrão
            current_activity: 'sedentario',
            experience_level: 'iniciante',
            available_time: 60,
            equipment_access: 'nenhum'
          })
        };

        // Salvar questionário primeiro
        const tableName = chatType === 'nutrition' ? 'nutrition_questionnaire' : 'personal_questionnaire';
        const { data: questionnaire, error: qError } = await supabase
          .from(tableName)
          .insert(questionnaireData)
          .select()
          .single();

        if (qError) {
          console.error('Erro ao salvar questionário:', qError);
          throw new Error('Erro ao processar dados do questionário');
        }

        // Gerar plano via edge function
        const { data: planResult, error: planError } = await supabase.functions.invoke(functionName, {
          body: { questionnaireId: questionnaire.id }
        });

        if (planError) {
          console.error('Erro ao gerar plano:', planError);
          throw new Error('Erro ao gerar plano personalizado');
        }

        return new Response(JSON.stringify({
          message: `Perfeito! Seu plano personalizado foi criado com sucesso!`,
          shouldGeneratePlan: true,
          planData: planResult.plan
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error: any) {
        console.error('Erro na geração do plano:', error);
        return new Response(JSON.stringify({
          message: `Ocorreu um erro ao gerar seu plano. Vamos tentar novamente em um momento.`,
          shouldGeneratePlan: false,
          error: error.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Conversa simples com OpenAI
    console.log('Making OpenAI request...');
    
    const systemPrompt = chatType === 'personal' 
      ? `Você é um Personal Trainer especialista com mais de 10 anos de experiência. Seja profissional, motivador e faça perguntas específicas sobre:
         - Objetivos (emagrecimento, ganho de massa, condicionamento)
         - Nível de experiência e limitações físicas
         - Tempo disponível e equipamentos
         - Preferências de exercícios
         Após coletar informações suficientes, sugira criar o plano personalizado.`
      : `Você é uma Nutricionista especialista CRN com vasta experiência. Seja profissional, empática e faça perguntas específicas sobre:
         - Objetivos nutricionais e peso atual
         - Restrições alimentares e alergias
         - Preferências culinárias e rotina
         - Número de refeições desejadas
         Após coletar informações suficientes, sugira criar o cardápio personalizado.`;

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