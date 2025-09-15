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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, chatType, userId } = await req.json();
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Obter informações do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Determinar se devemos gerar um plano baseado na conversa
    const conversationText = conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');
    const shouldGeneratePlan = conversationHistory.length >= 6 && 
      (message.toLowerCase().includes('sim') || 
       message.toLowerCase().includes('gerar') || 
       message.toLowerCase().includes('criar') ||
       message.toLowerCase().includes('pronto'));

    let systemPrompt = '';
    let responseContext = '';

    if (chatType === 'personal') {
      systemPrompt = `Você é um personal trainer virtual especializado e amigável. Sua função é fazer perguntas para entender as necessidades do usuário e eventualmente gerar um plano de treino personalizado.

IMPORTANTE:
- Faça perguntas de forma natural e conversacional
- Uma pergunta por vez, não bombardeie o usuário
- Seja motivador e positivo
- Inclua SEMPRE exercícios sem equipamentos (peso corporal)
- Inclua exercícios de yoga e pilates quando apropriado
- Considere diferentes níveis: iniciante, intermediário, avançado
- Pergunte sobre limitações físicas
- Considere o tempo disponível

INFORMAÇÕES A COLETAR:
1. Objetivo principal (emagrecimento, ganho de massa, condicionamento, fortalecimento)
2. Nível de experiência com exercícios
3. Tempo disponível para treinar
4. Frequência semanal desejada
5. Equipamentos disponíveis (incluir "sem equipamentos" como opção)
6. Limitações físicas ou lesões
7. Preferências (yoga, pilates, cardio, musculação, etc.)

Se você já coletou informações suficientes e o usuário confirma que quer gerar o plano, responda indicando que vai criar o treino.`;

      responseContext = 'Responda como um personal trainer motivador e amigável.';
    } else {
      systemPrompt = `Você é uma nutricionista virtual especializada e amigável. Sua função é fazer perguntas para entender as necessidades nutricionais do usuário e eventualmente gerar um plano alimentar personalizado.

IMPORTANTE:
- Faça perguntas de forma natural e conversacional
- Uma pergunta por vez, não sobrecarregue o usuário
- Seja encorajadora e informativa
- Considere diferentes objetivos nutricionais
- Respeite preferências alimentares e restrições
- Considere rotina e estilo de vida

INFORMAÇÕES A COLETAR:
1. Objetivo nutricional (emagrecimento, ganho de massa, manutenção, saúde geral)
2. Número de refeições por dia preferido
3. Preferências alimentares (vegetariano, vegano, sem glúten, etc.)
4. Restrições alimentares ou alergias
5. Alimentos que não gosta
6. Rotina diária (horários de refeições)
7. Nível de atividade física
8. Histórico de saúde relevante

Se você já coletou informações suficientes e o usuário confirma que quer gerar o plano, responda indicando que vai criar o cardápio.`;

      responseContext = 'Responda como uma nutricionista motivadora e informativa.';
    }

    if (shouldGeneratePlan) {
      // Extrair dados da conversa e gerar plano
      console.log('Gerando plano baseado na conversa...');
      
      let planData;
      if (chatType === 'personal') {
        // Gerar plano de treino
        const workoutResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `Baseado na conversa a seguir, crie um plano de treino personalizado em JSON.

INCLUA SEMPRE:
- Exercícios sem equipamentos (peso corporal)
- Exercícios de yoga/pilates quando apropriado
- Diferentes níveis de intensidade
- Instruções claras para cada exercício

Formato JSON:
{
  "plan_data": {
    "plan_name": "Nome do Plano",
    "description": "Descrição do plano",
    "duration_weeks": 4,
    "workouts": [
      {
        "day": "Segunda-feira",
        "name": "Nome do Treino",
        "exercises": [
          {
            "name": "Nome do Exercício",
            "sets": "3",
            "reps": "12-15",
            "rest": "60s",
            "instructions": "Instruções detalhadas",
            "equipment": "Sem equipamento" // ou equipamento necessário
          }
        ]
      }
    ]
  }
}`
              },
              { role: 'user', content: conversationText }
            ],
            max_tokens: 2000,
            temperature: 0.7
          }),
        });

        const workoutData = await workoutResponse.json();
        planData = JSON.parse(workoutData.choices[0].message.content);

        // Salvar no banco
        const { data: savedPlan } = await supabase
          .from('workout_plans')
          .insert({
            user_id: userId,
            plan_data: planData.plan_data
          })
          .select()
          .single();

        planData = savedPlan;
      } else {
        // Gerar plano nutricional
        const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `Baseado na conversa a seguir, crie um plano nutricional personalizado em JSON.

Formato JSON:
{
  "plan_data": {
    "plan_name": "Nome do Plano",
    "description": "Descrição do plano",
    "daily_calories": 2000,
    "macros": {
      "protein": 150,
      "carbs": 200,
      "fat": 70
    },
    "weekly_plan": [
      {
        "day": "Segunda-feira",
        "meals": [
          {
            "type": "Café da Manhã",
            "time": "08:00",
            "foods": [
              {
                "name": "Aveia",
                "quantity": "50g",
                "calories": 190,
                "protein": 7,
                "carbs": 32,
                "fat": 3
              }
            ]
          }
        ]
      }
    ]
  }
}`
              },
              { role: 'user', content: conversationText }
            ],
            max_tokens: 2000,
            temperature: 0.7
          }),
        });

        const nutritionData = await nutritionResponse.json();
        planData = JSON.parse(nutritionData.choices[0].message.content);

        // Salvar no banco
        const { data: savedPlan } = await supabase
          .from('meal_plans')
          .insert({
            user_id: userId,
            plan_data: planData.plan_data
          })
          .select()
          .single();

        planData = savedPlan;
      }

      return new Response(JSON.stringify({
        message: `Perfeito! Criei seu plano personalizado baseado em nossas conversas. Vou gerar tudo agora para você!`,
        shouldGeneratePlan: true,
        planData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Continuar conversa
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `${systemPrompt}\n\n${responseContext}` },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.8
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({
      message: aiResponse,
      shouldGeneratePlan: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função chat-conversation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: "Desculpe, houve um erro. Pode tentar novamente?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});