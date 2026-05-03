import { profileKey } from './profileManager.js';

const STORAGE_KEY = 'workout_notification_prefs';

export const getNotificationPrefs = () => {
  try {
    const data = localStorage.getItem(profileKey(STORAGE_KEY));
    return data ? JSON.parse(data) : { enabled: false, time: '08:00' };
  } catch {
    return { enabled: false, time: '08:00' };
  }
};

export const saveNotificationPrefs = (prefs) => {
  localStorage.setItem(profileKey(STORAGE_KEY), JSON.stringify(prefs));
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
};

export const getNextWorkoutName = () => {
  try {
    const historyData = localStorage.getItem(profileKey('workout_session_history'));
    const history = historyData ? JSON.parse(historyData) : [];

    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const completedThisWeek = new Set(
      history
        .filter(s => s.endTime && new Date(s.endTime) >= monday)
        .map(s => s.workoutKey)
    );

    const order = ['push1', 'pull1', 'legs1', 'push2', 'pull2', 'legs2'];
    const nameMap = {
      push1: 'Push 1', pull1: 'Pull 1', legs1: 'Legs 1',
      push2: 'Push 2', pull2: 'Pull 2', legs2: 'Legs 2'
    };
    const next = order.find(k => !completedThisWeek.has(k));
    return next ? nameMap[next] : 'your next workout';
  } catch {
    return 'your next workout';
  }
};

export const scheduleNotification = (timeString) => {
  // Clear any existing scheduled notification
  clearScheduledNotification();

  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  const timeoutId = setTimeout(() => {
    fireNotification();
    // Reschedule for next day
    scheduleNotification(timeString);
  }, delay);

  // Store timeout id in sessionStorage (survives page navigation but not close)
  sessionStorage.setItem('notification_timeout_id', timeoutId.toString());
};

export const clearScheduledNotification = () => {
  const id = sessionStorage.getItem('notification_timeout_id');
  if (id) {
    clearTimeout(parseInt(id));
    sessionStorage.removeItem('notification_timeout_id');
  }
};

export const fireNotification = () => {
  if (Notification.permission !== 'granted') return;
  const nextWorkout = getNextWorkoutName();
  new Notification('Training Reminder', {
    body: `Time to train! ${nextWorkout} is up next.`,
    icon: '/vite.svg',
    badge: '/vite.svg'
  });
};

export const initNotifications = () => {
  const prefs = getNotificationPrefs();
  if (prefs.enabled && Notification.permission === 'granted') {
    scheduleNotification(prefs.time);
  }
};
