import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Droplets, Moon, Plus, Calendar } from 'lucide-react';

const Monitoring = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Monitoramento</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Acompanhe seus indicadores de saúde e bem-estar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Água */}
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-6 w-6 text-blue-500 mr-2" />
                    Hidratação
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">1.2L</span>
                    <span className="text-muted-foreground">de 2.5L</span>
                  </div>
                  <Progress value={48} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Meta diária: 2.5L</span>
                    <span>48% concluído</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sono */}
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Moon className="h-6 w-6 text-purple-500 mr-2" />
                    Qualidade do Sono
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Registrar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">7h 30m</span>
                    <span className="text-muted-foreground">Ontem</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dormiu às</p>
                      <p className="font-semibold">23:00</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Acordou às</p>
                      <p className="font-semibold">06:30</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Semanais */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Progresso Semanal - Água
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                    const values = [80, 95, 60, 100, 85, 70, 48];
                    return (
                      <div key={day} className="flex items-center space-x-3">
                        <span className="w-8 text-sm">{day}</span>
                        <Progress value={values[index]} className="flex-1 h-2" />
                        <span className="w-12 text-sm text-muted-foreground">
                          {values[index]}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="card-netflix">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Progresso Semanal - Sono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                    const sleepHours = ['7h 30m', '8h 15m', '6h 45m', '7h 50m', '8h 00m', '9h 10m', '7h 20m'];
                    const quality = [4, 5, 3, 4, 4, 5, 4];
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className="w-8 text-sm">{day}</span>
                        <span className="flex-1 text-center font-medium">{sleepHours[index]}</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-3 h-3 rounded-full ${
                                star <= quality[index] ? 'bg-yellow-500' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Geral */}
          <Card className="card-netflix">
            <CardHeader>
              <CardTitle>Resumo da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-500">17.8L</p>
                  <p className="text-sm text-muted-foreground">Água consumida</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">7.7h</p>
                  <p className="text-sm text-muted-foreground">Média de sono</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">82%</p>
                  <p className="text-sm text-muted-foreground">Meta de hidratação</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">4.2/5</p>
                  <p className="text-sm text-muted-foreground">Qualidade do sono</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Monitoring;