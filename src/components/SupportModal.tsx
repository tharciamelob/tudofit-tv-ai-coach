import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Mail } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqItems = [
  {
    question: "Como atualizar meus dados pessoais?",
    answer: "Vá até Perfil → Editar Informações Pessoais. Lá você pode alterar altura, peso, sexo, data de nascimento e seu objetivo."
  },
  {
    question: "Como redefinir minha senha?",
    answer: "Na tela de login, toque em 'Esqueci minha senha'. Você receberá um e-mail para criar uma nova senha."
  },
  {
    question: "Como funcionam as metas de água, sono e caminhada?",
    answer: "Você pode ajustar suas metas em Configurações → Metas & Preferências. O app calcula seu progresso automaticamente com base nos registros feitos ao longo do mês."
  },
  {
    question: "Como funciona o progresso mensal?",
    answer: "O TudoFit TV registra sua hidratação, sono, caminhadas e alimentação (se disponível) e exibe seu desempenho no painel de Monitoramento."
  },
  {
    question: "Como excluir minha conta?",
    answer: "Vá até Perfil → Privacidade → Excluir minha conta. Isso removerá todos os seus dados do TudoFit TV."
  },
  {
    question: "Como resetar meu progresso do mês?",
    answer: "Acesse Configurações → Progresso → Resetar progresso do mês. Apenas os dados do mês atual serão apagados."
  },
  {
    question: "Por que não estou recebendo lembretes?",
    answer: "O TudoFit TV ainda não envia notificações ou lembretes. Estamos trabalhando para trazer isso futuramente."
  }
];

export const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const handleEmailSupport = () => {
    window.location.href = 'mailto:suporte.tudofittv@gmail.com?subject=Suporte%20TudoFit%20TV';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            Suporte
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Card FAQ */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-primary" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                    <AccordionTrigger className="text-left text-sm hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Card Fale Conosco */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Fale Conosco
              </CardTitle>
              <CardDescription>
                Se você não encontrou sua resposta, entre em contato com o suporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleEmailSupport}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar e-mail ao suporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
