import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Dumbbell, Clock, Target } from 'lucide-react';

const PersonalIA = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Personal IA</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Treinos personalizados criados especialmente para você
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-netflix">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Objetivos Personalizados</h3>
                <p className="text-sm text-muted-foreground">
                  Treinos adaptados aos seus objetivos específicos
                </p>
              </CardContent>
            </Card>

            <Card className="card-netflix">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Tempo Otimizado</h3>
                <p className="text-sm text-muted-foreground">
                  Treinos que se encaixam na sua rotina
                </p>
              </CardContent>
            </Card>

            <Card className="card-netflix">
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Equipamentos Disponíveis</h3>
                <p className="text-sm text-muted-foreground">
                  Adaptamos aos equipamentos que você possui
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-netflix">
            <CardHeader>
              <CardTitle>Crie seu treino personalizado</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Responda algumas perguntas e nossa IA criará um treino perfeito para você
                </p>
                <Button size="lg" className="btn-hero">
                  Iniciar Questionário
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Seus treinos salvos</h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Você ainda não possui treinos salvos. Crie seu primeiro treino personalizado!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PersonalIA;