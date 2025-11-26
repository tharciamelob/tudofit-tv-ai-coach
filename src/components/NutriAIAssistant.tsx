import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DailyPlan, MealPlan } from '@/hooks/useDailyMealPlan';

interface NutriAIAssistantProps {
  userGoal?: 'emagrecimento' | 'ganho_massa' | 'manutencao';
  onPlanGenerated: (plan: DailyPlan) => void;
}

export const NutriAIAssistant = ({ userGoal = 'manutencao', onPlanGenerated }: NutriAIAssistantProps) => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nutri-ai', {
        body: {
          action: 'generate_meal_plan',
          userGoal: userGoal
        }
      });

      if (error) throw error;

      if (data?.success && data?.plan) {
        const generatedPlan = data.plan;
        
        // Transform AI plan to DailyPlan format
        const meals: MealPlan[] = generatedPlan.meals.map((meal: any) => ({
          id: crypto.randomUUID(),
          name: meal.name,
          description: 'Gerado pela IA',
          goal: userGoal,
          meal_type: meal.meal_type,
          foods: meal.foods.map((food: any) => ({
            ...food,
            portion_grams: parseFloat(food.quantity) || 100
          })),
          totals: meal.foods.reduce((acc: any, food: any) => ({
            calories: acc.calories + food.calories,
            protein: acc.protein + food.protein,
            carbs: acc.carbs + food.carbs,
            fat: acc.fat + food.fat,
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
        }));

        const dailyPlan: DailyPlan = {
          date: new Date().toISOString().split('T')[0],
          basePlanName: generatedPlan.plan_name,
          goal: userGoal,
          meals: meals,
          dailyTotals: meals.reduce((acc, meal) => ({
            calories: acc.calories + meal.totals.calories,
            protein: acc.protein + meal.totals.protein,
            carbs: acc.carbs + meal.totals.carbs,
            fat: acc.fat + meal.totals.fat,
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
        };

        onPlanGenerated(dailyPlan);

        toast({
          title: "Plano gerado com sucesso!",
          description: `${generatedPlan.plan_name} foi criado para você.`,
        });
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Erro ao gerar plano",
        description: "Não foi possível gerar o plano nutricional. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-b from-background to-muted/20">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Nutri IA</CardTitle>
            <CardDescription>Assistente Inteligente de Nutrição</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="text-xs">
            Planos Personalizados
          </Badge>
          <Badge variant="outline" className="text-xs">
            Substituições Inteligentes
          </Badge>
          <Badge variant="outline" className="text-xs">
            Análise Nutricional
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Tire dúvidas sobre nutrição, ajuste seu plano ou peça sugestões personalizadas:
          </p>
          <Textarea
            placeholder="Ex: Como trocar arroz por batata doce? Preciso de um lanche com 200 kcal..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <Button 
            variant="outline" 
            className="w-full gap-2"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
            Enviar Mensagem
          </Button>
        </div>

        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Plano Completo com IA
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie um plano nutricional personalizado com 5 refeições baseado no seu objetivo.
          </p>
          <Button 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando plano...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Gerar Plano Nutricional com IA
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
