import { UserSettings } from '@/hooks/useUserSettings';

// Default reminder times (24h format)
const DEFAULT_WATER_TIMES = ['09:00', '14:00', '20:00'];
const DEFAULT_SLEEP_TIME = '22:00';
const DEFAULT_WALK_TIME = '17:00';

/**
 * Schedules default reminders based on user settings.
 * 
 * TODO: Implement actual push notification scheduling using:
 * - Service Workers for web push
 * - Notification API
 * - Or a backend service for scheduled notifications
 * 
 * For now, this is a stub that logs the scheduled reminders.
 */
export const scheduleDefaultReminders = async (settings: UserSettings | null) => {
  if (!settings) {
    console.log('[Reminders] No settings provided, skipping reminder scheduling');
    return;
  }

  console.log('[Reminders] Scheduling reminders with settings:', {
    water: settings.reminder_water_enabled,
    sleep: settings.reminder_sleep_enabled,
    walk: settings.reminder_walk_enabled,
  });

  // Clear any existing reminders first
  await clearAllReminders();

  // Schedule water reminders
  if (settings.reminder_water_enabled) {
    console.log(`[Reminders] Water reminders enabled at: ${DEFAULT_WATER_TIMES.join(', ')}`);
    // TODO: Schedule actual notifications at these times
    // scheduleNotification('water', DEFAULT_WATER_TIMES);
  }

  // Schedule sleep reminder
  if (settings.reminder_sleep_enabled) {
    console.log(`[Reminders] Sleep reminder enabled at: ${DEFAULT_SLEEP_TIME}`);
    // TODO: Schedule actual notification at this time
    // scheduleNotification('sleep', [DEFAULT_SLEEP_TIME]);
  }

  // Schedule walk reminder
  if (settings.reminder_walk_enabled) {
    console.log(`[Reminders] Walk reminder enabled at: ${DEFAULT_WALK_TIME}`);
    // TODO: Schedule actual notification at this time
    // scheduleNotification('walk', [DEFAULT_WALK_TIME]);
  }
};

/**
 * Clears all scheduled reminders.
 * TODO: Implement actual clearing logic when push notifications are implemented.
 */
export const clearAllReminders = async () => {
  console.log('[Reminders] Clearing all scheduled reminders');
  // TODO: Clear scheduled notifications
};

/**
 * Request notification permission from the user.
 * Call this before scheduling notifications.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('[Reminders] This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Apply language preference.
 * TODO: Integrate with i18n system when implemented.
 */
export const applyLanguagePreference = (language: string) => {
  console.log(`[Language] Applying language preference: ${language}`);
  // TODO: When i18n is implemented, call i18n.changeLanguage(language) here
  // For now, just store the preference
  localStorage.setItem('tudofit-language', language);
};
