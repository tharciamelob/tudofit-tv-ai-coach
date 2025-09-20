import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Crown, CreditCard, Calendar, Check, X, Pause, RotateCcw } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPlan] = useState({
    name: 'Premium',
    price: 99.99,
    nextPayment: '15/10/2024',
    status: 'active',
    features: [
      'IA Personalizada para treinos',
      'Planos nutricionais ilimitados', 
      'Suporte prioritário',
      'Acesso a todos os recursos',
      'Sem anúncios'
    ]
  });

  const { toast } = useToast();

  const handleUpdatePayment = () => {
    toast({
      title: "Redirecionando...",
      description: "Você será redirecionado para atualizar seu método de pagamento.",
    });
  };

  const handlePauseSubscription = () => {
    toast({
      title: "Assinatura pausada",
      description: "Sua assinatura foi pausada. Você pode reativá-la a qualquer momento.",
      variant: "destructive",
    });
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Assinatura cancelada",
      description: "Sua assinatura foi cancelada. Você manterá o acesso até o final do período pago.",
      variant: "destructive",
    });
  };

  const handleReactivateSubscription = () => {
    toast({
      title: "Assinatura reativada",
      description: "Sua assinatura foi reativada com sucesso!",
    });
  };

  const handleDowngrade = () => {
    toast({
      title: "Solicitação registrada",
      description: "Sua solicitação de downgrade será processada no próximo ciclo de cobrança.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Gerenciar Assinatura
          </DialogTitle>
          <DialogDescription>
            Gerencie seu plano, pagamentos e benefícios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plano Atual */}
          <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Plano {currentPlan.name}
                </CardTitle>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Ativo
                </Badge>
              </div>
              <CardDescription>
                Seu plano premium com todos os benefícios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor mensal:</span>
                    <span className="font-semibold">R$ {currentPlan.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Próximo pagamento:</span>
                    <span className="font-semibold">{currentPlan.nextPayment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Benefícios inclusos:</h4>
                  <ul className="space-y-1 text-sm">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Método de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Válido até 12/27</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleUpdatePayment}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Últimos Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '15/09/2024', amount: 99.99, status: 'Pago' },
                  { date: '15/08/2024', amount: 99.99, status: 'Pago' },
                  { date: '15/07/2024', amount: 99.99, status: 'Pago' },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.date}</p>
                      <p className="text-sm text-muted-foreground">Cobrança mensal</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {payment.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações da Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle>Ações da Assinatura</CardTitle>
              <CardDescription>
                Gerencie sua assinatura atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleUpdatePayment}>
                <CreditCard className="h-4 w-4 mr-2" />
                Atualizar Método de Pagamento
              </Button>
              
              <Button variant="outline" className="w-full justify-start" onClick={handleDowngrade}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Alterar Plano
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-yellow-600 hover:text-yellow-700">
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar Assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pausar Assinatura</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sua assinatura será pausada e você não será cobrado no próximo ciclo. 
                      Você pode reativá-la a qualquer momento.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePauseSubscription}>
                      Pausar Assinatura
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso 
                      até {currentPlan.nextPayment}, mas perderá todos os benefícios premium após essa data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelSubscription}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirmar Cancelamento
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};