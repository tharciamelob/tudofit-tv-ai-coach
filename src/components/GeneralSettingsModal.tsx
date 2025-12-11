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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserSummary } from '@/hooks/useUserSummary';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { Settings, Target, BarChart3, Trash2 } from 'lucide-react';
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
  const { settings, loading, saveSettings, resetMonthlyProgress } = useUserSettings();
  const { refetch: refetchSummary } = useUserSummary();
  const { refetch: refetchMonthly } = useMonthlyStats();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Local state for form
  const [formData, setFormData] = useState({
    fitness_goal: '',
    water_goal_ml: 2000,
    sleep_goal_hours: 8,
    walk_goal_km_week: 10,
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        fitness_goal: settings.fitness_goal || '',
        water_goal_ml: settings.water_goal_ml || 2000,
        sleep_goal_hours: settings.sleep_goal_hours || 8,
        walk_goal_km_week: settings.walk_goal_km_week || 10,
      });
    }
  }, [settings]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await saveSettings(formData);
      
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
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </DialogTitle>
            <DialogDescription>
              Personalize suas metas e preferências
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* CARD 1 — Metas & Preferências */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4" />
                  Metas e Preferências
                </CardTitle>
                <CardDescription className="text-sm">
                  Defina seu objetivo principal e suas metas de treino
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fitness_goal">Objetivo</Label>
                    <Select value={formData.fitness_goal} onValueChange={(value) => handleChange('fitness_goal', value)}>
                      <SelectTrigger id="fitness_goal">
                        <SelectValue placeholder="Selecione um objetivo" />
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

            {/* CARD 2 — Progresso */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Progresso
                </CardTitle>
                <CardDescription className="text-sm">
                  Gerencie seu histórico de progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-2 w-full sm:w-auto"
                  onClick={() => setShowResetConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Resetar progresso do mês
                </Button>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar progresso do mês?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá apagar todos os registros de água, sono e caminhadas do mês atual. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? "Apagando..." : "Confirmar Reset"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
