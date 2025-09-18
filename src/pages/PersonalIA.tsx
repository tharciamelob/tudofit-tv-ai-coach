import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, Clock, Dumbbell, MessageCircle, Zap, Shield, TrendingUp, FileDown, History } from "lucide-react";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { ConversationHistory } from "@/components/ConversationHistory";

import { PDFSuggestionCard } from "@/components/PDFSuggestionCard";
import { useAuth } from "@/contexts/AuthContext";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";

export default function PersonalIA() {
  const [showChat, setShowChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const { user } = useAuth();
  const { generateWorkoutPDF, isGenerating } = usePDFGeneration();
  const { 
    currentConversation, 
    createConversation, 
    selectConversation, 
    clearCurrentConversation,
    loadConversationMessages
  } = useConversationHistory('personal');

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
      conversation_type: 'personal',
      title: 'Nova Consulta Personal',
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
              chatType="personal" 
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
              <PDFSuggestionCard
                contentType="workout"
                content={(generatedPlan as any).plan_data}
                onGeneratePDF={() => generateWorkoutPDF((generatedPlan as any).plan_data)}
                isGenerating={isGenerating}
              />
              
              <div className="space-y-6">
                {(generatedPlan as any).plan_data.workouts?.map((workout: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">{workout.day} - {workout.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {workout.exercises?.map((exercise: any, exerciseIndex: number) => (
                          <div key={exerciseIndex} className="p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">{exercise.name}</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                              <span>Séries: {exercise.sets}</span>
                              <span>Repetições: {exercise.reps}</span>
                              <span>Descanso: {exercise.rest}</span>
                            </div>
                            <p className="text-sm">{exercise.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-4 mt-6 justify-center">
                <Button 
                  onClick={() => generateWorkoutPDF((generatedPlan as any).plan_data)}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {isGenerating ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
                <Button onClick={() => setGeneratedPlan(null)}>
                  Gerar Novo Treino
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
      
      <main className="container mx-auto px-2 sm:px-4 pt-20 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg">
              <Brain className="h-20 w-20 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Personal IA
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Revolucione seus treinos com planos de exercícios personalizados criados por 
            <span className="text-primary font-semibold"> inteligência artificial especializada</span> em educação física.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              CREF Especialista
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Treinos Científicos
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              Sem Equipamentos
            </Badge>
          </div>
        </div>

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Target className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">Objetivos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Treinos cientificamente criados para seus objetivos específicos: <span className="text-primary font-medium">emagrecimento, hipertrofia ou condicionamento físico</span>.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">Tempo Otimizado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Maximize seus resultados no tempo disponível, com treinos de <span className="text-primary font-medium">15 minutos a 2 horas</span>, adaptados à sua rotina.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10 group hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 w-fit mx-auto mb-4 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                <Dumbbell className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">Flexibilidade Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center leading-relaxed">
                Treinos com <span className="text-primary font-medium">peso corporal, yoga, pilates e calistenia</span>. Não precisa de equipamentos para começar!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main CTA Section */}
        <div className="bg-gradient-to-r from-muted/20 via-background to-muted/20 p-8 rounded-3xl mb-16">
            <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-foreground">Converse com seu Personal IA</CardTitle>
                  <p className="text-muted-foreground mt-1">Treinamento personalizado baseado em ciência</p>
                </div>
              </div>
              <CardDescription className="text-base leading-relaxed max-w-2xl mx-auto">
                Converse naturalmente com nossa IA especialista e ela criará um plano de treino perfeito para você, 
                incluindo <span className="text-primary font-medium">progressão, periodização e técnicas avançadas</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2 text-sm">Adaptação Inteligente</h4>
                  <p className="text-xs text-muted-foreground">Ajusta automaticamente conforme sua evolução</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2 text-sm">Segurança Garantida</h4>
                  <p className="text-xs text-muted-foreground">Exercícios seguros com técnica correta</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/40">
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2 text-sm">Resultados Comprovados</h4>
                  <p className="text-xs text-muted-foreground">Metodologia baseada em evidências científicas</p>
                </div>
              </div>
              
              <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-bold mb-3 text-foreground">Inicie sua Transformação Agora</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Uma conversa de 5 minutos para criar seu plano de treino ideal
                </p>
                <Button size="lg" className="px-8 gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={handleNewConversation}>
                  <MessageCircle className="h-5 w-5" />
                  Iniciar Consulta Personalizada
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Workouts */}
        <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-b from-black via-black to-slate-800 border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Seus Treinos Personalizados</CardTitle>
            <CardDescription>Histórico de treinos criados especialmente para você</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/20">
              <div className="p-4 rounded-2xl bg-muted/30 w-fit mx-auto mb-4">
                <Dumbbell className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Nenhum treino criado ainda</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie seu primeiro treino personalizado conversando com nosso Personal IA especialista
              </p>
              <Button variant="outline" onClick={handleNewConversation} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Criar Primeiro Treino
              </Button>
            </div>
          </CardContent>
        </Card>
        
      </main>
    </div>
  );
}