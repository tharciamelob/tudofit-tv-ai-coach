import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, MessageCircle, FileDown, Target, Clock, Brain, History, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { ConversationHistory } from "@/components/ConversationHistory";
import { ReadyMealPlans } from "@/components/ReadyMealPlans";
import { DailyMealPlan } from "@/components/DailyMealPlan";
import { NutriAIAssistant } from "@/components/NutriAIAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { useDailyMealPlan, MealPlan, DailyPlan } from "@/hooks/useDailyMealPlan";

export default function NutriIA() {
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [showDailyPlan, setShowDailyPlan] = useState(false);
  const { user } = useAuth();
  const { generateNutritionPDF, isGenerating } = usePDFGeneration();
  const { 
    dailyPlan,
    addMealToPlan,
    substituteFood,
    clearDailyPlan,
    removeMealFromPlan
  } = useDailyMealPlan();
  const { 
    currentConversation, 
    createConversation, 
    selectConversation, 
    clearCurrentConversation,
    loadConversationMessages
  } = useConversationHistory('nutrition');

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setShowChat(false);
  };

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    setShowHistory(false);
    setShowChat(true);
  };

  const handleNewConversation = async () => {
    const newConv = await createConversation({
      conversation_type: 'nutrition',
      title: 'Nova Consulta Nutricional',
    });
    
    if (newConv) {
      clearCurrentConversation();
      setShowHistory(false);
      setShowChat(true);
    }
  };

  const handleBackFromChat = () => {
    setShowChat(false);
    clearCurrentConversation();
  };

  const handleBackToMain = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleSelectMealPlan = (plan: MealPlan) => {
    // Store the base plan name when selecting from ready meals
    const planWithBaseName = {
      ...plan,
      basePlanName: plan.name
    };
    addMealToPlan(planWithBaseName);
    setShowDailyPlan(true);
    
    // Scroll to daily plan section
    setTimeout(() => {
      const planSection = document.getElementById('daily-plan-section');
      if (planSection) {
        planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  const handleClearDailyPlan = () => {
    clearDailyPlan();
    setShowDailyPlan(false);
  };

  const handleAIPlanGenerated = (plan: DailyPlan) => {
    // Replace current daily plan with AI-generated plan
    clearDailyPlan();
    plan.meals.forEach(meal => addMealToPlan(meal));
    setShowDailyPlan(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black app-container">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Faça login para acessar o Nutri IA</h1>
            <p className="text-muted-foreground">Você precisa estar logado para analisar refeições e acessar planos nutricionais.</p>
          </div>
        </main>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-black app-container">
        <Header />
        <main className="container mx-auto px-2 sm:px-4 pt-20 pb-8">
          <div className="mb-4">
            <Button variant="outline" onClick={() => setShowHistory(false)}>
              ← Voltar
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <ConversationHistory 
              conversationType="nutrition"
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        </main>
      </div>
    );
  }

  if (showChat) {
    const initialMessages = currentConversation?.messages?.map(msg => ({
      id: msg.id,
      type: msg.message_type as 'user' | 'ai',
      content: msg.content,
      timestamp: new Date(msg.created_at)
    })) || [];

    return (
      <div className="min-h-screen bg-black app-container">
        <Header />
        <main className="container mx-auto px-2 sm:px-4 pt-20 pb-8">
          <div className="w-full max-w-4xl mx-auto">
            <ChatInterface 
              chatType="nutrition" 
              onPlanGenerated={handlePlanGenerated}
              onBack={handleBackFromChat}
              conversationId={currentConversation?.id}
              initialMessages={initialMessages}
            />
          </div>
        </main>
      </div>
    );
  }

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{(generatedPlan as any).plan_data.plan_name}</CardTitle>
              <CardDescription className="text-center">{(generatedPlan as any).plan_data.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(generatedPlan as any).plan_data.meals?.map((meal: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">{meal.meal_type} - {meal.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {meal.foods?.map((food: any, foodIndex: number) => (
                          <div key={foodIndex} className="p-3 bg-muted rounded-lg">
                            <h4 className="font-semibold">{food.name}</h4>
                            <p className="text-sm text-muted-foreground">{food.quantity}</p>
                            <div className="flex gap-4 text-sm">
                              <span>{food.calories} kcal</span>
                              <span>P: {food.protein}g</span>
                              <span>C: {food.carbs}g</span>
                              <span>G: {food.fat}g</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 justify-center">
                <Button 
                  onClick={() => generateNutritionPDF((generatedPlan as any).plan_data)}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {isGenerating ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
                <Button onClick={() => setGeneratedPlan(null)}>
                  Gerar Novo Plano
                </Button>
                <Button variant="outline" onClick={handleBackToMain}>
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
      
      <main className="container mx-auto px-2 sm:px-4 pt-20 pb-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg">
              <Apple className="h-16 sm:h-20 w-16 sm:w-20 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            Nutrição IA
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Obtenha <span className="text-primary font-semibold">cardápios personalizados</span> e 
            sugestões nutricionais criadas por inteligência artificial.
          </p>
        </div>

        {/* SEÇÃO 1 - Nutri AI Assistant */}
        <div className="max-w-4xl mx-auto">
          <NutriAIAssistant 
            userGoal="manutencao"
            onPlanGenerated={handleAIPlanGenerated}
          />
        </div>

        {/* SEÇÃO 2 - Cardápios Prontos (Modelos Sugeridos) */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Cardápios Prontos (Modelos Sugeridos)</h2>
            <p className="text-muted-foreground">
              Escolha entre nossos modelos de cardápios pré-definidos organizados por objetivo
            </p>
          </div>
          <ReadyMealPlans onSelectPlan={handleSelectMealPlan} />
        </div>

        {/* SEÇÃO 3 - Seu Plano Nutricional de Hoje (Personalizado) */}
        {dailyPlan && (
          <div>
            <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold">Seu Plano Nutricional de Hoje (Personalizado)</h2>
                <p className="text-sm text-muted-foreground">
                  Plano nutricional criado especialmente para você
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDailyPlan(!showDailyPlan)}
                className="gap-2"
              >
                {showDailyPlan ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
            
            {showDailyPlan && (
              <DailyMealPlan 
                dailyPlan={dailyPlan}
                onSubstituteFood={substituteFood}
                onRemoveMeal={removeMealFromPlan}
                onClearPlan={handleClearDailyPlan}
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-md mx-auto">
          <Button 
            onClick={() => setShowHistory(true)}
            variant="outline"
            className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <History className="h-4 w-4" />
            Histórico de Conversas
          </Button>
          <Button 
            onClick={handleNewConversation}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 max-w-6xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Target className="h-10 sm:h-12 w-10 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">Cardápios Prontos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                <span className="text-primary font-medium">Cardápios balanceados</span> para emagrecimento, ganho de massa e manutenção.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Clock className="h-10 sm:h-12 w-10 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">Resposta Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                Cardápios <span className="text-primary font-medium">personalizados em minutos</span> através da nossa IA nutricionista.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Brain className="h-10 sm:h-12 w-10 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">Planos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                Converse com nossa <span className="text-primary font-medium">nutricionista IA</span> e receba planos alimentares sob medida.
              </p>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}