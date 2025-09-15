import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Play, Clock, Route, Footprints, Flame, Calendar, TrendingUp } from 'lucide-react';

const Walking = () => {
  const recentWalks = [
    {
      date: 'Hoje',
      time: '07:30',
      distance: '3.2 km',
      duration: '35 min',
      calories: 180,
      pace: '10:55 /km'
    },
    {
      date: 'Ontem',
      time: '18:15',
      distance: '2.8 km',
      duration: '28 min',
      calories: 150,
      pace: '10:00 /km'
    },
    {
      date: '2 dias atrás',
      time: '07:00',
      distance: '4.1 km',
      duration: '42 min',
      calories: 220,
      pace: '10:14 /km'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Caminhada</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Rastreamento GPS em tempo real das suas caminhadas
            </p>
          </div>

          {/* Botão Iniciar Caminhada */}
          <Card className="card-netflix mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-primary to-primary-glow rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Play className="h-12 w-12 text-white" fill="white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Iniciar Nova Caminhada</h2>
                <p className="text-muted-foreground mb-6">
                  Rastreamento GPS com métricas em tempo real
                </p>
                <Button size="lg" className="btn-hero px-8">
                  <Play className="h-5 w-5 mr-2" />
                  Começar Agora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas da Semana */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="card-netflix">
              <CardContent className="p-4 text-center">
                <Route className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">12.3 km</p>
                <p className="text-sm text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>
            
            <Card className="card-netflix">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">2h 15m</p>
                <p className="text-sm text-muted-foreground">Tempo total</p>
              </CardContent>
            </Card>
            
            <Card className="card-netflix">
              <CardContent className="p-4 text-center">
                <Flame className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">650</p>
                <p className="text-sm text-muted-foreground">Calorias</p>
              </CardContent>
            </Card>
            
            <Card className="card-netflix">
              <CardContent className="p-4 text-center">
                <Footprints className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">16.2K</p>
                <p className="text-sm text-muted-foreground">Passos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Histórico de Caminhadas */}
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWalks.map((walk, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {walk.date}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {walk.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-semibold">{walk.distance}</span>
                          <span className="text-muted-foreground">{walk.duration}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{walk.calories} kcal</p>
                        <p className="text-muted-foreground">{walk.pace}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progresso Mensal */}
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Progresso do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">47.8 km</p>
                    <p className="text-sm text-muted-foreground">Distância percorrida</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-semibold">15</p>
                      <p className="text-sm text-muted-foreground">Caminhadas</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold">8h 45m</p>
                      <p className="text-sm text-muted-foreground">Tempo ativo</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Meta mensal: 60 km</span>
                      <span className="text-primary">79%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full" style={{width: '79%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recursos da Caminhada */}
          <Card className="card-netflix mt-6">
            <CardHeader>
              <CardTitle>Recursos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">GPS Integrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Rastreamento preciso da sua rota em tempo real
                  </p>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Auto-Pausa</h3>
                  <p className="text-sm text-muted-foreground">
                    Pausa automática quando você para de caminhar
                  </p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Estatísticas</h3>
                  <p className="text-sm text-muted-foreground">
                    Análise detalhada do seu progresso e performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Walking;