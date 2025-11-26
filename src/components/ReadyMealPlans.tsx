import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coffee, 
  Sun, 
  Moon, 
  Cookie, 
  Target, 
  Zap, 
  Heart, 
  Clock,
  CheckCircle2,
  Utensils
} from 'lucide-react';

interface MealPlan {
  id: string;
  name: string;
  description: string;
  goal: 'emagrecimento' | 'ganho_massa' | 'manutencao';
  meal_type: 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'ceia';
  foods: {
    name: string;
    quantity: string;
    portion_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const readyMealPlans: MealPlan[] = [
  // Café da manhã
  {
    id: 'cafe_emagrecimento_1',
    name: 'Café Proteico Light',
    description: 'Rico em proteína, baixo em carboidratos',
    goal: 'emagrecimento',
    meal_type: 'cafe_da_manha',
    foods: [
      { name: 'Ovos mexidos', quantity: '2 ovos', portion_grams: 100, calories: 140, protein: 12, carbs: 1, fat: 10 },
      { name: 'Torrada integral', quantity: '1 fatia', portion_grams: 30, calories: 80, protein: 3, carbs: 15, fat: 1 },
      { name: 'Abacate', quantity: '1/4 unidade', portion_grams: 50, calories: 80, protein: 1, carbs: 4, fat: 7 }
    ],
    totals: { calories: 300, protein: 16, carbs: 20, fat: 18 }
  },
  {
    id: 'cafe_ganho_massa_1',
    name: 'Café Energético',
    description: 'Alto valor calórico e proteico',
    goal: 'ganho_massa',
    meal_type: 'cafe_da_manha',
    foods: [
      { name: 'Aveia', quantity: '50g', portion_grams: 50, calories: 190, protein: 7, carbs: 32, fat: 3 },
      { name: 'Banana', quantity: '1 unidade média', portion_grams: 105, calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: 'Whey protein', quantity: '30g', portion_grams: 30, calories: 120, protein: 24, carbs: 2, fat: 1 },
      { name: 'Amendoim', quantity: '20g', portion_grams: 20, calories: 115, protein: 5, carbs: 3, fat: 10 }
    ],
    totals: { calories: 530, protein: 37, carbs: 64, fat: 14 }
  },
  // Almoço
  {
    id: 'almoco_emagrecimento_1',
    name: 'Salada Completa',
    description: 'Leve e nutritiva com proteína magra',
    goal: 'emagrecimento',
    meal_type: 'almoco',
    foods: [
      { name: 'Peito de frango grelhado', quantity: '120g', portion_grams: 120, calories: 165, protein: 31, carbs: 0, fat: 4 },
      { name: 'Salada verde mista', quantity: '1 prato', portion_grams: 100, calories: 25, protein: 2, carbs: 5, fat: 0 },
      { name: 'Tomate cereja', quantity: '10 unidades', portion_grams: 50, calories: 20, protein: 1, carbs: 4, fat: 0 },
      { name: 'Azeite extra virgem', quantity: '1 colher de chá', portion_grams: 5, calories: 40, protein: 0, carbs: 0, fat: 4 }
    ],
    totals: { calories: 250, protein: 34, carbs: 9, fat: 8 }
  },
  {
    id: 'almoco_ganho_massa_1',
    name: 'Prato Completo',
    description: 'Carboidrato, proteína e vegetais',
    goal: 'ganho_massa',
    meal_type: 'almoco',
    foods: [
      { name: 'Arroz integral', quantity: '100g cozido', portion_grams: 100, calories: 111, protein: 3, carbs: 23, fat: 1 },
      { name: 'Feijão carioca', quantity: '80g', portion_grams: 80, calories: 77, protein: 5, carbs: 14, fat: 0 },
      { name: 'Peito de frango', quantity: '150g', portion_grams: 150, calories: 206, protein: 39, carbs: 0, fat: 5 },
      { name: 'Brócolis refogado', quantity: '100g', portion_grams: 100, calories: 35, protein: 3, carbs: 7, fat: 0 }
    ],
    totals: { calories: 429, protein: 50, carbs: 44, fat: 6 }
  },
  // Lanche
  {
    id: 'lanche_emagrecimento_1',
    name: 'Lanche Light',
    description: 'Saciante e com poucas calorias',
    goal: 'emagrecimento',
    meal_type: 'lanche',
    foods: [
      { name: 'Iogurte grego natural', quantity: '150g', portion_grams: 150, calories: 100, protein: 15, carbs: 6, fat: 0 },
      { name: 'Castanha do Pará', quantity: '3 unidades', portion_grams: 10, calories: 60, protein: 1, carbs: 1, fat: 6 }
    ],
    totals: { calories: 160, protein: 16, carbs: 7, fat: 6 }
  },
  {
    id: 'lanche_ganho_massa_1',
    name: 'Lanche Energético',
    description: 'Rico em carboidratos e proteínas',
    goal: 'ganho_massa',
    meal_type: 'lanche',
    foods: [
      { name: 'Pão integral', quantity: '2 fatias', portion_grams: 60, calories: 160, protein: 6, carbs: 30, fat: 2 },
      { name: 'Pasta de amendoim', quantity: '20g', portion_grams: 20, calories: 120, protein: 5, carbs: 4, fat: 10 },
      { name: 'Banana', quantity: '1/2 unidade', portion_grams: 50, calories: 53, protein: 1, carbs: 13, fat: 0 }
    ],
    totals: { calories: 333, protein: 12, carbs: 47, fat: 12 }
  },
  // Jantar
  {
    id: 'jantar_emagrecimento_1',
    name: 'Jantar Leve',
    description: 'Baixo em carboidratos, rico em proteína',
    goal: 'emagrecimento',
    meal_type: 'jantar',
    foods: [
      { name: 'Salmão grelhado', quantity: '120g', portion_grams: 120, calories: 208, protein: 22, carbs: 0, fat: 12 },
      { name: 'Aspargos grelhados', quantity: '150g', portion_grams: 150, calories: 30, protein: 3, carbs: 6, fat: 0 },
      { name: 'Salada de rúcula', quantity: '1 prato', portion_grams: 100, calories: 20, protein: 2, carbs: 3, fat: 0 }
    ],
    totals: { calories: 258, protein: 27, carbs: 9, fat: 12 }
  },
  {
    id: 'jantar_ganho_massa_1',
    name: 'Jantar Completo',
    description: 'Alto valor proteico com carboidratos',
    goal: 'ganho_massa',
    meal_type: 'jantar',
    foods: [
      { name: 'Batata doce', quantity: '150g', portion_grams: 150, calories: 130, protein: 2, carbs: 30, fat: 0 },
      { name: 'Frango grelhado', quantity: '180g', portion_grams: 180, calories: 247, protein: 47, carbs: 0, fat: 6 },
      { name: 'Brócolis no vapor', quantity: '100g', portion_grams: 100, calories: 35, protein: 3, carbs: 7, fat: 0 },
      { name: 'Azeite', quantity: '1 colher de sopa', portion_grams: 10, calories: 120, protein: 0, carbs: 0, fat: 14 }
    ],
    totals: { calories: 532, protein: 52, carbs: 37, fat: 20 }
  },
  {
    id: 'jantar_manutencao_1',
    name: 'Jantar Balanceado',
    description: 'Equilíbrio entre proteína e carboidratos',
    goal: 'manutencao',
    meal_type: 'jantar',
    foods: [
      { name: 'Filé de tilápia', quantity: '150g', portion_grams: 150, calories: 150, protein: 30, carbs: 0, fat: 3 },
      { name: 'Quinoa cozida', quantity: '80g', portion_grams: 80, calories: 120, protein: 4, carbs: 21, fat: 2 },
      { name: 'Legumes grelhados', quantity: '150g', portion_grams: 150, calories: 80, protein: 3, carbs: 15, fat: 1 },
      { name: 'Salada verde', quantity: '1 prato', portion_grams: 100, calories: 25, protein: 2, carbs: 5, fat: 0 }
    ],
    totals: { calories: 375, protein: 39, carbs: 41, fat: 6 }
  },
  {
    id: 'ceia_emagrecimento_1',
    name: 'Ceia Leve',
    description: 'Proteína pura para recuperação',
    goal: 'emagrecimento',
    meal_type: 'ceia',
    foods: [
      { name: 'Whey protein', quantity: '30g', portion_grams: 30, calories: 120, protein: 24, carbs: 2, fat: 1 },
      { name: 'Chá de camomila', quantity: '1 xícara', portion_grams: 200, calories: 0, protein: 0, carbs: 0, fat: 0 }
    ],
    totals: { calories: 120, protein: 24, carbs: 2, fat: 1 }
  },
  {
    id: 'ceia_ganho_massa_1',
    name: 'Ceia Proteica',
    description: 'Caseína para recuperação noturna',
    goal: 'ganho_massa',
    meal_type: 'ceia',
    foods: [
      { name: 'Cottage cheese', quantity: '150g', portion_grams: 150, calories: 120, protein: 18, carbs: 6, fat: 3 },
      { name: 'Aveia', quantity: '30g', portion_grams: 30, calories: 114, protein: 4, carbs: 19, fat: 2 },
      { name: 'Pasta de amendoim', quantity: '15g', portion_grams: 15, calories: 90, protein: 4, carbs: 3, fat: 8 }
    ],
    totals: { calories: 324, protein: 26, carbs: 28, fat: 13 }
  },
  {
    id: 'ceia_manutencao_1',
    name: 'Ceia Equilibrada',
    description: 'Leve e nutritiva para o sono',
    goal: 'manutencao',
    meal_type: 'ceia',
    foods: [
      { name: 'Iogurte grego', quantity: '150g', portion_grams: 150, calories: 100, protein: 15, carbs: 6, fat: 0 },
      { name: 'Nozes', quantity: '10g', portion_grams: 10, calories: 65, protein: 2, carbs: 1, fat: 6 },
      { name: 'Mel', quantity: '1 colher de chá', portion_grams: 5, calories: 20, protein: 0, carbs: 5, fat: 0 }
    ],
    totals: { calories: 185, protein: 17, carbs: 12, fat: 6 }
  },
  // Manutenção
  {
    id: 'cafe_manutencao_1',
    name: 'Café Energético Balanceado',
    description: 'Manutenção Energética',
    goal: 'manutencao',
    meal_type: 'cafe_da_manha',
    foods: [
      { name: 'Iogurte natural', quantity: '200g', portion_grams: 200, calories: 120, protein: 10, carbs: 12, fat: 3 },
      { name: 'Granola', quantity: '30g', portion_grams: 30, calories: 140, protein: 4, carbs: 20, fat: 5 },
      { name: 'Banana', quantity: '1 unidade média', portion_grams: 105, calories: 105, protein: 1, carbs: 27, fat: 0 },
      { name: 'Mel', quantity: '1 colher de chá', portion_grams: 5, calories: 20, protein: 0, carbs: 5, fat: 0 },
      { name: 'Ovos cozidos', quantity: '1 ovo', portion_grams: 50, calories: 70, protein: 6, carbs: 1, fat: 5 }
    ],
    totals: { calories: 455, protein: 21, carbs: 65, fat: 13 }
  },
  {
    id: 'almoco_manutencao_1',
    name: 'Prato Balanceado Completo',
    description: 'Manutenção Balanceada',
    goal: 'manutencao',
    meal_type: 'almoco',
    foods: [
      { name: 'Arroz integral', quantity: '80g cozido', portion_grams: 80, calories: 89, protein: 2, carbs: 18, fat: 1 },
      { name: 'Feijão preto', quantity: '60g', portion_grams: 60, calories: 66, protein: 4, carbs: 12, fat: 0 },
      { name: 'Filé de frango grelhado', quantity: '120g', portion_grams: 120, calories: 165, protein: 31, carbs: 0, fat: 4 },
      { name: 'Cenoura refogada', quantity: '80g', portion_grams: 80, calories: 35, protein: 1, carbs: 8, fat: 0 },
      { name: 'Salada verde', quantity: '1 prato', portion_grams: 100, calories: 25, protein: 2, carbs: 5, fat: 0 },
      { name: 'Azeite', quantity: '1 colher de chá', portion_grams: 5, calories: 40, protein: 0, carbs: 0, fat: 4 }
    ],
    totals: { calories: 420, protein: 40, carbs: 43, fat: 9 }
  },
  {
    id: 'lanche_manutencao_1',
    name: 'Lanche Equilibrado',
    description: 'Manutenção Leve',
    goal: 'manutencao',
    meal_type: 'lanche',
    foods: [
      { name: 'Pão integral', quantity: '1 fatia', portion_grams: 30, calories: 80, protein: 3, carbs: 15, fat: 1 },
      { name: 'Queijo cottage', quantity: '50g', portion_grams: 50, calories: 55, protein: 7, carbs: 2, fat: 2 },
      { name: 'Tomate', quantity: '3 rodelas', portion_grams: 30, calories: 10, protein: 0, carbs: 2, fat: 0 },
      { name: 'Maçã', quantity: '1 unidade pequena', portion_grams: 100, calories: 52, protein: 0, carbs: 14, fat: 0 }
    ],
    totals: { calories: 197, protein: 10, carbs: 33, fat: 3 }
  }
];

interface ReadyMealPlansProps {
  onSelectPlan: (plan: MealPlan) => void;
}

export const ReadyMealPlans = ({ onSelectPlan }: ReadyMealPlansProps) => {
  const [selectedGoal, setSelectedGoal] = useState<'emagrecimento' | 'ganho_massa' | 'manutencao'>('emagrecimento');

  const goalIcons = {
    emagrecimento: Target,
    ganho_massa: Zap,
    manutencao: Heart
  };

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

  const filteredPlans = readyMealPlans.filter(plan => plan.goal === selectedGoal);

  return (
    <Card className="max-w-6xl mx-auto mb-8 bg-gradient-to-br from-background to-muted/20 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Cookie className="h-6 w-6 text-primary" />
          Cardápios Prontos
        </CardTitle>
        <CardDescription>
          Selecione um cardápio pronto baseado no seu objetivo nutricional
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Goal Selection */}
        <Tabs value={selectedGoal} onValueChange={(value) => setSelectedGoal(value as typeof selectedGoal)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/20">
            <TabsTrigger value="emagrecimento" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Emagrecimento
            </TabsTrigger>
            <TabsTrigger value="ganho_massa" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Ganho de Massa
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Manutenção
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedGoal} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => {
                const MealIcon = mealTypeIcons[plan.meal_type];
                const GoalIcon = goalIcons[plan.goal];
                
                return (
                  <Card key={plan.id} className="bg-gradient-to-b from-muted/10 to-background/50 border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
                    <CardHeader className="pb-4 space-y-3">
                      {/* Header com ícone e badge */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="p-2.5 rounded-xl bg-primary/15 group-hover:bg-primary/25 transition-colors">
                            <MealIcon className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5">
                            {mealTypeLabels[plan.meal_type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 border-primary/20 text-primary/90">
                            Modelo pronto
                          </Badge>
                        </div>
                      </div>

                      {/* Nome e descrição */}
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors leading-tight">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {plan.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {/* Métricas principais em destaque */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <div className="text-2xl font-bold text-primary">{plan.totals.calories}</div>
                          <div className="text-xs text-muted-foreground font-medium mt-0.5">kcal</div>
                        </div>
                        <div className="text-center p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                          <div className="text-2xl font-bold text-blue-500">{plan.totals.protein}g</div>
                          <div className="text-xs text-muted-foreground font-medium mt-0.5">proteína</div>
                        </div>
                      </div>

                      {/* Lista de alimentos limpa */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Alimentos
                        </div>
                        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                          {plan.foods.map((food, index) => (
                            <div key={index} className="text-sm flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                              <span className="text-foreground/90 font-medium truncate flex-1">{food.name}</span>
                              <span className="text-muted-foreground text-xs ml-2 whitespace-nowrap">{food.calories} kcal</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botão de ação */}
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2 font-medium hover:scale-[1.02] transition-all"
                        onClick={() => onSelectPlan(plan)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Usar este Cardápio
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {filteredPlans.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cardápios em desenvolvimento</h3>
            <p className="text-muted-foreground">
              Estamos preparando cardápios para {goalLabels[selectedGoal].toLowerCase()}. 
              Volte em breve!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};