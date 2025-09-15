import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Utensils, Plus, Camera, Calendar, PieChart, Trash2 } from 'lucide-react';
import { MealRegistrationModal } from '@/components/MealRegistrationModal';
import { useFoodDiary } from '@/hooks/useFoodDiary';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Meals = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { todayMeals, loading, deleteMeal, calculateDailyTotals } = useFoodDiary();

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Faça login para acessar o Diário Alimentar</h1>
            <p className="text-muted-foreground">Você precisa estar logado para registrar suas refeições.</p>
          </div>
        </main>
      </div>
    );
  }

  const dailyTotals = calculateDailyTotals();
  const dailyGoals = {
    calories: { current: dailyTotals.calories, target: 2200 },
    protein: { current: dailyTotals.protein, target: 120 },
    carbs: { current: dailyTotals.carbs, target: 250 },
    fat: { current: dailyTotals.fat, target: 70 }
  };

  const formatMealType = (type: string) => {
    const types: { [key: string]: string } = {
      'cafe-da-manha': 'Café da Manhã',
      'lanche-manha': 'Lanche da Manhã',
      'almoco': 'Almoço',
      'lanche-tarde': 'Lanche da Tarde',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Utensils className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Diário Alimentar</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Registre suas refeições e acompanhe suas metas nutricionais
            </p>
          </div>

          {/* Resumo Diário */}
          <Card className="mb-8 bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Resumo de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Calorias</span>
                    <span className="text-sm font-semibold">
                      {dailyGoals.calories.current}/{dailyGoals.calories.target}
                    </span>
                  </div>
                  <Progress 
                    value={(dailyGoals.calories.current / dailyGoals.calories.target) * 100} 
                    className="h-2 mb-1" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Restam {dailyGoals.calories.target - dailyGoals.calories.current} kcal
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Proteína</span>
                    <span className="text-sm font-semibold">
                      {dailyGoals.protein.current}g/{dailyGoals.protein.target}g
                    </span>
                  </div>
                  <Progress 
                    value={(dailyGoals.protein.current / dailyGoals.protein.target) * 100} 
                    className="h-2 mb-1" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((dailyGoals.protein.current / dailyGoals.protein.target) * 100)}% da meta
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Carboidrato</span>
                    <span className="text-sm font-semibold">
                      {dailyGoals.carbs.current}g/{dailyGoals.carbs.target}g
                    </span>
                  </div>
                  <Progress 
                    value={(dailyGoals.carbs.current / dailyGoals.carbs.target) * 100} 
                    className="h-2 mb-1" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((dailyGoals.carbs.current / dailyGoals.carbs.target) * 100)}% da meta
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Gordura</span>
                    <span className="text-sm font-semibold">
                      {dailyGoals.fat.current}g/{dailyGoals.fat.target}g
                    </span>
                  </div>
                  <Progress 
                    value={(dailyGoals.fat.current / dailyGoals.fat.target) * 100} 
                    className="h-2 mb-1" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((dailyGoals.fat.current / dailyGoals.fat.target) * 100)}% da meta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Refeições de Hoje */}
            <div className="md:col-span-2">
              <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Refeições de Hoje
                    </div>
                    <Button size="sm" onClick={() => setModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {todayMeals.length === 0 ? (
                      <div className="text-center py-8">
                        <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Nenhuma refeição registrada hoje</p>
                        <Button onClick={() => setModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar primeira refeição
                        </Button>
                      </div>
                    ) : (
                      todayMeals.map((meal) => (
                        <div key={meal.id} className="border-l-4 border-primary pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{formatMealType(meal.meal_type)}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(meal.created_at), 'HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {meal.calories || 0} kcal
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMeal(meal.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground">
                              • {meal.food_name} ({meal.quantity}{meal.unit})
                            </p>
                          </div>
                          <div className="flex space-x-4 text-xs">
                            <span className="text-blue-500">P: {meal.protein || 0}g</span>
                            <span className="text-green-500">C: {meal.carbs || 0}g</span>
                            <span className="text-yellow-500">G: {meal.fat || 0}g</span>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Próximas Refeições */}
                    <div className="space-y-3 mt-6 pt-6 border-t">
                      <h4 className="font-medium text-muted-foreground">Próximas refeições</h4>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Lanche da Tarde</p>
                          <p className="text-sm text-muted-foreground">15:30</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Registrar
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Jantar</p>
                          <p className="text-sm text-muted-foreground">19:00</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Registrar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div>
              <Card className="mb-6 bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle>Adicionar Refeição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar alimento
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setModalOpen(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Foto do prato
                  </Button>
                </CardContent>
              </Card>

              {/* Histórico Semanal */}
              <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle>Histórico Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                      const calories = [2150, 2080, 1950, 2200, 2100, 1800, dailyTotals.calories];
                      const isToday = index === 6;
                      return (
                        <div key={day} className={`flex items-center justify-between p-2 rounded ${isToday ? 'bg-primary/10' : ''}`}>
                          <span className="text-sm font-medium">{day}</span>
                          <span className={`text-sm ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            {Math.round(calories[index])} kcal
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <MealRegistrationModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
        />
      </main>
    </div>
  );
};

export default Meals;