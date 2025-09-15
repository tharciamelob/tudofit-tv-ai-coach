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
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Aveia em flocos - 40g",
            "Banana nanica - 1 unidade média (100g)",
            "Canela em pó - 1 colher de chá",
            "Café sem açúcar - 1 xícara"
          ], 
          calories: 320 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: ["Maçã vermelha - 1 unidade média (150g)"], 
          calories: 80 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Peito de frango grelhado - 120g",
            "Salada verde (alface, rúcula, pepino) - 100g",
            "Azeite extra virgem - 1 colher de chá",
            "Arroz integral cozido - 3 colheres de sopa (60g)"
          ], 
          calories: 450 
        },
        { 
          type: "Lanche da tarde", 
          time: "15:30",
          foods: [
            "Iogurte natural integral - 150g",
            "Semente de chia - 1 colher de sopa"
          ], 
          calories: 150 
        },
        { 
          type: "Jantar", 
          time: "19:00",
          foods: [
            "Salmão grelhado - 100g",
            "Brócolis refogado - 150g",
            "Batata doce cozida - 1 unidade pequena (80g)",
            "Azeite para tempero - 1 colher de chá"
          ], 
          calories: 400 
        }
      ],
      "Dia 2": [
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Ovos mexidos - 2 unidades grandes",
            "Pão integral - 1 fatia (25g)",
            "Abacate - 1/4 de unidade (50g)",
            "Café sem açúcar - 1 xícara"
          ], 
          calories: 380 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: ["Castanhas do Pará - 5 unidades (10g)"], 
          calories: 100 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Tilápia grelhada - 120g",
            "Quinoa cozida - 4 colheres de sopa (80g)",
            "Abobrinha refogada - 100g",
            "Temperos e azeite - 1 colher de chá"
          ], 
          calories: 420 
        },
        { 
          type: "Lanche da tarde", 
          time: "15:30",
          foods: [
            "Vitamina: Frutas vermelhas - 100g",
            "Leite desnatado - 200ml",
            "Mel - 1 colher de chá"
          ], 
          calories: 120 
        },
        { 
          type: "Jantar", 
          time: "19:00",
          foods: [
            "Peito de peru fatias - 100g",
            "Salada de rúcula e tomate - 100g",
            "Inhame cozido - 1 unidade média (100g)",
            "Azeite para tempero - 1 colher de chá"
          ], 
          calories: 380 
        }
      ],
      "Dia 3": [
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Tapioca - 2 colheres de sopa (40g)",
            "Queijo cottage - 3 colheres de sopa (60g)",
            "Tomate cereja - 5 unidades",
            "Chá verde - 1 xícara"
          ], 
          calories: 300 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: ["Pêra - 1 unidade média (150g)"], 
          calories: 90 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Carne bovina magra (patinho) - 100g",
            "Salada colorida (beterraba, cenoura, alface) - 120g",
            "Arroz integral - 3 colheres de sopa (60g)",
            "Feijão carioca - 2 colheres de sopa (40g)"
          ], 
          calories: 480 
        },
        { 
          type: "Lanche da tarde", 
          time: "15:30",
          foods: [
            "Água de coco - 200ml",
            "Amendoim torrado - 15 unidades"
          ], 
          calories: 140 
        },
        { 
          type: "Jantar", 
          time: "19:00",
          foods: [
            "Linguado grelhado - 120g",
            "Espinafre refogado - 100g",
            "Abóbora cozida - 100g",
            "Azeite para tempero - 1 colher de chá"
          ], 
          calories: 350 
        }
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
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Panqueca de aveia: Aveia - 60g, Whey protein - 30g, Ovo - 1 unidade",
            "Banana prata - 1 unidade grande (120g)",
            "Pasta de amendoim integral - 2 colheres de sopa (32g)",
            "Café com leite - 200ml"
          ], 
          calories: 650 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: [
            "Sanduíche: Pão integral - 2 fatias (50g)",
            "Peito de peru - 60g",
            "Queijo minas - 2 fatias (40g)",
            "Suco de laranja natural - 200ml"
          ], 
          calories: 450 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Carne bovina magra (alcatra) - 150g",
            "Arroz integral cozido - 6 colheres de sopa (120g)",
            "Feijão preto - 4 colheres de sopa (80g)",
            "Salada mista - 100g com azeite - 1 colher de sopa"
          ], 
          calories: 800 
        },
        { 
          type: "Lanche pré-treino", 
          time: "15:00",
          foods: [
            "Banana nanica - 1 unidade média (100g)",
            "Aveia em flocos - 3 colheres de sopa (30g)"
          ], 
          calories: 220 
        },
        { 
          type: "Pós-treino", 
          time: "17:30",
          foods: [
            "Whey protein - 40g",
            "Água de coco - 300ml",
            "Mel - 1 colher de sopa"
          ], 
          calories: 250 
        },
        { 
          type: "Jantar", 
          time: "19:30",
          foods: [
            "Frango grelhado - 150g",
            "Batata doce assada - 1 unidade grande (150g)",
            "Vegetais refogados (brócolis, cenoura) - 150g",
            "Azeite para tempero - 1 colher de sopa"
          ], 
          calories: 680 
        }
      ],
      "Dia 2": [
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Vitamina: Leite integral - 300ml, Banana - 1 unidade, Aveia - 40g",
            "Granola caseira - 3 colheres de sopa (45g)",
            "Mel - 1 colher de sobremesa"
          ], 
          calories: 620 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: [
            "Mix de oleaginosas (castanhas, nozes, amêndoas) - 30g",
            "Água - 200ml"
          ], 
          calories: 180 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Peixe (robalo) grelhado - 150g",
            "Quinoa cozida - 6 colheres de sopa (120g)",
            "Grão-de-bico refogado - 4 colheres de sopa (80g)",
            "Salada verde - 100g com azeite - 1 colher de sopa"
          ], 
          calories: 750 
        }
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
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Smoothie: Espinafre fresco - 50g",
            "Banana - 1 unidade (100g)",
            "Manga - 100g",
            "Leite de amêndoas - 200ml",
            "Granola caseira - 3 colheres de sopa (45g)"
          ], 
          calories: 380 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: [
            "Hummus caseiro - 3 colheres de sopa (60g)",
            "Cenoura baby - 100g"
          ], 
          calories: 160 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Grão-de-bico refogado com temperos - 6 colheres de sopa (120g)",
            "Quinoa cozida - 4 colheres de sopa (80g)",
            "Salada colorida (rúcula, tomate, pepino, beterraba) - 150g",
            "Azeite extra virgem - 1 colher de sopa",
            "Tahine - 1 colher de sobremesa"
          ], 
          calories: 520 
        },
        { 
          type: "Lanche da tarde", 
          time: "15:30",
          foods: [
            "Mix de frutas secas (tâmaras, figo, damasco) - 40g",
            "Nozes - 6 unidades (18g)"
          ], 
          calories: 220 
        },
        { 
          type: "Jantar", 
          time: "19:00",
          foods: [
            "Tofu grelhado temperado - 120g",
            "Arroz integral cozido - 4 colheres de sopa (80g)",
            "Brócolis refogado com alho - 150g",
            "Azeite para tempero - 1 colher de chá"
          ], 
          calories: 480 
        }
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
        { 
          type: "Café da manhã", 
          time: "07:00",
          foods: [
            "Ovos mexidos - 3 unidades grandes",
            "Bacon - 2 fatias médias (30g)",
            "Abacate - 1/2 unidade (100g)",
            "Café com óleo de coco - 1 xícara + 1 colher de sobremesa"
          ], 
          calories: 520 
        },
        { 
          type: "Lanche da manhã", 
          time: "10:00",
          foods: ["Castanhas mistas (nozes, amêndoas, castanha do pará) - 25g"], 
          calories: 160 
        },
        { 
          type: "Almoço", 
          time: "12:30",
          foods: [
            "Salmão grelhado - 150g",
            "Salada verde extensa (alface, rúcula, espinafre) - 200g",
            "Azeite extra virgem - 2 colheres de sopa",
            "Queijo feta - 40g"
          ], 
          calories: 580 
        },
        { 
          type: "Lanche da tarde", 
          time: "15:30",
          foods: [
            "Queijo coalho grelhado - 80g",
            "Azeitonas verdes - 10 unidades"
          ], 
          calories: 240 
        },
        { 
          type: "Jantar", 
          time: "19:00",
          foods: [
            "Frango com pele assado - 150g",
            "Aspargos grelhados - 150g",
            "Manteiga ghee para tempero - 1 colher de sopa",
            "Salada de folhas verdes - 100g"
          ], 
          calories: 560 
        }
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
        <div className="min-h-screen bg-black app-container">
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
      <div className="min-h-screen bg-black app-container">
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
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-6xl mx-auto bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
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
                  <Card key={index} className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
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
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg">
              <ChefHat className="h-20 w-20 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Nutri IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transforme sua alimentação com planos nutricionais personalizados criados por 
            <span className="text-primary font-semibold"> inteligência artificial especializada</span> em nutrição.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              CRN Especialista
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Cardápios Personalizados
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Nutrição Baseada em Evidências
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Cardápio Personalizado */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Utensils className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-foreground">Cardápio Personalizado</CardTitle>
                  <p className="text-muted-foreground mt-1">Nutrição científica adaptada ao seu perfil</p>
                </div>
              </div>
              <CardDescription className="text-base leading-relaxed">
                Nossa IA especialista em nutrição cria um plano alimentar único, baseado em seus objetivos, 
                preferências, restrições e necessidades metabólicas individuais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-foreground">Objetivos Específicos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Emagrecimento, ganho de massa ou manutenção com base científica
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                    <Apple className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-foreground">Preferências Respeitadas</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vegetariano, vegano, sem glúten, low carb e todas as suas restrições
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2 text-foreground">Rotina Adaptada</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Horários flexíveis e refeições que se encaixam na sua vida
                  </p>
                </div>
              </div>
              
              <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-bold mb-3 text-foreground">Converse com sua Nutricionista IA</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Inicie uma conversa personalizada para criar seu plano nutricional ideal
                </p>
                <Button size="lg" className="px-8 gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={() => setShowChat(true)}>
                  <MessageCircle className="h-5 w-5" />
                  Iniciar Consulta Nutricional
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Planejamento Semanal */}
          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Planejamento Semanal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-foreground/90">Lista de compras automatizada</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-foreground/90">Prep das refeições otimizado</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-foreground/90">Controle de macronutrientes</span>
                </div>
              </div>
              <Button variant="outline" className="w-full hover:bg-primary/5 transition-colors">
                Ver Calendário Nutricional
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Cardápios Prontos */}
        <div className="bg-gradient-to-r from-muted/20 via-background to-muted/20 p-8 rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Cardápios Prontos Especializados</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Planos nutricionais de <span className="text-primary font-semibold">5 dias completos</span> com quantidades precisas, 
              desenvolvidos por especialistas em nutrição
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {readyMealPlans.map((plan) => (
              <Card key={plan.title} className="relative group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-b from-black via-black to-slate-800 border-white/10 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  {plan.badge && (
                    <Badge className="absolute top-4 right-4 z-10 shadow-lg" variant="secondary">
                      {plan.badge}
                    </Badge>
                  )}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                    <plan.icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                    {plan.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">{plan.description}</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground font-medium">Calorias:</span>
                      <span className="font-bold text-primary">{plan.calories}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground font-medium">Duração:</span>
                      <span className="font-bold text-foreground">{plan.duration}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md" 
                    onClick={() => handleViewPlan(plan)}
                  >
                    Ver Cardápio Detalhado
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