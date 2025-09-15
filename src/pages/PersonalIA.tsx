import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Clock, Dumbbell, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { TestOpenAI } from "@/components/TestOpenAI";
import { useAuth } from "@/contexts/AuthContext";

export default function PersonalIA() {
  const [showChat, setShowChat] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const { user } = useAuth();

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    setShowChat(false);
  };

  if (!user) {
    return (
    <div className="min-h-screen bg-background app-container">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Faça login para acessar o Personal IA</h1>
          <p className="text-muted-foreground">Você precisa estar logado para criar treinos personalizados.</p>
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
          <ChatInterface chatType="personal" onPlanGenerated={handlePlanGenerated} />
        </main>
      </div>
    );
  }

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{(generatedPlan as any).plan_data.plan_name}</CardTitle>
              <CardDescription className="text-center">{(generatedPlan as any).plan_data.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(generatedPlan as any).plan_data.workouts?.map((workout: any, index: number) => (
                  <Card key={index}>
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
    <div className="min-h-screen bg-background app-container">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Personal IA</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Crie treinos personalizados com inteligência artificial baseados no seu perfil, objetivos e equipamentos disponíveis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Objetivos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Treinos criados especificamente para seus objetivos: emagrecimento, ganho de massa ou condicionamento.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Tempo Otimizado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Maximize seus resultados no tempo que você tem disponível, de 15 minutos a 2 horas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Dumbbell className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Sem Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Treinos com peso corporal, yoga e pilates. Não precisa de equipamentos para começar!
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Converse com seu Personal IA</CardTitle>
            <CardDescription>
              Converse naturalmente com nossa IA e ela criará um plano de treino perfeito para você, incluindo exercícios sem equipamentos, yoga e pilates
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" className="px-8 gap-2" onClick={() => setShowChat(true)}>
              <MessageCircle className="h-5 w-5" />
              Iniciar Conversa
            </Button>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Seus treinos salvos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Você ainda não tem treinos salvos. Crie seu primeiro treino personalizado!
            </p>
          </CardContent>
        </Card>
        
        <TestOpenAI />
      </main>
    </div>
  );
}