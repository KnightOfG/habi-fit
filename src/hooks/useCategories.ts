import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Category } from '../types';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data) setCategories(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const addCategory = async (name: string, color: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, color, user_id: user.id })
      .select()
      .maybeSingle();

    if (!error && data) setCategories(prev => [...prev, data]);
    return { error: error?.message ?? null };
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, color })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!error && data) setCategories(prev => prev.map(c => c.id === id ? data : c));
    return { error: error?.message ?? null };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setCategories(prev => prev.filter(c => c.id !== id));
    return { error: error?.message ?? null };
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, refresh: fetchCategories };
}
