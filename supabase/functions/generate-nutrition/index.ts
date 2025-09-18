import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, image_url, meal_type } = await req.json();
    
    console.log('Received request:', { text: !!text, image_url: !!image_url, meal_type });

    // Validate inputs
    if (!text && !image_url) {
      return new Response(JSON.stringify({
        error: "É necessário fornecer 'text' ou 'image_url'"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({
        error: "Chave da OpenAI não configurada",
        details: "Entre em contato com o administrador"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Test image URL accessibility if provided
    if (image_url) {
      try {
        const imageResponse = await fetch(image_url, { method: 'HEAD' });
        if (!imageResponse.ok) {
          return new Response(JSON.stringify({
            error: "Imagem inacessível",
            details: `Status: ${imageResponse.status}`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('Error testing image URL:', error);
        return new Response(JSON.stringify({
          error: "Imagem inacessível",
          details: "Não foi possível acessar a URL da imagem"
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Normalize meal_type
    const normalizeMealType = (type?: string): string => {
      if (!type) return 'lanche';
      
      const normalizedType = type.toLowerCase().trim();
      
      // Map PT-BR to standard
      const ptBrMap: { [key: string]: string } = {
        'café da manhã': 'cafe_da_manha',
        'cafe da manha': 'cafe_da_manha',
        'café_da_manhã': 'cafe_da_manha',
        'almoço': 'almoco',
        'almoco': 'almoco',
        'jantar': 'jantar',
        'lanche': 'lanche',
        'lanche da manhã': 'lanche',
        'lanche da tarde': 'lanche',
        'pré treino': 'pre_treino',
        'pre treino': 'pre_treino',
        'pré-treino': 'pre_treino',
        'pre-treino': 'pre_treino',
        'pós treino': 'pos_treino',
        'pos treino': 'pos_treino',
        'pós-treino': 'pos_treino',
        'pos-treino': 'pos_treino'
      };

      // Map EN to standard
      const enMap: { [key: string]: string } = {
        'breakfast': 'breakfast',
        'lunch': 'lunch',
        'dinner': 'dinner',
        'snack': 'snack'
      };

      return ptBrMap[normalizedType] || enMap[normalizedType] || 'lanche';
    };

    const normalizedMealType = normalizeMealType(meal_type);

    // Prepare OpenAI messages
    const messages: any[] = [
      {
        role: "system",
        content: `Você é um nutricionista expert em análise nutricional. 
Analise a imagem ou descrição da refeição e retorne APENAS um objeto JSON válido no seguinte formato:

{
  "ok": true,
  "meal_type": "tipo_da_refeicao",
  "foods": [
    {
      "name": "nome_do_alimento",
      "quantity": "quantidade_estimada (ex: 1 unidade, 100g, 1 xícara)",
      "calories": numero,
      "protein": numero,
      "carbs": numero,
      "fat": numero
    }
  ],
  "totals": {
    "calories": numero_total,
    "protein": numero_total,
    "carbs": numero_total,
    "fat": numero_total
  }
}

IMPORTANTE:
- Se não conseguir identificar o alimento, retorne { "ok": false, "error": "Não foi possível identificar o alimento na imagem" }
- Sempre use números inteiros para os valores nutricionais
- Identifique CADA alimento separadamente no array "foods"
- Some todos os valores no objeto "totals"
- Para meal_type, use: "cafe_da_manha", "almoco", "lanche", "jantar", ou "ceia"
- Para estimativas de quantidade, seja específico (ex: "1 fatia média", "150g", "1 copo")
- RETORNE APENAS O JSON, sem texto adicional`
      }
    ];

    if (text) {
      messages.push({
        role: "user",
        content: `Analise esta refeição: "${text}"`
      });
    } else if (image_url) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Analise os alimentos nesta imagem e calcule os valores nutricionais totais."
          },
          {
            type: "image_url",
            image_url: {
              url: image_url
            }
          }
        ]
      });
    }

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 150,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      return new Response(JSON.stringify({
        error: "Erro na API da OpenAI",
        details: `Status ${response.status}: ${errorData}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('OpenAI Response:', data);

    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      console.error('No content in OpenAI response');
      return new Response(JSON.stringify({
        error: "Resposta vazia da IA",
        details: "A IA não retornou análise nutricional"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let nutrition;
    try {
      nutrition = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, 'Content:', aiContent);
      return new Response(JSON.stringify({
        error: "Erro ao processar resposta da IA",
        details: "Formato de resposta inválido"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate nutrition object
    if (!nutrition.ok) {
      return new Response(JSON.stringify({
        error: nutrition.error || "Erro na análise nutricional",
        details: "A IA não conseguiu processar a refeição"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!nutrition.foods || !Array.isArray(nutrition.foods) || nutrition.foods.length === 0) {
      console.error('Invalid nutrition format - no foods:', nutrition);
      return new Response(JSON.stringify({
        error: "Nenhum alimento identificado",
        details: "A IA não conseguiu identificar alimentos na refeição"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate each food item
    for (const food of nutrition.foods) {
      if (!food.name || typeof food.calories !== 'number' ||
          typeof food.protein !== 'number' || typeof food.carbs !== 'number' || 
          typeof food.fat !== 'number' || !food.quantity) {
        console.error('Invalid food format:', food);
        return new Response(JSON.stringify({
          error: "Formato de dados nutricionais inválido",
          details: "Dados nutricionais incompletos para um dos alimentos"
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate totals
    if (!nutrition.totals || 
        typeof nutrition.totals.calories !== 'number' ||
        typeof nutrition.totals.protein !== 'number' ||
        typeof nutrition.totals.carbs !== 'number' ||
        typeof nutrition.totals.fat !== 'number') {
      console.error('Invalid totals format:', nutrition.totals);
      return new Response(JSON.stringify({
        error: "Formato de totais nutricionais inválido",
        details: "Totais nutricionais incompletos"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = {
      ok: true,
      meal_type: normalizedMealType,
      foods: nutrition.foods.map((food: any) => ({
        name: food.name,
        quantity: food.quantity,
        calories: Math.round(food.calories),
        protein: Number((food.protein || 0).toFixed(1)),
        carbs: Number((food.carbs || 0).toFixed(1)),
        fat: Number((food.fat || 0).toFixed(1))
      })),
      totals: {
        calories: Math.round(nutrition.totals.calories),
        protein: Number((nutrition.totals.protein || 0).toFixed(1)),
        carbs: Number((nutrition.totals.carbs || 0).toFixed(1)),
        fat: Number((nutrition.totals.fat || 0).toFixed(1))
      }
    };

    console.log('Final result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in generate-nutrition function:', error);
    return new Response(JSON.stringify({
      error: "Erro interno do servidor",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});