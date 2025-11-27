import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  MessageCircle, 
  Send, 
  Dumbbell, 
  Target, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Calendar,
  History,
  Loader2,
  Bot,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { ConversationHistory } from "@/components/ConversationHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useChatConversation } from "@/hooks/useChatConversation";
import { useWorkoutPlans, WorkoutPlan } from "@/hooks/useWorkoutPlans";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function PersonalIA() {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const { user } = useAuth();
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

  const {
    workoutPlans,
    currentWorkout,
    isLoading: isLoadingWorkouts,
    saveWorkoutPlan,
    deleteWorkoutPlan,
    selectWorkout,
    clearCurrentWorkout,
  } = useWorkoutPlans();

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

      // If AI generated a workout plan
      if (response.shouldGeneratePlan && response.planData) {
        await saveWorkoutPlan(response.planData, currentConversation?.id);
        selectWorkout(response.planData);
      }
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

  const toggleSeries = (id: string) => {
    setExpandedSeriesIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectWorkoutFromHistory = (workout: WorkoutPlan) => {
    selectWorkout(workout);
    // Scroll to workout section
    setTimeout(() => {
      const workoutSection = document.getElementById('current-workout-section');
      if (workoutSection) {
        workoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
        // Save the workout plan
        await saveWorkoutPlan(data.plan, currentConversation.id);
        selectWorkout(data.plan);
        
        // Show success message in chat
        const successMessage: ChatMessage = {
          id: `msg-${Date.now()}-success`,
          type: 'ai',
          content: `✅ Plano de treino "${data.plan.name}" gerado com sucesso! Confira abaixo os detalhes do seu treino personalizado.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);

        // Scroll to workout section
        setTimeout(() => {
          const workoutSection = document.getElementById('current-workout-section');
          if (workoutSection) {
            workoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    } finally {
      setIsGeneratingPlan(false);
    }
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
        {/* Hero Section */}
        <div className="text-center relative">
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg">
              <Dumbbell className="h-16 sm:h-20 w-16 sm:w-20 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            Personal IA
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Treinos <span className="text-primary font-semibold">personalizados por IA</span> adaptados ao seu objetivo, tempo e nível de condicionamento.
          </p>
        </div>

        {/* Chat Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Converse com seu Personal IA</CardTitle>
                  <CardDescription>Tire dúvidas e gere treinos personalizados através do chat</CardDescription>
                </div>
                <Button
                  onClick={handleNewConversation}
                  size="sm"
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Nova conversa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* History button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  <History className="h-4 w-4 mr-1" />
                  Ver histórico
                </Button>
              </div>

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

        {/* Current Workout Summary */}
        {currentWorkout && (
          <div id="current-workout-section" className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Seu Treino Atual</CardTitle>
                    <CardDescription>Plano personalizado gerado por IA</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearCurrentWorkout()}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
                      {currentWorkout.type}
                    </Badge>
                    <h3 className="text-xl font-semibold">{currentWorkout.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Objetivo</p>
                      <p className="font-medium">{currentWorkout.objective}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Nível</p>
                      <p className="font-medium capitalize">{currentWorkout.level}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Duração</p>
                      <p className="font-medium">{currentWorkout.durationMinutes} min</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Criado em</p>
                      <p className="font-medium text-xs">
                        {new Date(currentWorkout.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => {
                      const seriesSection = document.getElementById('series-section');
                      if (seriesSection) {
                        seriesSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Ver séries e exercícios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workout Series Details */}
        {currentWorkout && (
          <section id="series-section" className="max-w-4xl mx-auto space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Séries do Treino</h2>
              <p className="text-muted-foreground text-sm">
                Detalhamento completo de cada série e exercício
              </p>
            </div>
            <div className="space-y-3">
              {currentWorkout.series.map((serie) => {
                const expanded = expandedSeriesIds.includes(serie.id);
                return (
                  <Card key={serie.id} className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
                    <CardHeader 
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleSeries(serie.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base sm:text-lg">{serie.name}</CardTitle>
                          <CardDescription className="text-xs">{serie.summary}</CardDescription>
                        </div>
                        {expanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                    {expanded && (
                      <CardContent>
                        <div className="space-y-3">
                          {serie.exercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm sm:text-base">{ex.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {ex.equipment === "sem_equipamento" ? "Sem equipamento" : "Com equipamento"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right text-xs sm:text-sm flex-shrink-0">
                                <p className="font-semibold text-primary">{ex.repsOrTime}</p>
                                <p className="text-muted-foreground">
                                  Descanso: {ex.rest}
                                </p>
                                {ex.sets && (
                                  <p className="text-muted-foreground">
                                    {ex.sets} séries
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Seus Treinos Personalizados */}
        <section className="space-y-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Seus Treinos Personalizados</h2>
            <p className="text-muted-foreground">
              Todos os treinos gerados pela Personal IA adaptados ao seu perfil
            </p>
          </div>
          
          {workoutPlans.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-6">
                <Dumbbell className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Nenhum treino personalizado ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Converse com a Personal IA para gerar seu primeiro plano de treino
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {workoutPlans.map((treino) => (
                <Card 
                  key={treino.id} 
                  className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => handleSelectWorkoutFromHistory(treino)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(treino.createdAt).toLocaleDateString("pt-BR")}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-950/20 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkoutPlan(treino.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {treino.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{treino.objective}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{treino.durationMinutes} minutos</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {treino.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {treino.level}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs border-primary/30 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectWorkoutFromHistory(treino);
                      }}
                    >
                      Ver Treino Completo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">Treinos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                <span className="text-primary font-medium">Planos adaptados</span> ao seu objetivo, nível e equipamentos disponíveis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Clock className="h-10 sm:h-12 w-10 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">Geração Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                Treinos <span className="text-primary font-medium">criados em minutos</span> através da nossa IA especialista.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Brain className="h-10 sm:h-12 w-10 sm:w-12 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">Baseado em Ciência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed text-sm sm:text-base">
                Converse com nossa <span className="text-primary font-medium">Personal IA</span> e receba treinos baseados em evidências científicas.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
