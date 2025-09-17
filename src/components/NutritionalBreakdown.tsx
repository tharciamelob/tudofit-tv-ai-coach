import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Scale, Zap, Drumstick, Cookie, Droplet } from "lucide-react";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photo_url?: string;
}

interface NutritionalBreakdownProps {
  foods: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const NutritionalBreakdown = ({ foods, totals }: NutritionalBreakdownProps) => {
  const getMacroColor = (macro: string) => {
    switch (macro) {
      case 'protein':
        return 'bg-blue-500';
      case 'carbs':
        return 'bg-green-500';
      case 'fat':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMacroPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Total */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Resumo Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totals.calories}</div>
              <div className="text-sm text-muted-foreground">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{totals.protein}g</div>
              <div className="text-sm text-muted-foreground">Proteína</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{totals.carbs}g</div>
              <div className="text-sm text-muted-foreground">Carboidrato</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{totals.fat}g</div>
              <div className="text-sm text-muted-foreground">Gordura</div>
            </div>
          </div>

          {/* Barras de Macros */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Drumstick className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Proteína</span>
                  <span>{totals.protein}g</span>
                </div>
                <Progress value={getMacroPercentage(totals.protein * 4, totals.calories)} className="h-2">
                  <div className={`${getMacroColor('protein')} h-full rounded-full transition-all`} />
                </Progress>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Cookie className="h-4 w-4 text-green-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Carboidrato</span>
                  <span>{totals.carbs}g</span>
                </div>
                <Progress value={getMacroPercentage(totals.carbs * 4, totals.calories)} className="h-2">
                  <div className={`${getMacroColor('carbs')} h-full rounded-full transition-all`} />
                </Progress>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Droplet className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Gordura</span>
                  <span>{totals.fat}g</span>
                </div>
                <Progress value={getMacroPercentage(totals.fat * 9, totals.calories)} className="h-2">
                  <div className={`${getMacroColor('fat')} h-full rounded-full transition-all`} />
                </Progress>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alimentos Individuais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Alimentos Identificados
        </h3>
        
        {foods.map((food, index) => (
          <Card key={index} className="border-white/10 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {food.photo_url && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={food.photo_url} 
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{food.name}</h4>
                      <div className="flex items-center gap-2">
                        <Scale className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{food.quantity}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {food.calories} kcal
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-500">{food.protein}g</div>
                      <div className="text-xs text-muted-foreground">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-500">{food.carbs}g</div>
                      <div className="text-xs text-muted-foreground">Carboidrato</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-500">{food.fat}g</div>
                      <div className="text-xs text-muted-foreground">Gordura</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};