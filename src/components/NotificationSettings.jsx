import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  requestNotificationPermission,
  scheduleNotification,
  clearScheduledNotification,
  fireNotification
} from '../utils/notificationUtils';

const NotificationSettings = ({ onClose }) => {
  const [prefs, setPrefs] = useState(getNotificationPrefs());
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [status, setStatus] = useState('');

  useEffect(() => {
    setPermission('Notification' in window ? Notification.permission : 'unsupported');
  }, []);

  const handleToggle = async () => {
    if (!prefs.enabled) {
      // Enabling — request permission first
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== 'granted') {
        setStatus('Permission denied. Enable notifications in your browser settings.');
        return;
      }
      const updated = { ...prefs, enabled: true };
      setPrefs(updated);
      saveNotificationPrefs(updated);
      scheduleNotification(updated.time);
      setStatus('Reminders enabled.');
    } else {
      // Disabling
      const updated = { ...prefs, enabled: false };
      setPrefs(updated);
      saveNotificationPrefs(updated);
      clearScheduledNotification();
      setStatus('Reminders disabled.');
    }
  };

  const handleTimeChange = (e) => {
    const updated = { ...prefs, time: e.target.value };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    if (updated.enabled && permission === 'granted') {
      clearScheduledNotification();
      scheduleNotification(updated.time);
    }
  };

  const handleTest = () => {
    if (permission !== 'granted') {
      setStatus('Grant permission first.');
      return;
    }
    fireNotification();
    setStatus('Test notification sent.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Workout Reminders</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {permission === 'unsupported' ? (
          <p className="text-red-600 text-sm">Your browser does not support notifications.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-800 font-medium">Daily reminder</span>
              <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  prefs.enabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {prefs.enabled ? <Bell size={16} /> : <BellOff size={16} />}
                {prefs.enabled ? 'On' : 'Off'}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Reminder time</label>
              <input
                type="time"
                value={prefs.time}
                onChange={handleTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleTest}
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
              >
                Send Test
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded-md transition-colors"
              >
                Done
              </button>
            </div>

            {status && (
              <p className="mt-3 text-sm text-gray-600 text-center">{status}</p>
            )}

            {permission === 'denied' && (
              <p className="mt-3 text-xs text-red-500 text-center">
                Notifications are blocked. Go to your browser settings and allow notifications for this site.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
