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
    
    // Save settings to Supabase
    await saveSettings(formData);
    
    // Apply language preference
    applyLanguagePreference(formData.language);
    
    // Schedule reminders based on settings
    await scheduleDefaultReminders({
      ...settings,
      ...formData,
      user_id: settings?.user_id || '',
    });
    
    setIsSaving(false);
    onClose();
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
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </DialogTitle>
            <DialogDescription>
              Personalize sua experiência no aplicativo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-4 w-4" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Configure o tema e aparência do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={formData.theme} onValueChange={(value) => handleChange('theme', value)}>
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (BR)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-4 w-4" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes de treinos e refeições
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

            {/* Metas & Preferências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-4 w-4" />
                  Metas & Preferências
                </CardTitle>
                <CardDescription>
                  Defina seus objetivos e metas diárias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Objetivo principal</Label>
                  <Select value={formData.fitness_goal} onValueChange={(value) => handleChange('fitness_goal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perder_peso">Perder peso</SelectItem>
                      <SelectItem value="ganhar_massa">Ganhar massa</SelectItem>
                      <SelectItem value="manter_peso">Manter peso</SelectItem>
                      <SelectItem value="condicionamento">Melhorar condicionamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="water_goal">Meta diária de água (ml)</Label>
                    <Input
                      id="water_goal"
                      type="number"
                      placeholder="ex: 2000"
                      value={formData.water_goal_ml}
                      onChange={(e) => handleChange('water_goal_ml', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep_goal">Meta diária de sono (h)</Label>
                    <Input
                      id="sleep_goal"
                      type="number"
                      placeholder="ex: 8"
                      value={formData.sleep_goal_hours}
                      onChange={(e) => handleChange('sleep_goal_hours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="walk_goal">Meta semanal caminhada (km)</Label>
                    <Input
                      id="walk_goal"
                      type="number"
                      placeholder="ex: 10"
                      value={formData.walk_goal_km_week}
                      onChange={(e) => handleChange('walk_goal_km_week', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lembretes - Simplified (ON/OFF only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-4 w-4" />
                  Lembretes
                </CardTitle>
                <CardDescription>
                  Ative lembretes para suas atividades (horários padrão)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de beber água</Label>
                    <p className="text-sm text-muted-foreground">
                      Lembretes às 9h, 14h e 20h
                    </p>
                  </div>
                  <Switch
                    checked={formData.reminder_water_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_water_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de dormir</Label>
                    <p className="text-sm text-muted-foreground">
                      Lembrete às 22h
                    </p>
                  </div>
                  <Switch
                    checked={formData.reminder_sleep_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_sleep_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembrete de caminhar</Label>
                    <p className="text-sm text-muted-foreground">
                      Lembrete às 17h
                    </p>
                  </div>
                  <Switch
                    checked={formData.reminder_walk_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_walk_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-4 w-4" />
                  Dados
                </CardTitle>
                <CardDescription>
                  Gerencie seus dados e preferências de salvamento
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

          <DialogFooter>
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
