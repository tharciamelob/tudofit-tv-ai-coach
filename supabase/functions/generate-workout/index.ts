import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do questionário
    const { data: questionnaire, error: qError } = await supabase
      .from('personal_questionnaire')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (qError || !questionnaire) {
      throw new Error('Questionário não encontrado');
    }

    // Construir prompt baseado nos dados
    const equipmentList = questionnaire.available_equipment?.join(', ') || 'nenhum equipamento';
    const restrictions = questionnaire.physical_restrictions || 'nenhuma restrição';
    
    const prompt = `
    Crie um plano de treino personalizado baseado nos seguintes dados:
    - Objetivo: ${questionnaire.fitness_goal}
    - Nível: ${questionnaire.fitness_level}
    - Tempo disponível: ${questionnaire.available_time} minutos por treino
    - Frequência semanal: ${questionnaire.weekly_frequency}x por semana
    - Equipamentos disponíveis: ${equipmentList}
    - Restrições físicas: ${restrictions}

    Retorne APENAS um JSON válido no seguinte formato:
    {
      "plan_name": "Nome do Plano",
      "description": "Descrição do plano",
      "workouts": [
        {
          "day": "Segunda",
          "name": "Treino A",
          "exercises": [
            {
              "name": "Nome do exercício",
              "sets": 3,
              "reps": "12-15",
              "rest": "60s",
              "instructions": "Como executar"
            }
          ]
        }
      ]
    }
    `;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um personal trainer especializado. Sempre retorne apenas JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiData = await openAIResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    
    let workoutPlan;
    try {
      workoutPlan = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', generatedContent);
      throw new Error('Formato de resposta inválido da IA');
    }

    // Salvar o plano no banco
    const { data: savedPlan, error: saveError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: questionnaire.user_id,
        questionnaire_id: questionnaireId,
        plan_name: workoutPlan.plan_name,
        plan_data: workoutPlan
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('Erro ao salvar plano');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      plan: savedPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-workout:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});