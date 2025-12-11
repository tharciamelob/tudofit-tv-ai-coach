import React, { createContext, useContext } from 'react';

// Fixed language - Portuguese (BR) only
const FIXED_LANGUAGE = 'pt-BR';

interface I18nContextType {
  language: string;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Translation file - Portuguese (BR) only
const translations: Record<string, string> = {
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
  'settings.appearanceDesc': 'Idioma do aplicativo',
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
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language: FIXED_LANGUAGE, t }}>
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
