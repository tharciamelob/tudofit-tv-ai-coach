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
    const { action, foodName, userGoal, userProfile, message, conversationHistory, userId } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Action: Chat with nutritionist AI
    if (action === 'chat') {
      console.log('Chat message received:', message);
      
      // Get user's nutrition questionnaire data if exists
      let userQuestionnaire = null;
      if (userId) {
        const { data } = await supabase
          .from('nutrition_questionnaire')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        userQuestionnaire = data;
      }

      const systemPrompt = `Você é a Nutri IA, uma nutricionista virtual simpática, direta e sucinta.

TOM DE VOZ:
- Educado e acolhedor, sem linguagem infantilizada
- Mensagens curtas e diretas, sem textão
- Evitar linguagem técnica demais; explicar de forma simples
- Sempre lembrar que não substitui acompanhamento profissional

FLUXO DE ATENDIMENTO - ANAMNESE RÁPIDA EM 3 MENSAGENS:

1) PRIMEIRA INTERAÇÃO:
   ${!userQuestionnaire ? `Se for a primeira interação, iniciar com:
   "Oi! Eu sou a Nutri IA e vou montar um plano alimentar pra você. Vou te fazer algumas perguntas rápidas, tudo bem?"
   
   Depois, IMEDIATAMENTE na mesma mensagem, fazer a primeira pergunta (não aguardar resposta do usuário):
   
   "Pra começar, me conta: qual é o seu objetivo principal hoje? Emagrecer, ganhar massa, manter o peso ou só melhorar a qualidade da alimentação?"` : ''}

2) DADOS EXISTENTES:
   ${userQuestionnaire ? `O usuário já tem dados cadastrados:
   - Objetivo: ${userQuestionnaire.nutrition_goal}
   - Alergias: ${userQuestionnaire.allergies?.join(', ') || 'nenhuma'}
   - Restrições: ${userQuestionnaire.food_restrictions?.join(', ') || 'nenhuma'}
   
   NÃO repetir perguntas. Apenas confirmar:
   "Vou usar suas informações já cadastradas (objetivo: ${userQuestionnaire.nutrition_goal}). Se quiser atualizar algo, é só me avisar. Caso contrário, posso gerar seu plano agora."
   
   Se o usuário confirmar ou pedir para gerar, use generate_plan: true.` : ''}

3) ETAPAS DE COLETA (SOMENTE SE NÃO HOUVER DADOS):
   
   Etapa 1 - OBJETIVO + DADOS BÁSICOS (em UMA mensagem):
   "Legal! Agora me conta rapidinho:
   • Qual sua idade?
   • Peso e altura?
   • Sexo?"
   
   Etapa 2 - ESTILO DE VIDA (em UMA mensagem):
   "Beleza! Mais algumas coisinhas:
   • Você fuma?
   • Bebe álcool com frequência?
   • Nível de atividade física: sedentário, moderado ou intenso?"
   
   Etapa 3 - SAÚDE E RESTRIÇÕES (em UMA mensagem):
   "Última etapa:
   • Alguma alergia ou intolerância alimentar? (ex.: lactose, glúten, frutos do mar...)
   • Alguma doença ou condição importante? (ex.: diabetes, hipertensão, gastrite...)
   • Usa algum medicamento contínuo?"
   
   Extrair as informações e salvar em user_data do JSON.

4) GERAÇÃO DO PLANO:
   Quando tiver TODAS as informações (objetivo + idade + peso + altura + restrições), usar generate_plan: true.
   
   Na mensagem, NÃO mostrar o plano completo. Apenas um resumo bem curto tipo:
   "Prontinho! Seu plano personalizado para hoje já está disponível na seção **Seu Plano Nutricional de Hoje** logo abaixo.
   
   Aqui vai um resumo rápido:
   • Café da manhã: [breve descrição]
   • Almoço: [breve descrição]
   • Lanche: [breve descrição]
   • Jantar: [breve descrição]
   • Ceia: [breve descrição]
   
   Se quiser ajustar alguma refeição ou trocar alimentos, posso te ajudar 🧠✨"

5) INTERAÇÃO CONTÍNUA:
   - Aceitar perguntas sobre nutrição
   - Sugerir substituições quando solicitado
   - Manter respostas curtas e práticas

LIMITAÇÕES:
- NÃO dar diagnóstico médico
- NÃO recomendar, alterar ou suspender medicamentos
- Orientar a procurar profissional presencial em casos complexos

IMPORTANTE: 
- Sempre responda em JSON: { "message": "sua resposta", "generate_plan": false/true, "user_data": {...} }
- Quando tiver dados suficientes, use generate_plan: true
- Extraia: nutrition_goal, age, weight, height, sex, smoking, alcohol, activity_level, allergies, food_restrictions, conditions, medications`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(conversationHistory || []),
        { role: 'user', content: message }
      ];

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
        }),
      });

      const aiData = await aiResponse.json();
      const aiMessage = aiData.choices[0].message.content;
      
      console.log('AI response:', aiMessage);

      // Try to parse as JSON, if not, wrap in standard format
      let responseData;
      try {
        responseData = JSON.parse(aiMessage);
      } catch {
        responseData = { 
          message: aiMessage, 
          generate_plan: false 
        };
      }

      // If AI indicates it's time to generate plan, do it
      if (responseData.generate_plan && responseData.user_data) {
        const { 
          nutrition_goal, 
          age, 
          weight, 
          height, 
          sex, 
          smoking, 
          alcohol, 
          activity_level, 
          allergies, 
          food_restrictions, 
          conditions, 
          medications 
        } = responseData.user_data;
        
        // Save to nutrition_questionnaire if userId exists
        if (userId) {
          await supabase
            .from('nutrition_questionnaire')
            .upsert({
              user_id: userId,
              nutrition_goal: nutrition_goal || 'manutencao',
              allergies: allergies || [],
              food_restrictions: food_restrictions || [],
            });
        }

        // Generate meal plan
        const planPrompt = `Crie um plano nutricional completo do dia (5 refeições) para:
- Objetivo: ${nutrition_goal || 'manutenção'}
${age ? `- Idade: ${age} anos` : ''}
${weight ? `- Peso: ${weight} kg` : ''}
${height ? `- Altura: ${height} cm` : ''}
${sex ? `- Sexo: ${sex}` : ''}
${activity_level ? `- Nível de atividade: ${activity_level}` : ''}
${smoking ? `- Fumante: ${smoking}` : ''}
${alcohol ? `- Consumo de álcool: ${alcohol}` : ''}
${allergies?.length > 0 ? `- Alergias: ${allergies.join(', ')}` : ''}
${food_restrictions?.length > 0 ? `- Restrições: ${food_restrictions.join(', ')}` : ''}
${conditions?.length > 0 ? `- Condições de saúde: ${conditions.join(', ')}` : ''}
${medications?.length > 0 ? `- Medicamentos: ${medications.join(', ')}` : ''}

IMPORTANTE: Evite alimentos relacionados às alergias e restrições. 
${conditions?.includes('diabetes') ? 'Evite açúcares simples e carboidratos refinados.' : ''}
${conditions?.includes('hipertensão') || conditions?.includes('hipertensao') ? 'Reduza sódio e alimentos processados.' : ''}
${smoking === 'sim' ? 'Inclua mais antioxidantes (frutas cítricas, vegetais verde-escuros).' : ''}
${alcohol === 'frequente' ? 'Evite alimentos muito processados, foque em desintoxicação hepática.' : ''}

Retorne APENAS JSON válido no formato:
{
  "plan_name": "Nome do Plano",
  "meals": [
    {
      "meal_type": "cafe_da_manha|almoco|lanche|jantar|ceia",
      "name": "Nome",
      "foods": [
        {
          "name": "Nome do Alimento",
          "quantity": "100g",
          "calories": número,
          "protein": número,
          "carbs": número,
          "fat": número
        }
      ]
    }
  ]
}`;

        const planResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um nutricionista. Retorne APENAS JSON válido.' },
              { role: 'user', content: planPrompt }
            ],
            temperature: 0.7,
          }),
        });

        const planData = await planResponse.json();
        const mealPlan = JSON.parse(planData.choices[0].message.content);

        return new Response(JSON.stringify({
          message: responseData.message,
          plan: mealPlan,
          generate_plan: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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