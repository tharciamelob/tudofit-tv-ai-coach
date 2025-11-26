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
    const { action, foodName, userGoal, userProfile } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Action: Search or create food
    if (action === 'search_or_create_food') {
      console.log('Searching for food:', foodName);
      
      // First, try to find in database
      const { data: existingFoods, error: searchError } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${foodName}%`)
        .limit(5);

      if (searchError) {
        console.error('Error searching foods:', searchError);
        throw searchError;
      }

      if (existingFoods && existingFoods.length > 0) {
        console.log('Found existing foods:', existingFoods.length);
        return new Response(JSON.stringify({ 
          found: true, 
          foods: existingFoods 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // If not found, use AI to estimate nutritional info
      console.log('Food not found, using AI to estimate...');
      
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é um nutricionista especializado. Retorne APENAS um JSON válido com as informações nutricionais por 100g do alimento solicitado. 
              
              Formato esperado:
              {
                "name": "nome do alimento",
                "kcal_per_100g": número,
                "protein_per_100g": número,
                "carbs_per_100g": número,
                "fat_per_100g": número,
                "category": "uma das categorias: fruta, legume_vegetal, grao_cereal, tuberculo, proteina_animal, proteina_vegetal, laticinio, oleaginosa_semente, bebida, doce_sobremesa, outros"
              }
              
              Importante: Retorne APENAS o JSON, sem texto adicional.`
            },
            {
              role: 'user',
              content: `Forneça as informações nutricionais por 100g de: ${foodName}`
            }
          ],
          temperature: 0.3,
        }),
      });

      const aiData = await aiResponse.json();
      const nutritionInfo = JSON.parse(aiData.choices[0].message.content);
      
      console.log('AI estimated nutrition:', nutritionInfo);

      // Insert into database
      const { data: newFood, error: insertError } = await supabase
        .from('foods')
        .insert([{
          name: nutritionInfo.name || foodName,
          kcal_per_100g: nutritionInfo.kcal_per_100g,
          protein_per_100g: nutritionInfo.protein_per_100g,
          carbs_per_100g: nutritionInfo.carbs_per_100g,
          fat_per_100g: nutritionInfo.fat_per_100g,
          category: nutritionInfo.category || 'outros',
          source: 'ai_estimated'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting food:', insertError);
        throw insertError;
      }

      console.log('Created new food:', newFood);

      return new Response(JSON.stringify({ 
        found: false, 
        created: true,
        food: newFood 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action: Generate complete daily meal plan
    if (action === 'generate_meal_plan') {
      console.log('Generating meal plan for goal:', userGoal);
      
      const goalDescriptions = {
        'emagrecimento': 'emagrecimento (perda de peso)',
        'ganho_massa': 'ganho de massa muscular',
        'manutencao': 'manutenção de peso'
      };

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Você é um nutricionista especializado. Crie um plano alimentar completo do dia com 5 refeições.

              Retorne APENAS um JSON válido no seguinte formato:
              {
                "plan_name": "Nome do Plano",
                "description": "Descrição breve",
                "meals": [
                  {
                    "meal_type": "cafe_da_manha",
                    "name": "Nome da Refeição",
                    "foods": [
                      {
                        "name": "Nome do Alimento",
                        "quantity": "quantidade (ex: 100g, 1 unidade)",
                        "calories": número,
                        "protein": número,
                        "carbs": número,
                        "fat": número
                      }
                    ]
                  }
                ]
              }

              Os meal_types devem ser: cafe_da_manha, almoco, lanche, jantar, ceia
              
              Importante: Retorne APENAS o JSON, sem texto adicional.`
            },
            {
              role: 'user',
              content: `Crie um plano nutricional completo do dia (5 refeições) para objetivo de ${goalDescriptions[userGoal || 'manutencao']}.
              
              Diretrizes:
              - ${userGoal === 'emagrecimento' ? 'Foco em déficit calórico moderado, proteínas magras, muitos vegetais' : ''}
              - ${userGoal === 'ganho_massa' ? 'Foco em superávit calórico, alta proteína, carboidratos complexos' : ''}
              - ${userGoal === 'manutencao' ? 'Foco em equilíbrio nutricional, variedade de alimentos' : ''}
              - Alimentos naturais e integrais
              - Porções realistas
              - Calcule os macros corretamente`
            }
          ],
          temperature: 0.7,
        }),
      });

      const aiData = await aiResponse.json();
      const mealPlan = JSON.parse(aiData.choices[0].message.content);
      
      console.log('Generated meal plan:', mealPlan);

      return new Response(JSON.stringify({ 
        success: true,
        plan: mealPlan
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in nutri-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});