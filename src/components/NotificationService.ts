import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Reminder } from '../types';

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function useNotifications() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (!user) return;

    const checkReminders = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('reminder_date', today)
        .eq('is_done', false);

      if (!reminders) return;

      for (const r of reminders as Reminder[]) {
        const [h, m] = r.reminder_time.split(':').map(Number);
        const reminderMinutes = h * 60 + m;
        const diff = reminderMinutes - currentMinutes;

        // 10 minutes before
        if (diff === 10 && !r.notified_10min && !notifiedRef.current.has(r.id + '_10')) {
          new Notification('Reminder in 10 minutes', {
            body: `${r.title} at ${formatTime(r.reminder_time)}`,
            icon: '/favicon.svg',
            tag: r.id + '_10min',
          });
          notifiedRef.current.add(r.id + '_10');
          supabase.from('reminders').update({ notified_10min: true }).eq('id', r.id);
        }

        // 5 minutes before
        if (diff === 5 && !r.notified_5min && !notifiedRef.current.has(r.id + '_5')) {
          new Notification('Reminder in 5 minutes!', {
            body: `${r.title} at ${formatTime(r.reminder_time)}`,
            icon: '/favicon.svg',
            tag: r.id + '_5min',
          });
          notifiedRef.current.add(r.id + '_5');
          supabase.from('reminders').update({ notified_5min: true }).eq('id', r.id);
        }
      }
    };

    checkReminders();
    intervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);
}
