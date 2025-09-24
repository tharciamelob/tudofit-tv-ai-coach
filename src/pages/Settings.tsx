import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Mail, Shield, LogOut, User } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: authLoading } = useAuthGuard();
  
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (authLoading) {
    return <div>Carregando...</div>;
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro",
        description: "Erro ao encerrar sessão.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Sessões encerradas",
        description: "Você foi desconectado de todos os dispositivos.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Global logout error:', error);
      toast({
        title: "Erro",
        description: "Erro ao encerrar sessões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      await supabase.auth.resend({ type: 'signup', email: user.email });
      toast({
        title: "E-mail reenviado",
        description: "Confira sua caixa de entrada/spam.",
      });
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar e-mail de confirmação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      toast({
        title: "Erro",
        description: "Digite o novo e-mail.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;
      
      toast({
        title: "Solicitação enviada",
        description: "Verifique o novo e-mail para confirmar a alteração.",
      });
      setNewEmail('');
    } catch (error) {
      console.error('Email update error:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar troca de e-mail.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailVerified = user?.email_confirmed_at;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Configurações</h1>
          </div>

          {/* Minha Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Minha Conta</span>
              </CardTitle>
              <CardDescription>
                Informações da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-muted"
                  />
                  {isEmailVerified ? (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verificado</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Não verificado</span>
                    </Badge>
                  )}
                </div>
              </div>

              {!isEmailVerified && (
                <Button
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Reenviar confirmação
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>
                Altere sua senha e gerencie sessões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !newPassword || !confirmPassword}
                >
                  Alterar senha
                </Button>
              </div>

              <Separator />

              <Button
                onClick={handleGlobalLogout}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Sair de todos os dispositivos
              </Button>
            </CardContent>
          </Card>

          {/* E-mail */}
          <Card>
            <CardHeader>
              <CardTitle>Trocar E-mail</CardTitle>
              <CardDescription>
                Você precisará confirmar o novo e-mail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Novo e-mail</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Digite o novo e-mail"
                />
              </div>
              <Button
                onClick={handleEmailChange}
                disabled={isLoading || !newEmail}
                variant="outline"
              >
                Solicitar troca de e-mail
              </Button>
            </CardContent>
          </Card>

          {/* Sair */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LogOut className="h-5 w-5" />
                <span>Sair da Conta</span>
              </CardTitle>
              <CardDescription>
                Encerrar sua sessão atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                Sair da conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;