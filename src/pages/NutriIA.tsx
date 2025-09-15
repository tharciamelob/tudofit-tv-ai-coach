import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Apple, Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const NutriIA = () => {
  const readyMealPlans = [
    {
      title: 'Emagrecer com Saúde',
      description: 'Cardápio balanceado para perda de peso sustentável',
      icon: <TrendingDown className="h-6 w-6 text-green-500" />,
      calories: '1800 kcal/dia',
      duration: '30 dias'
    },
    {
      title: 'Manter o Peso',
      description: 'Equilíbrio perfeito para manter sua forma atual',
      icon: <Minus className="h-6 w-6 text-blue-500" />,
      calories: '2200 kcal/dia',
      duration: '30 dias'
    },
    {
      title: 'Ganhar Massa Muscular',
      description: 'Cardápio rico em proteínas para hipertrofia',
      icon: <TrendingUp className="h-6 w-6 text-red-500" />,
      calories: '2800 kcal/dia',
      duration: '30 dias'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Nutri IA</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Cardápios personalizados para seus objetivos nutricionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Cardápio Personalizado */}
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Apple className="h-6 w-6 text-primary mr-2" />
                  Cardápio Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Responda nosso questionário e receba um cardápio de 7 dias 
                  totalmente personalizado para seus objetivos e preferências.
                </p>
                <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                  <li>• Considera suas alergias e restrições</li>
                  <li>• Adapta às suas preferências alimentares</li>
                  <li>• Inclui macros calculados</li>
                  <li>• Opções de substituição</li>
                </ul>
                <Button size="lg" className="w-full btn-hero">
                  Criar Cardápio Personalizado
                </Button>
              </CardContent>
            </Card>

            {/* Cardápio IA Semanal */}
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-6 w-6 text-primary mr-2" />
                  Planejamento Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="font-medium">Segunda-feira</span>
                    <Badge variant="outline">2.150 kcal</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="font-medium">Terça-feira</span>
                    <Badge variant="outline">2.080 kcal</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                    <span className="font-medium">Quarta-feira</span>
                    <Badge variant="outline">2.200 kcal</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Você ainda não possui um cardápio ativo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cardápios Prontos */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Cardápios Prontos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {readyMealPlans.map((plan, index) => (
                <Card key={index} className="card-netflix">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      {plan.icon}
                      <h3 className="font-semibold ml-2">{plan.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>{plan.calories}</span>
                      <span>{plan.duration}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Ver Cardápio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Seus cardápios salvos</h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Você ainda não possui cardápios salvos. Crie seu primeiro cardápio personalizado!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NutriIA;