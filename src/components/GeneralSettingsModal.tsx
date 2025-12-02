import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserSummary } from '@/hooks/useUserSummary';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { useTheme } from '@/contexts/ThemeContext';
import { scheduleDefaultReminders, applyLanguagePreference } from '@/utils/reminders';
import { Settings, Bell, Palette, Moon, Sun, Target, Clock, Database, Download, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, loading, saveSettings, exportData, resetMonthlyProgress } = useUserSettings();
  const { refetch: refetchSummary } = useUserSummary();
  const { refetch: refetchMonthly } = useMonthlyStats();
  const { theme, setTheme } = useTheme();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Local state for form
  const [formData, setFormData] = useState({
    theme: 'dark' as 'light' | 'dark',
    language: 'pt-BR',
    push_notifications_enabled: true,
    fitness_goal: '',
    water_goal_ml: 2000,
    sleep_goal_hours: 8,
    walk_goal_km_week: 10,
    reminder_water_enabled: false,
    reminder_sleep_enabled: false,
    reminder_walk_enabled: false,
    auto_save_enabled: true,
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        theme: (settings.theme as 'light' | 'dark') || 'dark',
        language: settings.language || 'pt-BR',
        push_notifications_enabled: settings.push_notifications_enabled ?? true,
        fitness_goal: settings.fitness_goal || '',
        water_goal_ml: settings.water_goal_ml || 2000,
        sleep_goal_hours: settings.sleep_goal_hours || 8,
        walk_goal_km_week: settings.walk_goal_km_week || 10,
        reminder_water_enabled: settings.reminder_water_enabled ?? false,
        reminder_sleep_enabled: settings.reminder_sleep_enabled ?? false,
        reminder_walk_enabled: settings.reminder_walk_enabled ?? false,
        auto_save_enabled: settings.auto_save_enabled ?? true,
      });
    }
  }, [settings]);

  // Sync theme from context
  useEffect(() => {
    setFormData(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Apply theme immediately when changed
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await saveSettings(formData);
      applyLanguagePreference(formData.language);
      await scheduleDefaultReminders({
        ...settings,
        ...formData,
        user_id: settings?.user_id || '',
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    await exportData();
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    const { error } = await resetMonthlyProgress();
    setIsResetting(false);
    setShowResetConfirm(false);
    
    if (!error) {
      // Refresh data in other components
      refetchSummary();
      refetchMonthly();
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </DialogTitle>
            <DialogDescription>
              Personalize sua experiência no aplicativo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* CARD 1 — Aparência */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-4 w-4" />
                  Aparência
                </CardTitle>
                <CardDescription className="text-sm">
                  Escolha o tema e o idioma do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={formData.theme} onValueChange={(value) => handleChange('theme', value)}>
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Claro
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Escuro
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={formData.language} onValueChange={(value) => handleChange('language', value)}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (BR)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español (ES)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2 — Notificações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4" />
                  Notificações
                </CardTitle>
                <CardDescription className="text-sm">
                  Configure como você quer receber alertas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes e alertas importantes
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={formData.push_notifications_enabled}
                    onCheckedChange={(checked) => handleChange('push_notifications_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* CARD 3 — Metas & Preferências */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" />
                  Metas e Preferências
                </CardTitle>
                <CardDescription className="text-sm">
                  Defina seu objetivo principal e metas diárias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fitness_goal">Objetivo</Label>
                    <Select value={formData.fitness_goal} onValueChange={(value) => handleChange('fitness_goal', value)}>
                      <SelectTrigger id="fitness_goal">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perder_peso">Perder peso</SelectItem>
                        <SelectItem value="ganhar_massa">Ganhar massa</SelectItem>
                        <SelectItem value="manter_peso">Manter peso</SelectItem>
                        <SelectItem value="condicionamento">Melhorar condicionamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water_goal">Meta de água (ml)</Label>
                    <Input
                      id="water_goal"
                      type="number"
                      placeholder="2000"
                      value={formData.water_goal_ml}
                      onChange={(e) => handleChange('water_goal_ml', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sleep_goal">Meta de sono (horas)</Label>
                    <Input
                      id="sleep_goal"
                      type="number"
                      placeholder="8"
                      value={formData.sleep_goal_hours}
                      onChange={(e) => handleChange('sleep_goal_hours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="walk_goal">Meta de caminhada (km/semana)</Label>
                    <Input
                      id="walk_goal"
                      type="number"
                      placeholder="10"
                      value={formData.walk_goal_km_week}
                      onChange={(e) => handleChange('walk_goal_km_week', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4 — Lembretes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Lembretes
                </CardTitle>
                <CardDescription className="text-sm">
                  Lembretes automáticos durante o dia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de água</Label>
                    <p className="text-xs text-muted-foreground">9h, 14h e 20h</p>
                  </div>
                  <Switch
                    checked={formData.reminder_water_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_water_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de sono</Label>
                    <p className="text-xs text-muted-foreground">22h</p>
                  </div>
                  <Switch
                    checked={formData.reminder_sleep_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_sleep_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de caminhada</Label>
                    <p className="text-xs text-muted-foreground">17h</p>
                  </div>
                  <Switch
                    checked={formData.reminder_walk_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_walk_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* CARD 5 — Dados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="h-4 w-4" />
                  Dados
                </CardTitle>
                <CardDescription className="text-sm">
                  Gerencie seus dados e exportações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autosave">Salvamento Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Salva automaticamente suas informações
                    </p>
                  </div>
                  <Switch
                    id="autosave"
                    checked={formData.auto_save_enabled}
                    onCheckedChange={(checked) => handleChange('auto_save_enabled', checked)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                    Exportar dados
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Resetar progresso do mês
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar progresso?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai apagar todos os registros de água, sono, caminhadas e alimentação deste mês. 
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? 'Apagando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
