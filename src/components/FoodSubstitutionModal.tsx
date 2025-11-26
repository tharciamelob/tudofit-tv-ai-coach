import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Sparkles } from "lucide-react";
import { Food } from "@/hooks/useDailyMealPlan";
import { useFoodDatabase, FoodItem } from "@/hooks/useFoodDatabase";
import { useToast } from "@/hooks/use-toast";

interface FoodSubstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFood: Food;
  goal: 'emagrecimento' | 'ganho_massa' | 'manutencao';
  onSubstitute: (newFood: Food) => void;
}

export function FoodSubstitutionModal({
  open,
  onOpenChange,
  currentFood,
  goal,
  onSubstitute,
}: FoodSubstitutionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [portionGrams, setPortionGrams] = useState(currentFood.portion_grams || 100);
  const { searchFoods, searchOrCreateFood, loading } = useFoodDatabase();
  const { toast } = useToast();

  // Recalculate current food nutrition based on portion
  const currentNutrition = currentFood.id ? {
    calories: Math.round((currentFood.calories * portionGrams) / currentFood.portion_grams),
    protein: Math.round((currentFood.protein * portionGrams) / currentFood.portion_grams),
    carbs: Math.round((currentFood.carbs * portionGrams) / currentFood.portion_grams),
    fat: Math.round((currentFood.fat * portionGrams) / currentFood.portion_grams),
  } : {
    calories: currentFood.calories,
    protein: currentFood.protein,
    carbs: currentFood.carbs,
    fat: currentFood.fat,
  };

  const calculatePortionNutrition = (food: FoodItem, grams: number) => ({
    calories: Math.round((food.kcal_per_100g * grams) / 100),
    protein: Math.round((food.protein_per_100g * grams) / 100),
    carbs: Math.round((food.carbs_per_100g * grams) / 100),
    fat: Math.round((food.fat_per_100g * grams) / 100),
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    const results = await searchFoods(searchTerm);
    setSearchResults(results);
  };

  const handleCreateWithAI = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Digite um alimento",
        description: "Por favor, digite o nome do alimento que deseja buscar.",
        variant: "destructive",
      });
      return;
    }

    const newFood = await searchOrCreateFood(searchTerm);
    if (newFood) {
      setSearchResults([newFood]);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    const nutrition = calculatePortionNutrition(food, portionGrams);
    
    const calorieDiff = Math.abs(nutrition.calories - currentNutrition.calories);
    const percentDiff = (calorieDiff / currentNutrition.calories) * 100;
    
    if (percentDiff > 20) {
      const changeType = nutrition.calories > currentNutrition.calories ? 'aumentou' : 'diminuiu';
      const confirmed = window.confirm(
        `Essa substituição ${changeType} bastante as calorias da refeição (${Math.round(percentDiff)}%). Deseja continuar?`
      );
      if (!confirmed) return;
    }

    const newFood: Food = {
      id: food.id,
      name: food.name,
      quantity: `${portionGrams}g`,
      portion_grams: portionGrams,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
    };

    onSubstitute(newFood);
    onOpenChange(false);
  };

  const handlePortionChange = (newGrams: number) => {
    if (newGrams > 0 && newGrams <= 1000) {
      setPortionGrams(newGrams);
    }
  };

  const handleUpdatePortion = () => {
    if (!currentFood.id) return;
    
    const updatedFood: Food = {
      ...currentFood,
      portion_grams: portionGrams,
      quantity: `${portionGrams}g`,
      calories: currentNutrition.calories,
      protein: currentNutrition.protein,
      carbs: currentNutrition.carbs,
      fat: currentNutrition.fat,
    };
    
    onSubstitute(updatedFood);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Substituir Alimento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Food Info with Portion Editor */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h3 className="font-semibold">Alimento atual</h3>
            <p className="text-sm">{currentFood.name}</p>
            
            {/* Portion Editor */}
            <div className="flex items-center gap-2 pt-2">
              <label className="text-sm font-medium">Quantidade:</label>
              <Input
                type="number"
                value={portionGrams}
                onChange={(e) => handlePortionChange(Number(e.target.value))}
                className="w-24"
                min="1"
                max="1000"
              />
              <span className="text-sm">g</span>
              {currentFood.id && (
                <Button
                  size="sm"
                  onClick={handleUpdatePortion}
                  className="ml-auto"
                >
                  Atualizar Quantidade
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-sm mt-2">
              <div>
                <span className="text-muted-foreground">Calorias:</span>
                <p className="font-semibold">{currentNutrition.calories} kcal</p>
              </div>
              <div>
                <span className="text-muted-foreground">Proteína:</span>
                <p className="font-semibold">{currentNutrition.protein}g</p>
              </div>
              <div>
                <span className="text-muted-foreground">Carboidratos:</span>
                <p className="font-semibold">{currentNutrition.carbs}g</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gorduras:</span>
                <p className="font-semibold">{currentNutrition.fat}g</p>
              </div>
            </div>
          </div>

          {/* Tabs for Search */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="search">Buscar outro alimento</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome do alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {searchResults.map((food) => {
                      const nutrition = calculatePortionNutrition(food, portionGrams);
                      return (
                        <button
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{food.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {nutrition.calories} kcal • {nutrition.protein}g proteína
                                {food.category && ` • ${food.category}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : searchTerm && !loading ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-muted-foreground">
                    Nenhum alimento encontrado com "{searchTerm}"
                  </p>
                  <Button onClick={handleCreateWithAI} disabled={loading}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Criar com IA
                  </Button>
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
