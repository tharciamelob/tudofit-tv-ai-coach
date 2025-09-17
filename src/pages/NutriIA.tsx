import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Utensils, MessageCircle, FileDown, Zap, Target, Clock, Brain } from "lucide-react";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { NutritionalBreakdown } from "@/components/NutritionalBreakdown";
import { UnifiedMealInput } from "@/components/UnifiedMealInput";
import { useAuth } from "@/contexts/AuthContext";
import { useNutriAnalysis } from "@/hooks/useNutriAnalysis";
import { useFoodDiary } from "@/hooks/useFoodDiary";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { usePDFSuggestions } from "@/hooks/usePDFSuggestions";

export default function NutriIA() {
  const [showChat, setShowChat] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const { user } = useAuth();
  const { loading, result, analyzeText, analyzePhoto, saveToDiary, clearResult } = useNutriAnalysis();
  const { todayMeals, calculateDailyTotals } = useFoodDiary();
  const { generateNutritionPDF, isGenerating } = usePDFGeneration();
  const { getSuggestion } = usePDFSuggestions();

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setShowChat(false);
  };

  const handleUnifiedInput = async (data: { text?: string; photo?: File; mealType: string }) => {
    try {
      if (data.photo) {
        await analyzePhoto(data.photo, data.mealType);
      } else if (data.text) {
        await analyzeText(data.text, data.mealType);
      }
    } catch (error) {
      console.error('Error analyzing meal:', error);
    }
  };

  const handleSaveToDiary = async () => {
    if (!result) return;
    
    try {
      await saveToDiary(result);
      clearResult();
    } catch (error) {
      console.error('Error saving to diary:', error);
    }
  };

  const handleGeneratePDF = async () => {
    const suggestion = await getSuggestion('nutrition', { dailyMeals: todayMeals, totals: calculateDailyTotals() });
    if (suggestion.shouldSuggest) {
      await generateNutritionPDF({
        plan_name: "Relatório Nutricional Diário",
        description: "Resumo das suas refeições de hoje",
        meals: todayMeals,
        totals: calculateDailyTotals()
      });
    }
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

  if (showChat) {
    return (
      <div className="min-h-screen bg-black app-container">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-8">
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

  const dailyTotals = calculateDailyTotals();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg">
              <Apple className="h-20 w-20 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Nutri IA
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Analise suas refeições com <span className="text-primary font-semibold">inteligência artificial avançada</span> e 
            obtenha informações nutricionais precisas de forma instantânea.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Análise por Foto
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Contagem de Macros
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Relatórios em PDF
            </Badge>
          </div>
        </div>

        {/* Resumo Diário */}
        {todayMeals.length > 0 && (
          <Card className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Resumo de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{dailyTotals.calories}</div>
                  <div className="text-sm text-muted-foreground">kcal consumidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{dailyTotals.protein}g</div>
                  <div className="text-sm text-muted-foreground">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{dailyTotals.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carboidrato</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{dailyTotals.fat}g</div>
                  <div className="text-sm text-muted-foreground">Gordura</div>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleGeneratePDF} disabled={isGenerating}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {isGenerating ? "Gerando..." : "Gerar Relatório PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input de Análise */}
        <div className="max-w-4xl mx-auto mb-8">
          <UnifiedMealInput 
            onSubmit={handleUnifiedInput}
            loading={loading}
            placeholder="Descreva sua refeição ou tire uma foto para análise nutricional instantânea..."
          />
        </div>

        {/* Resultados da Análise */}
        {result && (
          <Card className="max-w-4xl mx-auto mb-8 bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Análise Nutricional
              </CardTitle>
              <CardDescription>Alimentos identificados e informações nutricionais</CardDescription>
            </CardHeader>
            <CardContent>
              <NutritionalBreakdown 
                foods={result.foods}
                totals={result.totals}
              />
              
              <div className="flex gap-4 mt-6 justify-center">
                <Button onClick={handleSaveToDiary} className="gap-2">
                  <Utensils className="h-4 w-4" />
                  Salvar no Diário
                </Button>
                <Button variant="outline" onClick={clearResult}>
                  Nova Análise
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Target className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">Análise Precisa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                <span className="text-primary font-medium">IA especializada em nutrição</span> identifica alimentos e calcula macronutrientes com alta precisão.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">Instantâneo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Análise <span className="text-primary font-medium">em segundos</span>. Tire uma foto ou descreva sua refeição e tenha os dados na hora.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">Planos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Converse com nossa <span className="text-primary font-medium">nutricionista IA</span> e receba planos alimentares sob medida.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat CTA */}
        <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl text-foreground">Converse com o Nutri IA</CardTitle>
                <p className="text-muted-foreground mt-1">Planos nutricionais personalizados baseados em ciência</p>
              </div>
            </div>
            <CardDescription className="text-base leading-relaxed max-w-2xl mx-auto">
              Nossa IA nutricionista cria planos alimentares personalizados baseados em seus objetivos, preferências e restrições alimentares.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20">
              <h3 className="text-xl font-bold mb-3 text-foreground">Crie seu Plano Nutricional Ideal</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Uma conversa de 5 minutos para criar seu cardápio personalizado
              </p>
              <Button size="lg" className="px-8 gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={() => setShowChat(true)}>
                <MessageCircle className="h-5 w-5" />
                Iniciar Consulta Nutricional
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}