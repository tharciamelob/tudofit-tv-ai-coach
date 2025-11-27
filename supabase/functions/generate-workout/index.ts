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
    const { conversationId, userId, messages } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados do perfil do usuário
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (pError) {
      console.error('Erro ao buscar perfil:', pError);
    }

    // Construir contexto da conversa
    const conversationContext = messages
      ?.map((msg: any) => `${msg.role === 'user' ? 'Usuário' : 'IA'}: ${msg.content}`)
      .join('\n') || '';

    const weight = profile?.weight || 'não informado';
    const height = profile?.height || 'não informado';
    const fitness_goal = profile?.fitness_goal || 'não especificado';
    
    const prompt = `
    Você é um PERSONAL TRAINER ESPECIALISTA CREF com 15 anos de experiência em treinamento físico. Com base na conversa abaixo, crie um plano de treino detalhado.
    
    CONTEXTO DA CONVERSA:
    ${conversationContext}
    
    DADOS DO USUÁRIO (se disponíveis):
    - Peso: ${weight}kg
    - Altura: ${height}cm
    - Objetivo geral: ${fitness_goal}

    INSTRUÇÕES IMPORTANTES:
    - Analise a conversa para entender objetivo, nível, tempo disponível, equipamentos e restrições
    - Crie um plano progressivo e seguro para o nível do usuário
    - Inclua aquecimento e alongamento quando apropriado
    - Adapte para os equipamentos disponíveis mencionados
    - Se não houver informação clara, use valores padrão sensatos (ex: iniciante, 30-40min, sem equipamento)

    Retorne APENAS um JSON válido no seguinte formato:
    {
      "name": "Nome do Plano de Treino",
      "objective": "Objetivo principal (ex: Emagrecimento, Hipertrofia, Condicionamento)",
      "level": "iniciante|intermediario|avancado",
      "durationMinutes": 35,
      "type": "Sem equipamento|Com halteres|Academia",
      "series": [
        {
          "id": "serie-1",
          "name": "Série A – Nome",
          "summary": "3 séries · 40s ON / 20s OFF · 5 exercícios",
          "exercises": [
            {
              "id": "ex-1",
              "name": "Nome do exercício",
              "repsOrTime": "12 reps" ou "40s",
              "rest": "60s",
              "sets": 3,
              "equipment": "sem_equipamento|com_equipamento"
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um PERSONAL TRAINER ESPECIALISTA CREF com vasta experiência. Sempre retorne apenas JSON válido, sem texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        response_format: { type: "json_object" }
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

    // Adicionar timestamps e IDs se necessário
    const planToSave = {
      ...workoutPlan,
      createdAt: new Date().toISOString()
    };

    // Salvar o plano no banco
    const { data: savedPlan, error: saveError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        plan_name: workoutPlan.name,
        plan_data: planToSave
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar plano:', saveError);
      throw new Error('Erro ao salvar plano');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      plan: {
        id: savedPlan.id,
        name: workoutPlan.name,
        objective: workoutPlan.objective,
        level: workoutPlan.level,
        durationMinutes: workoutPlan.durationMinutes,
        type: workoutPlan.type,
        series: workoutPlan.series,
        createdAt: savedPlan.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-workout:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});