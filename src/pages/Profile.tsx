import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, Crown, CreditCard, LogOut, Shield } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Meu Perfil</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Gerencie sua conta e assinatura
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Informações do Usuário */}
            <div className="md:col-span-2">
              <Card className="card-netflix mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações Pessoais
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Nome completo</label>
                        <p className="font-medium">{user?.user_metadata?.full_name || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Altura</label>
                        <p className="font-medium">1,75 m</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Peso</label>
                        <p className="font-medium">78 kg</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Objetivo</label>
                        <p className="font-medium">Ganhar massa</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card className="card-netflix">
                <CardHeader>
                  <CardTitle>Suas Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">47</p>
                      <p className="text-sm text-muted-foreground">Treinos realizados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">125.3 km</p>
                      <p className="text-sm text-muted-foreground">Distância caminhada</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-500">89.2L</p>
                      <p className="text-sm text-muted-foreground">Água consumida</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-500">7.5h</p>
                      <p className="text-sm text-muted-foreground">Média de sono</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              {/* Status da Assinatura */}
              <Card className="card-netflix mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                    Assinatura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-2">
                      Plano Premium
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Válido até 15/10/2024
                    </p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Valor mensal:</span>
                      <span className="font-semibold">R$ 99,99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Próximo pagamento:</span>
                      <span>15/10/2024</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                </CardContent>
              </Card>

              {/* Ações da Conta */}
              <Card className="card-netflix">
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações gerais
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacidade
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair da conta
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Planos e Benefícios */}
          <Card className="card-netflix mt-6">
            <CardHeader>
              <CardTitle>Benefícios do seu plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-primary to-primary-glow rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">IA Personalizada</h3>
                  <p className="text-sm text-muted-foreground">
                    Treinos e cardápios criados especialmente para você
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Acesso Completo</h3>
                  <p className="text-sm text-muted-foreground">
                    Todos os recursos e funcionalidades disponíveis
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">Suporte Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Atendimento prioritário e personalizado
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

export default Profile;