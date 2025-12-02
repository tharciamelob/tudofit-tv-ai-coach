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
import { useI18n } from '@/contexts/I18nContext';
import { scheduleDefaultReminders } from '@/utils/reminders';
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
  const { language, setLanguage, t } = useI18n();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Local state for form (only for non-context values)
  const [formData, setFormData] = useState({
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

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Handle theme change - uses global context
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  // Handle language change - uses global context
  const handleLanguageChange = (newLanguage: 'pt-BR' | 'en-US' | 'es-ES') => {
    setLanguage(newLanguage);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save all settings including current theme and language from contexts
      await saveSettings({
        ...formData,
        theme,
        language,
      });
      
      await scheduleDefaultReminders({
        ...settings,
        ...formData,
        theme,
        language,
        user_id: settings?.user_id || '',
      });
      
      toast({
        title: t('settings.saved'),
        description: t('settings.savedDesc'),
      });
      
      onClose();
    } catch (error) {
      toast({
        title: t('settings.error'),
        description: t('settings.errorDesc'),
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
              {t('settings.title')}
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
              {t('settings.title')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* CARD 1 — Aparência */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="h-4 w-4" />
                  {t('settings.appearance')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t('settings.appearanceDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">{t('settings.theme')}</Label>
                    <Select value={theme} onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')}>
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            {t('settings.themeLight')}
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            {t('settings.themeDark')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">{t('settings.language')}</Label>
                    <Select value={language} onValueChange={(value) => handleLanguageChange(value as 'pt-BR' | 'en-US' | 'es-ES')}>
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
                  {t('settings.notifications')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t('settings.notificationsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">{t('settings.pushNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.pushDesc')}
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
                  {t('settings.goals')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t('settings.goalsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fitness_goal">{t('settings.objective')}</Label>
                    <Select value={formData.fitness_goal} onValueChange={(value) => handleChange('fitness_goal', value)}>
                      <SelectTrigger id="fitness_goal">
                        <SelectValue placeholder={t('settings.selectObjective')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perder_peso">{t('settings.loseWeight')}</SelectItem>
                        <SelectItem value="ganhar_massa">{t('settings.gainMass')}</SelectItem>
                        <SelectItem value="manter_peso">{t('settings.maintainWeight')}</SelectItem>
                        <SelectItem value="condicionamento">{t('settings.conditioning')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="water_goal">{t('settings.waterGoal')}</Label>
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
                    <Label htmlFor="sleep_goal">{t('settings.sleepGoal')}</Label>
                    <Input
                      id="sleep_goal"
                      type="number"
                      placeholder="8"
                      value={formData.sleep_goal_hours}
                      onChange={(e) => handleChange('sleep_goal_hours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="walk_goal">{t('settings.walkGoal')}</Label>
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
                  {t('settings.reminders')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t('settings.remindersDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.waterReminder')}</Label>
                    <p className="text-xs text-muted-foreground">9h, 14h, 20h</p>
                  </div>
                  <Switch
                    checked={formData.reminder_water_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_water_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.sleepReminder')}</Label>
                    <p className="text-xs text-muted-foreground">22h</p>
                  </div>
                  <Switch
                    checked={formData.reminder_sleep_enabled}
                    onCheckedChange={(checked) => handleChange('reminder_sleep_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.walkReminder')}</Label>
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
                  {t('settings.data')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t('settings.dataDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autosave">{t('settings.autoSave')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.autoSaveDesc')}
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
                    {t('settings.export')}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('settings.reset')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose}>
              {t('settings.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('settings.saving') : t('settings.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reset.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reset.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>{t('settings.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? t('reset.deleting') : t('reset.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
