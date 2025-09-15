import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Utensils, 
  Clock, 
  Target, 
  Calendar,
  ChefHat,
  Apple,
  Beef,
  Fish,
  MessageCircle
} from "lucide-react";

const readyMealPlans = [
  {
    title: "Plano Emagrecimento",
    description: "Cardápio balanceado para perda de peso saudável",
    icon: Target,
    calories: "1500-1800 kcal/dia",
    duration: "4 semanas",
    badge: "Popular"
  },
  {
    title: "Plano Ganho de Massa",
    description: "Alto valor proteico para hipertrofia muscular",
    icon: Beef,
    calories: "2500-3000 kcal/dia",
    duration: "6 semanas",
    badge: "Novo"
  },
  {
    title: "Plano Vegetariano",
    description: "Nutrição completamente à base de plantas",
    icon: Apple,
    calories: "1800-2200 kcal/dia",
    duration: "4 semanas",
    badge: "Sustentável"
  },
  {
    title: "Plano Low Carb",
    description: "Baixo carboidrato, alto em proteínas e gorduras boas",
    icon: Fish,
    calories: "1600-2000 kcal/dia",
    duration: "8 semanas",
    badge: "Eficaz"
  }
];

export default function NutriIA() {
  const [showChat, setShowChat] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const { user } = useAuth();

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setShowChat(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Faça login para acessar o Nutri IA</h1>
            <p className="text-muted-foreground">Você precisa estar logado para criar planos nutricionais personalizados.</p>
          </div>
        </main>
      </div>
    );
  }

  if (showChat) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button variant="outline" onClick={() => setShowChat(false)}>
              ← Voltar
            </Button>
          </div>
          <ChatInterface chatType="nutrition" onPlanGenerated={handlePlanGenerated} />
        </main>
      </div>
    );
  }

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{(generatedPlan as any).plan_data.plan_name}</CardTitle>
              <CardDescription className="text-center">{(generatedPlan as any).plan_data.description}</CardDescription>
              <div className="flex justify-center gap-4 mt-4">
                <Badge variant="secondary">
                  {(generatedPlan as any).plan_data.daily_calories} kcal/dia
                </Badge>
                <Badge variant="outline">
                  Proteína: {(generatedPlan as any).plan_data.macros?.protein}g
                </Badge>
                <Badge variant="outline">
                  Carboidratos: {(generatedPlan as any).plan_data.macros?.carbs}g
                </Badge>
                <Badge variant="outline">
                  Gorduras: {(generatedPlan as any).plan_data.macros?.fat}g
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(generatedPlan as any).plan_data.weekly_plan?.map((day: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{day.day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {day.meals?.map((meal: any, mealIndex: number) => (
                          <div key={mealIndex} className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold">{meal.type}</h4>
                              <span className="text-sm text-muted-foreground">{meal.time}</span>
                            </div>
                            <div className="space-y-2">
                              {meal.foods?.map((food: any, foodIndex: number) => (
                                <div key={foodIndex} className="flex justify-between items-center text-sm">
                                  <div>
                                    <span className="font-medium">{food.name}</span>
                                    <span className="text-muted-foreground ml-2">({food.quantity})</span>
                                  </div>
                                  <div className="text-right">
                                    <div>{food.calories} kcal</div>
                                    <div className="text-xs text-muted-foreground">
                                      P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 justify-center">
                <Button onClick={() => setGeneratedPlan(null)}>
                  Gerar Novo Plano
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Nutri IA</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme sua alimentação com planos nutricionais personalizados criados por inteligência artificial.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cardápio Personalizado */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Cardápio Personalizado</CardTitle>
              </div>
              <CardDescription>
                Nossa IA cria um plano nutricional único baseado no seu perfil, objetivos e preferências alimentares.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Objetivos Específicos</h3>
                  <p className="text-sm text-muted-foreground">Emagrecimento, ganho de massa ou manutenção</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Apple className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Preferências</h3>
                  <p className="text-sm text-muted-foreground">Vegetariano, vegano, sem glúten e mais</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Rotina Adaptada</h3>
                  <p className="text-sm text-muted-foreground">Horários e refeições que cabem na sua vida</p>
                </div>
              </div>
              
              <div className="text-center">
                <Button size="lg" className="px-8 gap-2" onClick={() => setShowChat(true)}>
                  <MessageCircle className="h-5 w-5" />
                  Conversar com Nutri IA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Planejamento Semanal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-6 w-6 text-primary" />
                <CardTitle>Planejamento Semanal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Organize suas refeições para toda a semana com listas de compras automatizadas.
              </p>
              <Button variant="outline" className="w-full">
                Ver Calendário Nutricional
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Cardápios Prontos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Cardápios Prontos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {readyMealPlans.map((plan) => (
              <Card key={plan.title} className="relative">
                <CardHeader className="text-center">
                  {plan.badge && (
                    <Badge className="absolute top-4 right-4" variant="secondary">
                      {plan.badge}
                    </Badge>
                  )}
                  <plan.icon className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calorias:</span>
                      <span className="font-medium">{plan.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração:</span>
                      <span className="font-medium">{plan.duration}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}