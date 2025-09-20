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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, Trash2, Download, Users, Lock } from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    dataSharing: false,
    analytics: true,
    locationTracking: false,
    socialSharing: true,
    personalizedAds: false,
  });
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('privacy-settings', JSON.stringify(privacySettings));
    
    toast({
      title: "Configurações de privacidade salvas",
      description: "Suas preferências de privacidade foram atualizadas!",
    });
    
    onClose();
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Solicitação registrada",
      description: "Sua solicitação de exclusão foi registrada. Entraremos em contato em até 48h.",
      variant: "destructive",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados serão enviados por email em até 24h.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Privacidade
          </DialogTitle>
          <DialogDescription>
            Controle como suas informações são utilizadas e compartilhadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visibilidade do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4 w-4" />
                Visibilidade do Perfil
              </CardTitle>
              <CardDescription>
                Controle quem pode ver suas informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visible">Perfil Público</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que outros usuários vejam seu perfil
                  </p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={privacySettings.profileVisible}
                  onCheckedChange={(checked) => handleSettingChange('profileVisible', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="social-sharing">Compartilhamento Social</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite compartilhar conquistas nas redes sociais
                  </p>
                </div>
                <Switch
                  id="social-sharing"
                  checked={privacySettings.socialSharing}
                  onCheckedChange={(checked) => handleSettingChange('socialSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados e Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-4 w-4" />
                Coleta de Dados
              </CardTitle>
              <CardDescription>
                Configure como coletamos e usamos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Dados de Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajuda a melhorar o aplicativo através de dados de uso
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={privacySettings.analytics}
                  onCheckedChange={(checked) => handleSettingChange('analytics', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-sharing">Compartilhamento de Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Compartilha dados anônimos com parceiros
                  </p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={privacySettings.dataSharing}
                  onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="location">Rastreamento de Localização</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite usar sua localização para funcionalidades
                  </p>
                </div>
                <Switch
                  id="location"
                  checked={privacySettings.locationTracking}
                  onCheckedChange={(checked) => handleSettingChange('locationTracking', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publicidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-4 w-4" />
                Publicidade
              </CardTitle>
              <CardDescription>
                Controle como recebe anúncios personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ads">Anúncios Personalizados</Label>
                  <p className="text-sm text-muted-foreground">
                    Recebe anúncios baseados em seus interesses
                  </p>
                </div>
                <Switch
                  id="ads"
                  checked={privacySettings.personalizedAds}
                  onCheckedChange={(checked) => handleSettingChange('personalizedAds', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Controle de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Controle dos seus Dados</CardTitle>
              <CardDescription>
                Gerencie ou exclua suas informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Meus Dados
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Minha Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                      e removerá seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};