import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import MealPlanModal from "@/components/MealPlanModal";
import { MealRegistrationModal } from "@/components/MealRegistrationModal";
import { useAuth } from "@/contexts/AuthContext";
import { useFoodDiary } from "@/hooks/useFoodDiary";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { PDFSuggestionCard } from "@/components/PDFSuggestionCard";
import { useNutriAnalysis } from "@/hooks/useNutriAnalysis";
import { 
  Utensils, 
  Clock, 
  Target, 
  Calendar,
  ChefHat,
  Apple,
  Beef,
  Fish,
  MessageCircle,
  Camera,
  Plus,
  FileDown,
  Text,
  Loader2,
  Save
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
    meals: {}
  },
  {
    title: "Vegetariano - 5 Dias",
    description: "Nutrição completamente à base de plantas com 5 dias completos",
    icon: Apple,
    calories: "1800-2200 kcal/dia",
    duration: "5 dias completos",
    badge: "Sustentável",
    days: 5,
    meals: {}
  },
  {
    title: "Low Carb - 5 Dias",
    description: "Baixo carboidrato, alto em proteínas e gorduras boas com 5 dias completos",
    icon: Fish,
    calories: "1600-2000 kcal/dia",
    duration: "5 dias completos",
    badge: "Eficaz",
    days: 5,
    meals: {}
  }
];

