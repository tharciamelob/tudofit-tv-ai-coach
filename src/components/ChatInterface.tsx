import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, FileDown, ArrowLeft } from 'lucide-react';
import { useChatConversation } from '@/hooks/useChatConversation';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatType: 'personal' | 'nutrition';
  onPlanGenerated: (plan: any) => void;
  onBack: () => void;
  conversationId?: string;
  initialMessages?: Message[];
}

export const ChatInterface = ({ 
  chatType, 
  onPlanGenerated, 
  onBack, 
  conversationId,
  initialMessages = []
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showPDFOffer, setShowPDFOffer] = useState(false);
  const [lastPlanContent, setLastPlanContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useChatConversation({ chatType, conversationId });
  const { generateElementPDF, isGenerating } = usePDFGeneration();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Se não temos mensagens iniciais, adicionar mensagem de boas-vindas
    if (initialMessages.length === 0) {
      const initialMessage: Message = {
        id: '1',
        type: 'ai',
        content: chatType === 'personal' 
          ? "Olá! Sou seu personal de treinos. Vou te ajudar a criar o plano perfeito para você! Primeiro, me conte: qual é seu principal objetivo? (emagrecimento, ganho de massa muscular, condicionamento físico ou fortalecimento)"
          : "Oi! Sou sua nutricionista virtual. Vou criar um plano alimentar personalizado para você! Para começar, me fale: qual é seu objetivo nutricional? (emagrecimento, ganho de massa, manutenção do peso ou melhoria da saúde)",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    } else {
      setMessages(initialMessages);
    }
  }, [chatType, initialMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const response = await sendMessage(inputValue, messages);
      
      if (response.shouldGeneratePlan) {
        setIsGeneratingPlan(true);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Aguardar um pouco antes de gerar o plano
        setTimeout(() => {
          onPlanGenerated(response.planData);
          setIsGeneratingPlan(false);
        }, 2000);
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Verificar se deve oferecer PDF
        if (response.shouldOfferPDF) {
          setShowPDFOffer(true);
          setLastPlanContent(response.message);
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, houve um erro. Pode tentar novamente?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGeneratePDF = async () => {
    try {
      // Criar um elemento temporário com o conteúdo do plano
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-plan-content';
      tempDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">
            ${chatType === 'nutrition' ? 'Cardápio Personalizado' : 'Plano de Treino Personalizado'}
          </h1>
          <div style="white-space: pre-wrap; line-height: 1.6;">
            ${lastPlanContent}
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const fileName = chatType === 'nutrition' 
        ? `cardapio_personalizado_${Date.now()}`
        : `treino_personalizado_${Date.now()}`;
        
      await generateElementPDF('temp-plan-content', fileName);
      
      document.body.removeChild(tempDiv);
      setShowPDFOffer(false);
      
      // Adicionar mensagem confirmando geração do PDF
      const confirmMessage: Message = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: 'PDF gerado com sucesso! ✅ Você pode encontrá-lo na pasta de downloads do seu dispositivo.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMessage]);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        content: 'Desculpe, houve um erro ao gerar o PDF. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Card className="h-[70vh] flex flex-col max-w-4xl mx-auto bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
      <CardHeader className="pb-4 border-b border-white/10">
        <CardTitle className="flex items-center gap-2">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Bot className="h-6 w-6 text-primary" />
          {chatType === 'personal' ? 'Personal IA' : 'Nutri IA'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 bg-gradient-to-b from-black via-black to-slate-800">
        <ScrollArea className="flex-1 px-6 bg-gradient-to-b from-black via-black to-slate-800">
          <div className="space-y-4 pb-4 bg-gradient-to-b from-black via-black to-slate-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-4 rounded-lg border transition-all duration-300 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto border-primary/20 shadow-lg'
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 shadow-lg backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {(isLoading || isGeneratingPlan) && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-4 rounded-lg shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">
                      {isGeneratingPlan ? 'Gerando seu plano personalizado...' : 'Digitando...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        {showPDFOffer && (
          <div className="border-t border-b border-white/10 p-4 bg-slate-800/50">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/80">
                Gostaria de gerar este {chatType === 'nutrition' ? 'cardápio' : 'treino'} em PDF?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  size="sm"
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {isGenerating ? 'Gerando...' : 'Gerar PDF'}
                </Button>
                <Button
                  onClick={() => setShowPDFOffer(false)}
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Não, obrigado
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t border-white/10 p-4 bg-gradient-to-b from-black via-black to-slate-800">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Digite sua mensagem...`}
              disabled={isLoading || isGeneratingPlan}
              className="flex-1 bg-slate-800/50 border-white/20 focus:border-primary/50 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || isGeneratingPlan}
              size="icon"
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};