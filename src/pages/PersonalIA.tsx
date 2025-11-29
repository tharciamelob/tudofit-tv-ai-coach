import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Dumbbell, 
  Target, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  History,
  Loader2,
  Bot,
  User,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { ConversationHistory } from "@/components/ConversationHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useChatConversation } from "@/hooks/useChatConversation";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Exercise {
  id: string;
  name: string;
  repsOrTime: string;
  rest: string;
  sets: number;
  equipment: string;
  instructions?: string;
}

interface WorkoutDay {
  id: string;
  dayNumber: number;
  name: string;
  focus: string;
  durationMinutes: number;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  objective: string;
  level: string;
  weeklyFrequency: number;
  type: string;
  days: WorkoutDay[];
  createdAt: string;
}

export default function PersonalIA() {
  const [showHistory, setShowHistory] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);
  const [planHistory, setPlanHistory] = useState<WorkoutPlan[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage, isLoading: isChatLoading } = useChatConversation({ 
    chatType: 'personal',
    conversationId: undefined 
  });
  
  const { 
    currentConversation, 
    createConversation, 
    selectConversation, 
    clearCurrentConversation,
  } = useConversationHistory('personal');

  // Load plan history
  useEffect(() => {
    if (user) {
      loadPlanHistory();
    }
  }, [user]);

  const loadPlanHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPlans: WorkoutPlan[] = (data || []).map((plan: any) => ({
        id: plan.id,
        name: plan.plan_data.name || plan.plan_name,
        objective: plan.plan_data.objective || '',
        level: plan.plan_data.level || 'iniciante',
        weeklyFrequency: plan.plan_data.weeklyFrequency || 3,
        type: plan.plan_data.type || 'Sem equipamento',
        days: plan.plan_data.days || [],
        createdAt: plan.created_at
      }));

      setPlanHistory(formattedPlans);
      
      // Set the most recent plan as current if no plan is selected
      if (formattedPlans.length > 0 && !currentPlan) {
        setCurrentPlan(formattedPlans[0]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Initialize chat with welcome message
  useEffect(() => {
    if (currentConversation?.messages && currentConversation.messages.length > 0) {
      const formattedMessages = currentConversation.messages.map(msg => ({
        id: msg.id,
        type: msg.message_type as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(formattedMessages);
    } else if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Oi! Eu sou sua Personal IA. Me conta seu objetivo principal (ex: emagrecer, ganhar massa, condicionamento) e quantos dias por semana você consegue treinar.",
        timestamp: new Date()
      }]);
    }
  }, [currentConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    try {
      const response = await sendMessage(inputValue, messages);
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        type: 'ai',
        content: response.message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: 'Desculpe, houve um erro. Pode tentar novamente?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleNewConversation = async () => {
    const newConv = await createConversation({
      conversation_type: 'personal',
      title: 'Nova Consulta Personal',
    });
    
    if (newConv) {
      clearCurrentConversation();
      setShowHistory(false);
      setMessages([{
        id: '1',
        type: 'ai',
        content: "Oi! Vamos começar uma nova consulta. Me conta seu objetivo e quantos dias por semana você consegue treinar.",
        timestamp: new Date()
      }]);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    setShowHistory(false);
  };

  const handleGenerateWorkoutPlan = async () => {
    if (!user || !currentConversation || messages.length === 0) return;
    
    setIsGeneratingPlan(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          conversationId: currentConversation.id,
          userId: user.id,
          messages: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        }
      });

      if (error) throw error;

      if (data?.plan) {
        setCurrentPlan(data.plan);
        await loadPlanHistory();
        
        const successMessage: ChatMessage = {
          id: `msg-${Date.now()}-success`,
          type: 'ai',
          content: `✅ Plano de treino "${data.plan.name}" gerado com sucesso! Confira abaixo seu plano completo com ${data.plan.days?.length || 0} dias de treino.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);

        toast({
          title: "Plano gerado!",
          description: `Seu plano de ${data.plan.days?.length || 0} dias está pronto.`,
        });

        // Scroll to plan section
        setTimeout(() => {
          const planSection = document.getElementById('current-plan-section');
          if (planSection) {
            planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Erro ao gerar plano:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        type: 'ai',
        content: 'Desculpe, houve um erro ao gerar seu plano de treino. Pode tentar novamente?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro ao gerar plano",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSelectPlanFromHistory = (plan: WorkoutPlan) => {
    setCurrentPlan(plan);
    setTimeout(() => {
      const planSection = document.getElementById('current-plan-section');
      if (planSection) {
        planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays(prev =>
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black app-container">
        <Header />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Faça login para acessar o Personal IA</h1>
            <p className="text-muted-foreground">Você precisa estar logado para criar treinos personalizados.</p>
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
              conversationType="personal"
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-2 sm:px-4 pt-20 pb-12 space-y-8">
        {/* 1. CHAT DO PERSONAL IA (TOPO) */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Seu Personal IA</CardTitle>
                  <CardDescription>Converse com o Personal IA e receba séries montadas só pra você.</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleNewConversation}
                  size="sm"
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Nova conversa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <History className="h-4 w-4 mr-1" />
                  Histórico
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages area */}
              <div className="border border-white/10 rounded-xl bg-black/40 h-96 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.type === 'ai' && (
                          <div className="flex-shrink-0 mr-2">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            msg.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-line text-sm">{msg.content}</p>
                          <span className="block mt-1 text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {msg.type === 'user' && (
                          <div className="flex-shrink-0 ml-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="flex-shrink-0 mr-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Generate Workout Plan Button */}
                <div className="border-t border-white/10 p-3">
                  <Button
                    onClick={handleGenerateWorkoutPlan}
                    disabled={messages.length === 0 || isGeneratingPlan || isChatLoading}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Gerando plano de treino...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Gerar Plano de Treino com IA
                      </>
                    )}
                  </Button>
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Converse com a IA antes de gerar um plano
                    </p>
                  )}
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-white/10 p-3 flex gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-muted/50"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputValue.trim() || isChatLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. PLANO DE TREINO ATUAL (ABAIXO DO CHAT) */}
        {currentPlan ? (
          <div id="current-plan-section" className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Seu Plano de Treinos Atual</h2>
              <p className="text-muted-foreground">Plano completo personalizado pela IA</p>
            </div>

            {/* Plan Summary Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-white/10">
              <CardHeader>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
                        {currentPlan.type}
                      </Badge>
                      <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Objetivo</p>
                      <p className="font-medium">{currentPlan.objective}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Nível</p>
                      <p className="font-medium capitalize">{currentPlan.level}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Frequência</p>
                      <p className="font-medium">{currentPlan.weeklyFrequency}x/semana</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="font-medium">{currentPlan.days?.length || 0} dias</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Days Cards */}
            <div className="grid gap-4">
              {currentPlan.days?.map((day) => (
                <Card key={day.id} className="border-0 shadow-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-white/10 overflow-hidden">
                  <div
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleDay(day.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Dia {day.dayNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {day.focus}
                            </Badge>
                          </div>
                          <h4 className="text-xl font-bold">{day.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{day.durationMinutes} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>{day.exercises?.length || 0} exercícios</span>
                            </div>
                          </div>
                        </div>
                        {expandedDays.includes(day.id) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </div>

                  {expandedDays.includes(day.id) && (
                    <CardContent className="border-t border-white/10 pt-4">
                      <div className="space-y-4">
                        {day.exercises?.map((exercise, idx) => (
                          <div key={exercise.id} className="p-4 rounded-lg bg-black/40 border border-white/5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {exercise.equipment === 'sem_equipamento' ? 'Peso Corporal' : 'Com Equipamento'}
                                  </Badge>
                                </div>
                                <h5 className="font-semibold text-base">{exercise.name}</h5>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                              <div>
                                <p className="text-muted-foreground text-xs">Séries</p>
                                <p className="font-medium">{exercise.sets}x</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Reps/Tempo</p>
                                <p className="font-medium">{exercise.repsOrTime}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Descanso</p>
                                <p className="font-medium">{exercise.rest}</p>
                              </div>
                            </div>
                            {exercise.instructions && (
                              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                {exercise.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 inline-block mb-4">
              <Dumbbell className="h-12 w-12 text-primary/50" />
            </div>
            <p className="text-muted-foreground">
              Você ainda não tem um plano de treinos. Peça ao Personal IA acima para montar um plano pra você 😉
            </p>
          </div>
        )}

        {/* 3. HISTÓRICO DE PLANOS (PARTE DE BAIXO) */}
        {planHistory.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Histórico de Planos de Treino</h2>
              <p className="text-muted-foreground">Todos os seus planos gerados pela IA</p>
            </div>

            <div className="grid gap-4">
              {planHistory.map((plan) => (
                <Card key={plan.id} className="border-0 shadow-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-white/10 hover:border-primary/20 transition-all cursor-pointer group">
                  <CardHeader onClick={() => handleSelectPlanFromHistory(plan)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {plan.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {plan.weeklyFrequency}x/semana
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                          {plan.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{plan.days?.length || 0} dias</span>
                          </div>
                          <span className="capitalize">{plan.level}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlanFromHistory(plan);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Ver treino
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