export default function NutriIA() {
  const [showChat, setShowChat] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'plans'>('analysis');
  const [textInput, setTextInput] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('lanche');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { todayMeals, calculateDailyTotals } = useFoodDiary();
  const { generateNutritionPDF, isGenerating } = usePDFGeneration();
  const { loading, result, analyzeText, analyzePhoto, saveToDiary, clearResult } = useNutriAnalysis();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setShowChat(false);
  };

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) return;
    try {
      await analyzeText(textInput, selectedMealType);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePhotoAnalysis = async () => {
    if (!selectedPhoto) return;
    try {
      await analyzePhoto(selectedPhoto, selectedMealType);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSaveToDiary = async () => {
    if (!result) return;
    try {
      await saveToDiary(result as any);
      clearResult();
      setTextInput('');
      setSelectedPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const clearAll = () => {
    clearResult();
    setTextInput('');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
        <div className="min-h-screen bg-black app-container">
          <Header />
          <main className="container mx-auto px-4 pt-20 pb-8">
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

  return (
    <div className="min-h-screen bg-black app-container">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-white">🥗 Nutri IA</h1>
          <p className="text-xl text-gray-300">Análise nutricional inteligente por texto ou foto</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-black/50 p-1 rounded-lg border border-white/10">
            <Button 
              variant={activeTab === 'analysis' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analysis')}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Análise Nutricional
            </Button>
            <Button 
              variant={activeTab === 'plans' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('plans')}
              className="flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              Planos Prontos
            </Button>
          </div>
        </div>

        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto">
            {/* Estatísticas do dia */}
            <Card className="mb-8 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Resumo Nutricional Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const totals = calculateDailyTotals();
                    return (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">{totals.calories}</div>
                          <div className="text-sm text-gray-400">Calorias</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{totals.protein.toFixed(1)}g</div>
                          <div className="text-sm text-gray-400">Proteínas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{totals.carbs.toFixed(1)}g</div>
                          <div className="text-sm text-gray-400">Carboidratos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{totals.fat.toFixed(1)}g</div>
                          <div className="text-sm text-gray-400">Gorduras</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Análise por Texto */}
            <Card className="mb-6 bg-gradient-to-b from-blue-900/10 to-blue-900/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Text className="w-5 h-5" />
                  Calcular por Texto
                </CardTitle>
                <CardDescription>
                  Descreva sua refeição e obtenha as informações nutricionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meal-type-text">Tipo da Refeição</Label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de refeição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cafe_da_manha">Café da manhã</SelectItem>
                      <SelectItem value="lanche">Lanche</SelectItem>
                      <SelectItem value="almoco">Almoço</SelectItem>
                      <SelectItem value="jantar">Jantar</SelectItem>
                      <SelectItem value="pre_treino">Pré-treino</SelectItem>
                      <SelectItem value="pos_treino">Pós-treino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="meal-description">Descrição da Refeição</Label>
                  <Textarea
                    id="meal-description"
                    placeholder="Ex: 2 ovos mexidos com 1 fatia de pão integral e 1/2 abacate"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleTextAnalysis}
                  disabled={loading || !textInput.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    'Calcular Nutrição'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Análise por Foto */}
            <Card className="mb-6 bg-gradient-to-b from-purple-900/10 to-purple-900/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Camera className="w-5 h-5" />
                  Calcular pela Foto
                </CardTitle>
                <CardDescription>
                  Tire uma foto da sua refeição para análise automática
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meal-type-photo">Tipo da Refeição</Label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de refeição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cafe_da_manha">Café da manhã</SelectItem>
                      <SelectItem value="lanche">Lanche</SelectItem>
                      <SelectItem value="almoco">Almoço</SelectItem>
                      <SelectItem value="jantar">Jantar</SelectItem>
                      <SelectItem value="pre_treino">Pré-treino</SelectItem>
                      <SelectItem value="pos_treino">Pós-treino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="photo-upload">Foto da Refeição</Label>
                  <Input
                    ref={fileInputRef}
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                </div>

                {photoPreview && (
                  <div className="mt-4">
                    <img 
                      src={photoPreview} 
                      alt="Preview da refeição" 
                      className="w-full max-w-sm mx-auto rounded-lg border border-white/20"
                    />
                  </div>
                )}

                <Button 
                  onClick={handlePhotoAnalysis}
                  disabled={loading || !selectedPhoto}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    'Analisar Foto'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resultado da Análise */}
            {result && (
              <Card className="mb-6 bg-gradient-to-b from-green-900/10 to-green-900/20 border-green-400/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Target className="w-5 h-5" />
                    Resultado da Análise
                  </CardTitle>
                  <CardDescription>
                    {result.nutrition.item_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-orange-400/10 rounded-lg border border-orange-400/20">
                      <div className="text-2xl font-bold text-orange-400">{result.nutrition.calories}</div>
                      <div className="text-sm text-orange-300">kcal</div>
                    </div>
                    <div className="text-center p-4 bg-blue-400/10 rounded-lg border border-blue-400/20">
                      <div className="text-2xl font-bold text-blue-400">{result.nutrition.protein_g}</div>
                      <div className="text-sm text-blue-300">g proteína</div>
                    </div>
                    <div className="text-center p-4 bg-green-400/10 rounded-lg border border-green-400/20">
                      <div className="text-2xl font-bold text-green-400">{result.nutrition.carbs_g}</div>
                      <div className="text-sm text-green-300">g carbo</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                      <div className="text-2xl font-bold text-yellow-400">{result.nutrition.fat_g}</div>
                      <div className="text-sm text-yellow-300">g gordura</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveToDiary} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar no Diário
                    </Button>
                    <Button variant="outline" onClick={clearAll}>
                      Nova Análise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Link para Planos */}
            <Card className="bg-gradient-to-b from-orange-900/10 to-orange-900/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <MessageCircle className="w-5 h-5" />
                  Precisa de um Plano Completo?
                </CardTitle>
                <CardDescription>
                  Converse com a IA para criar um plano nutricional personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowChat(true)} className="w-full">
                  Gerar Plano com IA
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'plans' && (
          <div>
            <PDFSuggestionCard 
              contentType="nutrition"
              content={generatedPlan || selectedPlan} 
              onGeneratePDF={() => generateNutritionPDF(generatedPlan || selectedPlan)}
              isGenerating={isGenerating}
            />

            {/* Ações principais */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card 
                className="cursor-pointer hover:border-green-400/50 transition-colors bg-gradient-to-b from-green-900/10 to-green-900/20 border-white/10"
                onClick={() => setShowChat(true)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <MessageCircle className="w-5 h-5" />
                    Gerar Plano IA
                  </CardTitle>
                  <CardDescription>
                    Converse com a IA para criar um plano nutricional personalizado
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card 
                className="cursor-pointer hover:border-blue-400/50 transition-colors bg-gradient-to-b from-blue-900/10 to-blue-900/20 border-white/10"
                onClick={() => setShowMealModal(true)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Plus className="w-5 h-5" />
                    Registrar Refeição
                  </CardTitle>
                  <CardDescription>
                    Adicione uma refeição manualmente ao seu diário
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-gradient-to-b from-purple-900/10 to-purple-900/20 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <FileDown className="w-5 h-5" />
                    Gerar PDF
                  </CardTitle>
                  <CardDescription>
                    Download do seu plano nutricional em PDF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => generateNutritionPDF(generatedPlan || selectedPlan || { plan_data: readyMealPlans[0] })}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      'Baixar PDF'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Planos prontos */}
            <Card className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-orange-400" />
                  Planos Nutricionais Prontos
                </CardTitle>
                <CardDescription>
                  Planos completos criados por nutricionistas especialistas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {readyMealPlans.map((plan, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:border-orange-400/50 transition-colors bg-gradient-to-b from-slate-900/50 to-slate-800/50 border-white/10"
                      onClick={() => handleViewPlan(plan)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <plan.icon className="w-8 h-8 text-orange-400" />
                          {plan.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {plan.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-400" />
                            <span>{plan.calories}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span>{plan.duration}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modals */}
        <MealPlanModal 
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          plan={selectedPlan}
        />
        
      <MealRegistrationModal
        open={showMealModal}
        onOpenChange={setShowMealModal}
      />
      </main>
    </div>
  );
}
