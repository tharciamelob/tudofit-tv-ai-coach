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
import Header from "@/components/Header";
import { ConversationHistory } from "@/components/ConversationHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { useChatConversation } from "@/hooks/useChatConversation";
import { useWorkoutPlans, WorkoutPlan, WorkoutSeries } from "@/hooks/useWorkoutPlans";

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
  
  const { user } = useAuth();
  const { sendMessage, isLoading: isChatLoading } = useChatConversation({ 
    chatType: 'personal',
    conversationId: undefined 
  });
  
  const { 
    conversations,
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
    <div className="min-h-screen bg-[#050509] text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 lg:px-12 pt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Título principal */}
          <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Personal IA TudoFit
            </h1>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl">
              Treinos personalizados com base em ciência, adaptados ao seu
              objetivo, tempo e nível. Converse com sua IA especialista e receba
              séries prontas para treinar.
            </p>
          </header>

          {/* Topo: Chat + Card "Seu Treino de Hoje" */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna esquerda: Chat */}
            <div className="lg:col-span-2 bg-gradient-to-b from-[#16121f] to-[#0b0812] border border-[#2b203a] rounded-2xl p-4 md:p-6 shadow-lg shadow-black/40">
              {/* Header do chat */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">
                    Converse com seu Personal IA
                  </h2>
                  <p className="text-xs md:text-sm text-gray-400">
                    Tire dúvidas, ajuste seu treino e peça novas séries sempre que
                    precisar.
                  </p>
                </div>
                <Button
                  onClick={handleNewConversation}
                  size="sm"
                  className="text-xs md:text-sm px-3 py-2 rounded-full bg-pink-600 hover:bg-pink-700 transition font-medium"
                >
                  Nova conversa
                </Button>
              </div>

              {/* Botões / Histórico */}
              <div className="flex justify-between items-center mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-xs md:text-sm text-gray-300 hover:underline"
                >
                  <History className="h-4 w-4 mr-1" />
                  {showHistory ? "Fechar histórico" : "Ver histórico de conversas"}
                </Button>
              </div>

              {/* Área de mensagens */}
              <div className="h-72 md:h-80 border border-[#2b203a] rounded-2xl bg-black/40 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-3 space-y-2 text-xs md:text-sm">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-3 ${
                        msg.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="flex-shrink-0 mr-2">
                          <div className="w-7 h-7 bg-pink-600 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                          msg.type === "user"
                            ? "bg-pink-600 text-white"
                            : "bg-[#1c1426] text-gray-100"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                        <span className="block mt-1 text-[10px] opacity-70">
                          {msg.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {msg.type === 'user' && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-7 h-7 bg-pink-600 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="bg-[#1c1426] rounded-2xl px-3 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Input de mensagem */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-[#2b203a] p-2 flex gap-2"
                >
                  <Input
                    type="text"
                    placeholder="Digite sua mensagem para a Personal IA..."
                    className="flex-1 bg-transparent text-xs md:text-sm px-3 py-2 rounded-full border border-[#2b203a] focus:outline-none focus:border-pink-500 text-white"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="px-3 md:px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-xs md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!inputValue.trim() || isChatLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Coluna direita: Resumo do treino atual */}
            <div id="current-workout-section" className="bg-gradient-to-b from-[#16121f] to-[#0b0812] border border-[#2b203a] rounded-2xl p-4 md:p-6 shadow-lg shadow-black/40">
              <h2 className="text-base md:text-lg font-semibold mb-2">
                Seu Treino de Hoje
              </h2>
              {currentWorkout ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-pink-400 text-xs uppercase tracking-wide mb-1">
                      Treino atual
                    </p>
                    <p className="font-semibold text-sm md:text-base">
                      {currentWorkout.name}
                    </p>
                  </div>
                  <div className="space-y-1 text-gray-300 text-xs md:text-sm">
                    <p>
                      <span className="font-medium">Objetivo: </span>
                      {currentWorkout.objective}
                    </p>
                    <p>
                      <span className="font-medium">Nível: </span>
                      {currentWorkout.level === "iniciante"
                        ? "Iniciante"
                        : currentWorkout.level === "intermediario"
                        ? "Intermediário"
                        : "Avançado"}
                    </p>
                    <p>
                      <span className="font-medium">Duração: </span>
                      {currentWorkout.durationMinutes} min
                    </p>
                    <p>
                      <span className="font-medium">Tipo: </span>
                      {currentWorkout.type}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Gerado em{" "}
                      {new Date(currentWorkout.createdAt).toLocaleString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs md:text-sm"
                      onClick={() => {
                        const seriesSection = document.getElementById('series-section');
                        if (seriesSection) {
                          seriesSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Ver séries
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => clearCurrentWorkout()}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs md:text-sm text-gray-400">
                  Nenhum treino gerado ainda. Converse com a Personal IA para
                  criar seu primeiro plano de treino.
                </p>
              )}
            </div>
          </section>

          {/* Séries do treino atual */}
          {currentWorkout && (
            <section id="series-section" className="space-y-4">
              <h2 className="text-lg font-semibold">Séries do treino</h2>
              <div className="space-y-3">
                {currentWorkout.series.map((serie) => {
                  const expanded = expandedSeriesIds.includes(serie.id);
                  return (
                    <div
                      key={serie.id}
                      className="bg-[#0b0812] border border-[#2b203a] rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm md:text-base hover:bg-white/5 transition-colors"
                        onClick={() => toggleSeries(serie.id)}
                      >
                        <div>
                          <p className="font-medium">{serie.name}</p>
                          <p className="text-xs text-gray-400">
                            {serie.summary}
                          </p>
                        </div>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {expanded && (
                        <div className="border-t border-[#2b203a] px-4 py-3 space-y-2 text-xs md:text-sm">
                          {serie.exercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-b-0"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{ex.name}</p>
                                <p className="text-[11px] text-gray-400">
                                  {ex.equipment === "sem_equipamento"
                                    ? "Peso corporal · Sem equipamento"
                                    : "Com equipamento"}
                                </p>
                                {ex.instructions && (
                                  <p className="text-[11px] text-gray-500 mt-1">
                                    {ex.instructions}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-[11px] text-gray-300">
                                <p>{ex.repsOrTime}</p>
                                <p className="text-gray-500">
                                  Descanso: {ex.rest}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Histórico de treinos personalizados */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Seus Treinos Personalizados</h2>
            {isLoadingWorkouts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
              </div>
            ) : workoutPlans.length === 0 ? (
              <Card className="bg-[#0b0812] border border-[#2b203a]">
                <CardContent className="text-center py-12">
                  <div className="p-4 rounded-2xl bg-[#2b203a]/30 w-fit mx-auto mb-4">
                    <Dumbbell className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhum treino criado ainda</h3>
                  <p className="text-xs md:text-sm text-gray-400 mb-4">
                    Converse com a Personal IA para criar seu primeiro treino personalizado
                  </p>
                  <Button onClick={handleNewConversation} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Criar Primeiro Treino
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutPlans.map((treino) => (
                  <Card
                    key={treino.id}
                    className="bg-[#0b0812] border border-[#2b203a] hover:border-pink-600/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectWorkoutFromHistory(treino)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-[11px] text-pink-400 border-pink-600/30">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(treino.createdAt).toLocaleDateString("pt-BR")}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkoutPlan(treino.id);
                          }}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <CardTitle className="text-sm md:text-base line-clamp-2">
                        {treino.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Target className="h-3 w-3 text-pink-400" />
                        <span>{treino.objective}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="h-3 w-3 text-pink-400" />
                        <span>{treino.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Dumbbell className="h-3 w-3 text-pink-400" />
                        <span>{treino.type}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
