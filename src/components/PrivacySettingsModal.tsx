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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Shield, Trash2, UserX } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Delete user data from tracking tables
      await supabase.from('water_tracking').delete().eq('user_id', user.id);
      await supabase.from('sleep_tracking').delete().eq('user_id', user.id);
      await supabase.from('walk_sessions').delete().eq('user_id', user.id);
      await supabase.from('walking_sessions').delete().eq('user_id', user.id);
      
      // Delete user settings
      await supabase.from('user_settings').delete().eq('user_id', user.id);
      
      // Delete questionnaires and plans
      await supabase.from('personal_questionnaire').delete().eq('user_id', user.id);
      await supabase.from('nutrition_questionnaire').delete().eq('user_id', user.id);
      await supabase.from('workout_plans').delete().eq('user_id', user.id);
      await supabase.from('meal_plans').delete().eq('user_id', user.id);
      
      // Delete AI conversations and messages
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('user_id', user.id);
      
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);
        await supabase.from('ai_messages').delete().in('conversation_id', conversationIds);
        await supabase.from('ai_conversations').delete().eq('user_id', user.id);
      }
      
      // Delete profile
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      // Sign out and redirect
      await signOut();
      
      toast({
        title: "Conta excluída",
        description: "Sua conta e todos os dados foram removidos com sucesso.",
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações de Privacidade
            </DialogTitle>
            <DialogDescription>
              Gerencie sua conta e dados pessoais
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Card Único — Conta e Dados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserX className="h-4 w-4" />
                  Conta e Dados
                </CardTitle>
                <CardDescription className="text-sm">
                  Gerencie o encerramento e remoção da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir minha conta
                </Button>
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
              e removerá todos os seus dados, incluindo histórico de treinos, nutrição,
              monitoramento e configurações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
