import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import MealPlanModal from "@/components/MealPlanModal";
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
    title: "Emagrecimento - 5 Dias",
    description: "Cardápio balanceado para perda de peso saudável com 5 dias completos",
    icon: Target,
    calories: "1500-1800 kcal/dia",
    duration: "5 dias completos",
    badge: "Popular",
    days: 5,
    meals: {
      "Dia 1": [
        { type: "Café da manhã", foods: ["Aveia com banana e canela", "Café sem açúcar"], calories: 320 },
        { type: "Lanche", foods: ["1 maçã média"], calories: 80 },
        { type: "Almoço", foods: ["Peito de frango grelhado", "Salada verde", "Arroz integral (3 col.)"], calories: 450 },
        { type: "Lanche", foods: ["Iogurte natural com chia"], calories: 150 },
        { type: "Jantar", foods: ["Salmão grelhado", "Brócolis refogado", "Batata doce pequena"], calories: 400 }
      ],
      "Dia 2": [
        { type: "Café da manhã", foods: ["Ovos mexidos (2 unid.)", "Pão integral", "Abacate"], calories: 380 },
        { type: "Lanche", foods: ["Castanhas do Pará (5 unid.)"], calories: 100 },
        { type: "Almoço", foods: ["Tilápia grelhada", "Quinoa", "Abobrinha refogada"], calories: 420 },
        { type: "Lanche", foods: ["Vitamina de frutas vermelhas"], calories: 120 },
        { type: "Jantar", foods: ["Peito de peru", "Salada de rúcula", "Inhame cozido"], calories: 380 }
      ]
    }
  },
  {
    title: "Ganho de Massa - 5 Dias",
    description: "Alto valor proteico para hipertrofia muscular com 5 dias completos",
    icon: Beef,
    calories: "2500-3000 kcal/dia",
    duration: "5 dias completos",
    badge: "Novo",
    days: 5,
    meals: {
      "Dia 1": [
        { type: "Café da manhã", foods: ["Panqueca de aveia com whey", "Banana", "Pasta de amendoim"], calories: 550 },
        { type: "Lanche", foods: ["Sanduíche de peito de peru", "Suco de laranja"], calories: 400 },
        { type: "Almoço", foods: ["Carne bovina magra", "Arroz integral", "Feijão", "Salada"], calories: 700 },
        { type: "Lanche pré-treino", foods: ["Banana com aveia"], calories: 200 },
        { type: "Pós-treino", foods: ["Whey protein", "Água de coco"], calories: 180 },
        { type: "Jantar", foods: ["Frango grelhado", "Batata doce", "Vegetais"], calories: 600 }
      ]
    }
  },
  {
    title: "Vegetariano - 5 Dias",
    description: "Nutrição completamente à base de plantas com 5 dias completos",
    icon: Apple,
    calories: "1800-2200 kcal/dia",
    duration: "5 dias completos",
    badge: "Sustentável",
    days: 5,
    meals: {
      "Dia 1": [
        { type: "Café da manhã", foods: ["Smoothie de espinafre e frutas", "Granola caseira"], calories: 350 },
        { type: "Lanche", foods: ["Hummus com cenoura"], calories: 150 },
        { type: "Almoço", foods: ["Grão-de-bico refogado", "Quinoa", "Salada colorida"], calories: 500 },
        { type: "Lanche", foods: ["Frutas secas e nozes"], calories: 200 },
        { type: "Jantar", foods: ["Tofu grelhado", "Arroz integral", "Brócolis"], calories: 450 }
      ]
    }
  },
  {
    title: "Low Carb - 5 Dias",
    description: "Baixo carboidrato, alto em proteínas e gorduras boas com 5 dias completos",
    icon: Fish,
    calories: "1600-2000 kcal/dia",
    duration: "5 dias completos",
    badge: "Eficaz",
    days: 5,
    meals: {
      "Dia 1": [
        { type: "Café da manhã", foods: ["Ovos com bacon", "Abacate", "Café com óleo de coco"], calories: 450 },
        { type: "Lanche", foods: ["Castanhas variadas"], calories: 150 },
        { type: "Almoço", foods: ["Salmão grelhado", "Salada verde", "Azeite extra virgem"], calories: 500 },
        { type: "Lanche", foods: ["Queijo coalho grelhado"], calories: 200 },
        { type: "Jantar", foods: ["Frango com pele", "Aspargos", "Manteiga"], calories: 520 }
      ]
    }
  }
];

export default function NutriIA() {
  const [showChat, setShowChat] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const { user } = useAuth();

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setShowChat(false);
  };

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  if (!user) {
    return (
        <div className="min-h-screen bg-background app-container">
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
      <div className="min-h-screen bg-background app-container">
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
    <div className="min-h-screen bg-background app-container">
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
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewPlan(plan)}>
                    Ver Cardápio de {plan.days} Dias
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <MealPlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        plan={selectedPlan}
      />
    </div>
  );
}