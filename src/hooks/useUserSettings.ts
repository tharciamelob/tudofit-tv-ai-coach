import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  id?: string;
  user_id: string;
  fitness_goal: string | null;
  water_goal_ml: number;
  sleep_goal_hours: number;
  walk_goal_km_week: number;
  reminder_water_enabled: boolean;
  reminder_water_time: string | null;
  reminder_sleep_enabled: boolean;
  reminder_sleep_time: string | null;
  reminder_walk_enabled: boolean;
  auto_save_enabled: boolean;
  push_notifications_enabled: boolean;
  theme: string;
  language: string;
}

const defaultSettings: Omit<UserSettings, 'user_id'> = {
  fitness_goal: null,
  water_goal_ml: 2000,
  sleep_goal_hours: 8,
  walk_goal_km_week: 10,
  reminder_water_enabled: false,
  reminder_water_time: null,
  reminder_sleep_enabled: false,
  reminder_sleep_time: null,
  reminder_walk_enabled: false,
  auto_save_enabled: true,
  push_notifications_enabled: true,
  theme: 'dark',
  language: 'pt-BR',
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSettings(data as UserSettings);
      } else {
        // Return default settings if none exist
        setSettings({
          ...defaultSettings,
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const settingsToSave = {
        ...newSettings,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      // Check if settings exist
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('user_settings')
          .update(settingsToSave)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('user_settings')
          .insert(settingsToSave)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Sync fitness_goal with profiles table
      if (newSettings.fitness_goal !== undefined) {
        await supabase
          .from('profiles')
          .update({ fitness_goal: newSettings.fitness_goal })
          .eq('user_id', user.id);
      }

      setSettings(result.data as UserSettings);
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso!",
      });

      return { error: null };
    } catch (err) {
      console.error('Error saving user settings:', err);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      return { error: err as Error };
    }
  }, [user, toast]);

  const exportData = useCallback(async () => {
    if (!user) return;

    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      // Fetch all tracking data
      const [waterData, sleepData, walkData] = await Promise.all([
        supabase
          .from('water_tracking')
          .select('date, amount_ml, daily_goal_ml')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date'),
        supabase
          .from('sleep_tracking')
          .select('date, bedtime, wake_time, sleep_quality')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date'),
        supabase
          .from('walk_sessions')
          .select('created_at, distance_meters, steps, calories_burned')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at'),
      ]);

      // Build CSV content
      let csv = 'Tipo,Data,Valor,Meta,Unidade\n';

      // Water data
      waterData.data?.forEach(row => {
        csv += `Água,${row.date},${row.amount_ml},${row.daily_goal_ml || 2000},ml\n`;
      });

      // Sleep data
      sleepData.data?.forEach(row => {
        csv += `Sono,${row.date},${row.sleep_quality || '-'},-,qualidade\n`;
      });

      // Walk data
      walkData.data?.forEach(row => {
        const date = row.created_at.split('T')[0];
        csv += `Caminhada,${date},${row.distance_meters || 0},-,metros\n`;
        if (row.steps) csv += `Passos,${date},${row.steps},-,passos\n`;
        if (row.calories_burned) csv += `Calorias,${date},${row.calories_burned},-,kcal\n`;
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tudofit_export_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: "Seus dados dos últimos 30 dias foram exportados.",
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const resetMonthlyProgress = useCallback(async () => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startDate = startOfMonth.toISOString().split('T')[0];

      // Delete all tracking data for current month
      await Promise.all([
        supabase
          .from('water_tracking')
          .delete()
          .eq('user_id', user.id)
          .gte('date', startDate),
        supabase
          .from('sleep_tracking')
          .delete()
          .eq('user_id', user.id)
          .gte('date', startDate),
        supabase
          .from('walk_sessions')
          .delete()
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString()),
      ]);

      toast({
        title: "Progresso resetado",
        description: "Todos os registros deste mês foram apagados.",
      });

      return { error: null };
    } catch (err) {
      console.error('Error resetting progress:', err);
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível apagar os registros.",
        variant: "destructive",
      });
      return { error: err as Error };
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    exportData,
    resetMonthlyProgress,
    refetch: fetchSettings,
  };
};
