import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Comment } from '../types';

export function useComments(reminderId: string | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!reminderId || !user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('reminder_id', reminderId)
      .order('created_at', { ascending: true });

    if (!error && data) setComments(data);
    setLoading(false);
  }, [reminderId, user]);

  const addComment = async (content: string) => {
    if (!reminderId || !user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('comments')
      .insert({ reminder_id: reminderId, user_id: user.id, content })
      .select()
      .maybeSingle();

    if (!error && data) setComments(prev => [...prev, data]);
    return { error: error?.message ?? null };
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (!error) setComments(prev => prev.filter(c => c.id !== id));
    return { error: error?.message ?? null };
  };

  return { comments, loading, fetchComments, addComment, deleteComment };
}
