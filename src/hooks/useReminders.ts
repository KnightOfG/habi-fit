import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Reminder, ReminderFormData } from '../types';

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('reminders')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('reminder_date', { ascending: true })
      .order('reminder_time', { ascending: true });

    if (!error && data) setReminders(data as Reminder[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const addReminder = async (form: ReminderFormData) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('reminders')
      .insert({ ...form, user_id: user.id })
      .select('*, category:categories(*)')
      .maybeSingle();

    if (!error && data) setReminders(prev => [...prev, data as Reminder].sort((a, b) => {
      const dateComp = a.reminder_date.localeCompare(b.reminder_date);
      return dateComp !== 0 ? dateComp : a.reminder_time.localeCompare(b.reminder_time);
    }));
    return { error: error?.message ?? null };
  };

  const updateReminder = async (id: string, updates: Partial<ReminderFormData & { is_done: boolean }>) => {
    const { data, error } = await supabase
      .from('reminders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*)')
      .maybeSingle();

    if (!error && data) setReminders(prev => prev.map(r => r.id === id ? (data as Reminder) : r));
    return { error: error?.message ?? null };
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (!error) setReminders(prev => prev.filter(r => r.id !== id));
    return { error: error?.message ?? null };
  };

  const toggleDone = async (id: string, is_done: boolean) => {
    return updateReminder(id, { is_done });
  };

  const getByDate = (date: string) => reminders.filter(r => r.reminder_date === date);
  const getByCategory = (categoryId: string) => reminders.filter(r => r.category_id === categoryId);

  return {
    reminders, loading, addReminder, updateReminder, deleteReminder,
    toggleDone, getByDate, getByCategory, refresh: fetchReminders
  };
}
