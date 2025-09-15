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
      .from('nutrition_questionnaire')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (qError || !questionnaire) {
      throw new Error('Questionário nutricional não encontrado');
    }

    // Buscar dados do perfil do usuário
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', questionnaire.user_id)
      .single();

    const preferences = questionnaire.food_preferences?.join(', ') || 'nenhuma preferência específica';
    const restrictions = questionnaire.food_restrictions?.join(', ') || 'nenhuma restrição alimentar';
    const allergies = questionnaire.allergies?.join(', ') || 'nenhuma alergia';
    const weight = profile?.weight || 'não informado';
    const height = profile?.height || 'não informado';
    const goal = profile?.fitness_goal || questionnaire.nutrition_goal;
    
    const prompt = `
    Você é uma NUTRICIONISTA ESPECIALISTA CRN com 15 anos de experiência. Crie um plano nutricional detalhado de 7 dias baseado nos seguintes dados:
    
    DADOS DO CLIENTE:
    - Objetivo nutricional: ${questionnaire.nutrition_goal}
    - Objetivo fitness: ${goal}
    - Peso: ${weight}kg
    - Altura: ${height}cm
    - Refeições por dia: ${questionnaire.meals_per_day}
    - Preferências alimentares: ${preferences}
    - Restrições alimentares: ${restrictions}
    - Alergias: ${allergies}

    INSTRUÇÕES IMPORTANTES:
    - Calcule calorias e macros com precisão nutricional
    - Inclua preparos detalhados e substitutos
    - Balanceie micronutrientes essenciais
    - Considere índice glicêmico e timing nutricional
    - Use alimentos brasileiros e sazonais
    - Varie proteínas, cores e texturas

    Retorne APENAS um JSON válido no seguinte formato:
    {
      "plan_name": "Nome do Plano Nutricional",
      "description": "Descrição do plano",
      "daily_calories": 2000,
      "macros": {
        "protein": 150,
        "carbs": 250,
        "fat": 67
      },
      "weekly_plan": [
        {
          "day": "Segunda-feira",
          "meals": [
            {
              "type": "Café da manhã",
              "time": "07:00",
              "foods": [
                {
                  "name": "Aveia com frutas",
                  "quantity": "1 porção",
                  "calories": 300,
                  "protein": 12,
                  "carbs": 54,
                  "fat": 6
                }
              ]
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
            content: 'Você é um nutricionista especializado. Sempre retorne apenas JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiData = await openAIResponse.json();
    const generatedContent = aiData.choices[0].message.content;
    
    let nutritionPlan;
    try {
      nutritionPlan = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', generatedContent);
      throw new Error('Formato de resposta inválido da IA');
    }

    // Salvar o plano no banco
    const { data: savedPlan, error: saveError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: questionnaire.user_id,
        questionnaire_id: questionnaireId,
        plan_name: nutritionPlan.plan_name,
        plan_data: nutritionPlan
      })
      .select()
      .single();

    if (saveError) {
      throw new Error('Erro ao salvar plano nutricional');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      plan: savedPlan 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-nutrition:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});