import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coffee, 
  Sun, 
  Moon, 
  Cookie, 
  Utensils,
  RefreshCw,
  Trash2,
  Calendar
} from 'lucide-react';
import { DailyPlan, Food } from '@/hooks/useDailyMealPlan';
import { FoodSubstitutionModal } from './FoodSubstitutionModal';

interface DailyMealPlanProps {
  dailyPlan: DailyPlan;
  onSubstituteFood: (mealId: string, foodIndex: number, newFood: Food) => void;
  onRemoveMeal: (mealId: string) => void;
  onClearPlan: () => void;
}

export const DailyMealPlan = ({ 
  dailyPlan, 
  onSubstituteFood, 
  onRemoveMeal,
  onClearPlan 
}: DailyMealPlanProps) => {
  const [substitutionModal, setSubstitutionModal] = useState<{
    open: boolean;
    mealId: string;
    foodIndex: number;
    currentFood: Food | null;
  }>({
    open: false,
    mealId: '',
    foodIndex: -1,
    currentFood: null
  });

  const mealTypeIcons = {
    cafe_da_manha: Coffee,
    almoco: Sun,
    lanche: Cookie,
    jantar: Moon,
    ceia: Utensils
  };

  const mealTypeLabels = {
    cafe_da_manha: 'Café da Manhã',
    almoco: 'Almoço',
    lanche: 'Lanche',
    jantar: 'Jantar',
    ceia: 'Ceia'
  };

  const goalLabels = {
    emagrecimento: 'Emagrecimento',
    ganho_massa: 'Ganho de Massa',
    manutencao: 'Manutenção'
  };

  const openSubstitutionModal = (mealId: string, foodIndex: number, food: Food) => {
    setSubstitutionModal({
      open: true,
      mealId,
      foodIndex,
      currentFood: food
    });
  };

  const handleSubstitute = (newFood: Food) => {
    onSubstituteFood(substitutionModal.mealId, substitutionModal.foodIndex, newFood);
    setSubstitutionModal({ open: false, mealId: '', foodIndex: -1, currentFood: null });
  };

  // Sort meals by typical meal order
  const mealOrder = ['cafe_da_manha', 'almoco', 'lanche', 'jantar', 'ceia'];
  const sortedMeals = [...dailyPlan.meals].sort((a, b) => 
    mealOrder.indexOf(a.meal_type) - mealOrder.indexOf(b.meal_type)
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-background to-muted/20 border-white/10">
        <CardHeader>
          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/15">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Meu Plano de Hoje</CardTitle>
                <CardDescription>
                  {new Date(dailyPlan.date).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {goalLabels[dailyPlan.goal]}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearPlan}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Plano
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Daily Totals */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Totais do Dia
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{dailyPlan.dailyTotals.calories}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">kcal</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-500">{dailyPlan.dailyTotals.protein}g</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">proteína</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-3xl font-bold text-amber-500">{dailyPlan.dailyTotals.carbs}g</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">carboidratos</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-500">{dailyPlan.dailyTotals.fat}g</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">gorduras</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Refeições do Dia</h3>
            {sortedMeals.map((meal) => {
              const MealIcon = mealTypeIcons[meal.meal_type];
              
              return (
                <Card key={meal.id} className="bg-gradient-to-b from-muted/10 to-background/50 border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/15">
                          <MealIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{meal.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {mealTypeLabels[meal.meal_type]} • {meal.totals.calories} kcal • {meal.totals.protein}g proteína
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMeal(meal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    {meal.foods.map((food, foodIndex) => (
                      <div 
                        key={foodIndex} 
                        className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{food.name}</p>
                          <p className="text-sm text-muted-foreground">{food.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-right">
                            <span className="font-semibold">{food.calories} kcal</span>
                            <div className="text-xs text-muted-foreground">
                              P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSubstitutionModal(meal.id, foodIndex, food)}
                            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Substituir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {substitutionModal.currentFood && (
        <FoodSubstitutionModal
          open={substitutionModal.open}
          onOpenChange={(open) => setSubstitutionModal({ ...substitutionModal, open })}
          currentFood={substitutionModal.currentFood}
          goal={dailyPlan.goal}
          onSubstitute={handleSubstitute}
        />
      )}
    </div>
  );
};
