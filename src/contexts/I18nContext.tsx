import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Translation files
const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Navigation
    'nav.home': 'Início',
    'nav.walking': 'Caminhada',
    'nav.personal': 'Personal IA',
    'nav.nutrition': 'Nutrição',
    'nav.monitoring': 'Monitoramento',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    'nav.login': 'Entrar',
    
    // Profile
    'profile.title': 'Meu Perfil',
    'profile.summary': 'Resumo Geral',
    'profile.monthlyProgress': 'Progresso Mensal',
    'profile.editProfile': 'Editar Perfil',
    'profile.subscription': 'Assinatura',
    'profile.support': 'Suporte',
    'profile.privacy': 'Privacidade',
    
    // Settings Modal
    'settings.title': 'Configurações Gerais',
    'settings.description': 'Personalize sua experiência no aplicativo',
    'settings.appearance': 'Aparência',
    'settings.appearanceDesc': 'Escolha o tema e o idioma do aplicativo',
    'settings.theme': 'Tema',
    'settings.themeLight': 'Claro',
    'settings.themeDark': 'Escuro',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificações',
    'settings.notificationsDesc': 'Configure como você quer receber alertas',
    'settings.pushNotifications': 'Notificações Push',
    'settings.pushDesc': 'Receba lembretes e alertas importantes',
    'settings.goals': 'Metas e Preferências',
    'settings.goalsDesc': 'Defina seu objetivo principal e metas diárias',
    'settings.objective': 'Objetivo',
    'settings.selectObjective': 'Selecione',
    'settings.loseWeight': 'Perder peso',
    'settings.gainMass': 'Ganhar massa',
    'settings.maintainWeight': 'Manter peso',
    'settings.conditioning': 'Melhorar condicionamento',
    'settings.waterGoal': 'Meta de água (ml)',
    'settings.sleepGoal': 'Meta de sono (horas)',
    'settings.walkGoal': 'Meta de caminhada (km/semana)',
    'settings.reminders': 'Lembretes',
    'settings.remindersDesc': 'Lembretes automáticos durante o dia',
    'settings.waterReminder': 'Lembrete de água',
    'settings.sleepReminder': 'Lembrete de sono',
    'settings.walkReminder': 'Lembrete de caminhada',
    'settings.data': 'Dados',
    'settings.dataDesc': 'Gerencie seus dados e exportações',
    'settings.autoSave': 'Salvamento Automático',
    'settings.autoSaveDesc': 'Salva automaticamente suas informações',
    'settings.export': 'Exportar dados',
    'settings.reset': 'Resetar progresso do mês',
    'settings.cancel': 'Cancelar',
    'settings.save': 'Salvar Configurações',
    'settings.saving': 'Salvando...',
    'settings.saved': 'Configurações salvas',
    'settings.savedDesc': 'Suas preferências foram atualizadas com sucesso.',
    'settings.error': 'Erro ao salvar',
    'settings.errorDesc': 'Não foi possível salvar as configurações.',
    
    // Reset dialog
    'reset.title': 'Resetar progresso?',
    'reset.description': 'Isso vai apagar todos os registros de água, sono, caminhadas e alimentação deste mês. Essa ação não pode ser desfeita.',
    'reset.confirm': 'Confirmar',
    'reset.deleting': 'Apagando...',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
  },
  'en-US': {
    // Navigation
    'nav.home': 'Home',
    'nav.walking': 'Walking',
    'nav.personal': 'Personal AI',
    'nav.nutrition': 'Nutrition',
    'nav.monitoring': 'Monitoring',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.summary': 'General Summary',
    'profile.monthlyProgress': 'Monthly Progress',
    'profile.editProfile': 'Edit Profile',
    'profile.subscription': 'Subscription',
    'profile.support': 'Support',
    'profile.privacy': 'Privacy',
    
    // Settings Modal
    'settings.title': 'General Settings',
    'settings.description': 'Customize your app experience',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Choose the theme and language of the app',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Configure how you want to receive alerts',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushDesc': 'Receive reminders and important alerts',
    'settings.goals': 'Goals & Preferences',
    'settings.goalsDesc': 'Set your main objective and daily goals',
    'settings.objective': 'Objective',
    'settings.selectObjective': 'Select',
    'settings.loseWeight': 'Lose weight',
    'settings.gainMass': 'Gain muscle',
    'settings.maintainWeight': 'Maintain weight',
    'settings.conditioning': 'Improve conditioning',
    'settings.waterGoal': 'Water goal (ml)',
    'settings.sleepGoal': 'Sleep goal (hours)',
    'settings.walkGoal': 'Walking goal (km/week)',
    'settings.reminders': 'Reminders',
    'settings.remindersDesc': 'Automatic reminders throughout the day',
    'settings.waterReminder': 'Water reminder',
    'settings.sleepReminder': 'Sleep reminder',
    'settings.walkReminder': 'Walking reminder',
    'settings.data': 'Data',
    'settings.dataDesc': 'Manage your data and exports',
    'settings.autoSave': 'Auto Save',
    'settings.autoSaveDesc': 'Automatically save your information',
    'settings.export': 'Export data',
    'settings.reset': 'Reset monthly progress',
    'settings.cancel': 'Cancel',
    'settings.save': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.saved': 'Settings saved',
    'settings.savedDesc': 'Your preferences have been updated successfully.',
    'settings.error': 'Error saving',
    'settings.errorDesc': 'Could not save settings.',
    
    // Reset dialog
    'reset.title': 'Reset progress?',
    'reset.description': 'This will delete all water, sleep, walking and nutrition records from this month. This action cannot be undone.',
    'reset.confirm': 'Confirm',
    'reset.deleting': 'Deleting...',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  'es-ES': {
    // Navigation
    'nav.home': 'Inicio',
    'nav.walking': 'Caminata',
    'nav.personal': 'Personal IA',
    'nav.nutrition': 'Nutrición',
    'nav.monitoring': 'Monitoreo',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.logout': 'Salir',
    'nav.login': 'Entrar',
    
    // Profile
    'profile.title': 'Mi Perfil',
    'profile.summary': 'Resumen General',
    'profile.monthlyProgress': 'Progreso Mensual',
    'profile.editProfile': 'Editar Perfil',
    'profile.subscription': 'Suscripción',
    'profile.support': 'Soporte',
    'profile.privacy': 'Privacidad',
    
    // Settings Modal
    'settings.title': 'Configuración General',
    'settings.description': 'Personaliza tu experiencia en la aplicación',
    'settings.appearance': 'Apariencia',
    'settings.appearanceDesc': 'Elige el tema y el idioma de la aplicación',
    'settings.theme': 'Tema',
    'settings.themeLight': 'Claro',
    'settings.themeDark': 'Oscuro',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.notificationsDesc': 'Configura cómo quieres recibir alertas',
    'settings.pushNotifications': 'Notificaciones Push',
    'settings.pushDesc': 'Recibe recordatorios y alertas importantes',
    'settings.goals': 'Metas y Preferencias',
    'settings.goalsDesc': 'Define tu objetivo principal y metas diarias',
    'settings.objective': 'Objetivo',
    'settings.selectObjective': 'Seleccionar',
    'settings.loseWeight': 'Perder peso',
    'settings.gainMass': 'Ganar masa',
    'settings.maintainWeight': 'Mantener peso',
    'settings.conditioning': 'Mejorar condicionamiento',
    'settings.waterGoal': 'Meta de agua (ml)',
    'settings.sleepGoal': 'Meta de sueño (horas)',
    'settings.walkGoal': 'Meta de caminata (km/semana)',
    'settings.reminders': 'Recordatorios',
    'settings.remindersDesc': 'Recordatorios automáticos durante el día',
    'settings.waterReminder': 'Recordatorio de agua',
    'settings.sleepReminder': 'Recordatorio de sueño',
    'settings.walkReminder': 'Recordatorio de caminata',
    'settings.data': 'Datos',
    'settings.dataDesc': 'Gestiona tus datos y exportaciones',
    'settings.autoSave': 'Guardado Automático',
    'settings.autoSaveDesc': 'Guarda automáticamente tu información',
    'settings.export': 'Exportar datos',
    'settings.reset': 'Resetear progreso del mes',
    'settings.cancel': 'Cancelar',
    'settings.save': 'Guardar Configuración',
    'settings.saving': 'Guardando...',
    'settings.saved': 'Configuración guardada',
    'settings.savedDesc': 'Tus preferencias han sido actualizadas con éxito.',
    'settings.error': 'Error al guardar',
    'settings.errorDesc': 'No se pudo guardar la configuración.',
    
    // Reset dialog
    'reset.title': '¿Resetear progreso?',
    'reset.description': 'Esto eliminará todos los registros de agua, sueño, caminatas y alimentación de este mes. Esta acción no se puede deshacer.',
    'reset.confirm': 'Confirmar',
    'reset.deleting': 'Eliminando...',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
  },
};

// Get initial language from localStorage
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tudofit-language');
    if (stored === 'pt-BR' || stored === 'en-US' || stored === 'es-ES') {
      return stored;
    }
  }
  return 'pt-BR';
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load language from user settings when user logs in
  useEffect(() => {
    const loadLanguageFromSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('language')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.language) {
          const userLanguage = data.language as Language;
          if (['pt-BR', 'en-US', 'es-ES'].includes(userLanguage)) {
            setLanguageState(userLanguage);
            localStorage.setItem('tudofit-language', userLanguage);
          }
        }
      } catch (err) {
        console.error('Error loading language:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageFromSettings();
  }, [user]);

  const setLanguage = useCallback(async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('tudofit-language', newLanguage);

    // Save to Supabase if user is logged in
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_settings')
            .update({ language: newLanguage, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_settings')
            .insert({ user_id: user.id, language: newLanguage });
        }
      } catch (err) {
        console.error('Error saving language:', err);
      }
    }
  }, [user]);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
