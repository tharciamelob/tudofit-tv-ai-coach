import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from 'lucide-react';
import { Food } from '@/hooks/useDailyMealPlan';
import { useFoodDatabase, FoodItem } from '@/hooks/useFoodDatabase';

interface FoodSubstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFood: Food;
  goal: 'emagrecimento' | 'ganho_massa' | 'manutencao';
  onSubstitute: (newFood: Food) => void;
}

// Mock food database - in production, this would come from API/Supabase
const foodDatabase: Food[] = [
  // Proteínas
  { name: 'Peito de frango grelhado', quantity: '100g', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Filé de tilápia', quantity: '100g', calories: 96, protein: 20, carbs: 0, fat: 2 },
  { name: 'Atum em lata', quantity: '100g', calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: 'Ovos cozidos', quantity: '2 unidades', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: 'Whey protein', quantity: '30g', calories: 120, protein: 24, carbs: 2, fat: 1 },
  
  // Carboidratos
  { name: 'Arroz integral', quantity: '100g cozido', calories: 111, protein: 3, carbs: 23, fat: 1 },
  { name: 'Batata doce', quantity: '100g', calories: 86, protein: 2, carbs: 20, fat: 0 },
  { name: 'Aveia', quantity: '50g', calories: 190, protein: 7, carbs: 32, fat: 3 },
  { name: 'Pão integral', quantity: '2 fatias', calories: 160, protein: 6, carbs: 30, fat: 2 },
  { name: 'Quinoa', quantity: '100g cozida', calories: 120, protein: 4, carbs: 21, fat: 2 },
  
  // Frutas
  { name: 'Banana', quantity: '1 unidade média', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Maçã', quantity: '1 unidade média', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Morango', quantity: '100g', calories: 32, protein: 1, carbs: 8, fat: 0 },
  { name: 'Abacate', quantity: '1/2 unidade', calories: 160, protein: 2, carbs: 9, fat: 15 },
  
  // Gorduras saudáveis
  { name: 'Azeite extra virgem', quantity: '1 col. sopa', calories: 120, protein: 0, carbs: 0, fat: 14 },
  { name: 'Pasta de amendoim', quantity: '20g', calories: 120, protein: 5, carbs: 4, fat: 10 },
  { name: 'Castanha do Pará', quantity: '3 unidades', calories: 60, protein: 1, carbs: 1, fat: 6 },
  { name: 'Nozes', quantity: '10g', calories: 65, protein: 2, carbs: 1, fat: 6 },
  
  // Laticínios
  { name: 'Iogurte grego natural', quantity: '150g', calories: 100, protein: 15, carbs: 6, fat: 0 },
  { name: 'Queijo cottage', quantity: '50g', calories: 55, protein: 7, carbs: 2, fat: 2 },
  { name: 'Leite desnatado', quantity: '200ml', calories: 68, protein: 7, carbs: 10, fat: 0 },
  
  // Vegetais
  { name: 'Brócolis', quantity: '100g', calories: 35, protein: 3, carbs: 7, fat: 0 },
  { name: 'Salada verde mista', quantity: '1 prato', calories: 25, protein: 2, carbs: 5, fat: 0 },
  { name: 'Cenoura refogada', quantity: '80g', calories: 35, protein: 1, carbs: 8, fat: 0 },
  { name: 'Aspargos', quantity: '100g', calories: 20, protein: 2, carbs: 4, fat: 0 },
];

export const FoodSubstitutionModal = ({ 
  open, 
  onOpenChange, 
  currentFood, 
  goal,
  onSubstitute 
}: FoodSubstitutionModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchFoods, searchOrCreateFood, loading } = useFoodDatabase();

  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchFoods(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateFood = async () => {
    if (!searchTerm) return;
    
    const newFood = await searchOrCreateFood(searchTerm);
    if (newFood) {
      // Convert FoodItem to Food format (with quantity)
      const foodToSubstitute: Food = {
        name: newFood.name,
        quantity: currentFood.quantity, // Keep same quantity
        calories: Math.round(newFood.kcal_per_100g * parseQuantity(currentFood.quantity) / 100),
        protein: Math.round(newFood.protein_per_100g * parseQuantity(currentFood.quantity) / 100),
        carbs: Math.round(newFood.carbs_per_100g * parseQuantity(currentFood.quantity) / 100),
        fat: Math.round(newFood.fat_per_100g * parseQuantity(currentFood.quantity) / 100),
      };
      onSubstitute(foodToSubstitute);
      onOpenChange(false);
    }
  };

  const parseQuantity = (quantity: string): number => {
    const match = quantity.match(/(\d+)/);
    return match ? parseInt(match[1]) : 100;
  };

  const convertFoodItemToFood = (item: FoodItem): Food => {
    const qty = parseQuantity(currentFood.quantity);
    return {
      name: item.name,
      quantity: currentFood.quantity,
      calories: Math.round(item.kcal_per_100g * qty / 100),
      protein: Math.round(item.protein_per_100g * qty / 100),
      carbs: Math.round(item.carbs_per_100g * qty / 100),
      fat: Math.round(item.fat_per_100g * qty / 100),
    };
  };

  const getCategoryFromMacros = (food: Food): string => {
    const totalMacros = food.protein + food.carbs + food.fat;
    const proteinRatio = food.protein / totalMacros;
    const carbsRatio = food.carbs / totalMacros;
    const fatRatio = food.fat / totalMacros;

    if (proteinRatio > 0.5) return 'proteina';
    if (carbsRatio > 0.5) return 'carboidrato';
    if (fatRatio > 0.4) return 'gordura';
    if (food.calories < 50) return 'vegetal';
    return 'geral';
  };

  const getEquivalentFoods = (): Food[] => {
    const currentCategory = getCategoryFromMacros(currentFood);
    const calorieRange = currentFood.calories * 0.15; // ±15%
    
    let filtered = foodDatabase.filter(food => {
      const foodCategory = getCategoryFromMacros(food);
      const caloriesMatch = Math.abs(food.calories - currentFood.calories) <= calorieRange;
      return foodCategory === currentCategory && caloriesMatch && food.name !== currentFood.name;
    });

    // Sort by goal preference
    if (goal === 'emagrecimento') {
      filtered.sort((a, b) => a.calories - b.calories);
    } else if (goal === 'ganho_massa') {
      filtered.sort((a, b) => b.protein - a.protein);
    }

    return filtered.slice(0, 8);
  };


  const getCalorieDifference = (newFood: Food) => {
    const diff = newFood.calories - currentFood.calories;
    const percentDiff = (diff / currentFood.calories) * 100;
    return { diff, percentDiff };
  };

  const FoodCard = ({ food }: { food: Food }) => {
    const { diff, percentDiff } = getCalorieDifference(food);
    const isHigher = diff > 0;
    const isSignificant = Math.abs(percentDiff) > 15;

    return (
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
        onClick={() => {
          onSubstitute(food);
          onOpenChange(false);
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{food.name}</h4>
                <p className="text-xs text-muted-foreground">{food.quantity}</p>
              </div>
              {isSignificant && (
                <Badge variant={isHigher ? "destructive" : "secondary"} className="text-xs">
                  {isHigher ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(Math.round(percentDiff))}%
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center p-2 bg-primary/5 rounded">
                <div className="font-bold text-primary">{food.calories}</div>
                <div className="text-muted-foreground">kcal</div>
              </div>
              <div className="text-center p-2 bg-blue-500/5 rounded">
                <div className="font-bold text-blue-500">{food.protein}g</div>
                <div className="text-muted-foreground">prot</div>
              </div>
              <div className="text-center p-2 bg-amber-500/5 rounded">
                <div className="font-bold text-amber-500">{food.carbs}g</div>
                <div className="text-muted-foreground">carb</div>
              </div>
              <div className="text-center p-2 bg-purple-500/5 rounded">
                <div className="font-bold text-purple-500">{food.fat}g</div>
                <div className="text-muted-foreground">gord</div>
              </div>
            </div>

            {diff !== 0 && (
              <div className="flex items-center justify-center gap-1 text-xs">
                {isHigher ? (
                  <span className="text-red-500">+{diff} kcal</span>
                ) : diff < 0 ? (
                  <span className="text-green-500">{diff} kcal</span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Minus className="h-3 w-3" />
                    Mesmas calorias
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const equivalentFoods = getEquivalentFoods();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Substituir Alimento</DialogTitle>
          <DialogDescription>
            Escolha um alimento equivalente para substituir
          </DialogDescription>
        </DialogHeader>

        {/* Current Food Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Alimento Atual</h4>
              <Badge variant="outline">Original</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-medium">{currentFood.name}</p>
                <p className="text-sm text-muted-foreground">{currentFood.quantity}</p>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-semibold">{currentFood.calories} kcal</span>
                <span>P: {currentFood.protein}g</span>
                <span>C: {currentFood.carbs}g</span>
                <span>G: {currentFood.fat}g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions">Sugestões Equivalentes</TabsTrigger>
            <TabsTrigger value="search">Buscar Alimento</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {equivalentFoods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {equivalentFoods.map((food, index) => (
                  <FoodCard key={index} food={food} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Não encontramos equivalentes próximos. Tente buscar manualmente.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o nome do alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((item) => (
                  <FoodCard key={item.id} food={convertFoodItemToFood(item)} />
                ))}
              </div>
            ) : searchTerm && !isSearching && searchResults.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  Nenhum alimento encontrado com "{searchTerm}"
                </p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Criar com IA</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Não encontramos esse alimento. A IA pode criar uma estimativa nutricional para você.
                    </p>
                    <Button 
                      onClick={handleCreateFood}
                      disabled={loading}
                      className="w-full gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Criar "{searchTerm}" com IA
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : searchTerm && isSearching ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Digite para buscar alimentos
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
