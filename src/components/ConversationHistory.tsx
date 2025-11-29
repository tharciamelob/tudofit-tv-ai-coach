import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Plus, 
  Trash2, 
  Calendar,
  Brain,
  Apple,
  History
} from 'lucide-react';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConversationHistoryProps {
  conversationType: 'personal' | 'nutrition';
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const ConversationHistory = ({ 
  conversationType, 
  onSelectConversation, 
  onNewConversation 
}: ConversationHistoryProps) => {
  const [deleteId, setDeleteId] = useState<string>('');
  const { 
    conversations, 
    isLoading, 
    deleteConversation
  } = useConversationHistory(conversationType);

  const handleDelete = async (conversationId: string) => {
    await deleteConversation(conversationId);
    setDeleteId('');
  };

  const getTitle = () => {
    return conversationType === 'personal' ? 'Personal IA' : 'Nutri IA';
  };

  const IconComponent = conversationType === 'personal' ? Brain : Apple;

  return (
    <Card className="h-full bg-gradient-to-b from-black via-black to-slate-800 border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <IconComponent className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span>Histórico - {getTitle()}</span>
            <p className="text-sm text-muted-foreground font-normal">
              {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Botão Nova Conversa */}
        <Button 
          onClick={onNewConversation}
          className="w-full gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova Conversa
        </Button>

        {/* Lista de Conversas */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Nenhuma conversa ainda
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Inicie uma nova conversa para começar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10 hover:border-primary/20"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <Badge 
                            variant="outline" 
                            className="text-xs border-primary/30 text-primary"
                          >
                            {conversationType === 'personal' ? 'Treino' : 'Nutrição'}
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium text-sm text-foreground truncate mb-1">
                          {conversation.title || `Conversa ${conversationType === 'personal' ? 'Personal' : 'Nutri'}`}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(conversation.updated_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(conversation.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar Conversa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar esta conversa? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(conversation.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};