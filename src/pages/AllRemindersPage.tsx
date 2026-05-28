import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useReminders } from '../hooks/useReminders';
import ReminderCard from '../components/ReminderCard';
import ReminderFormModal from '../components/ReminderFormModal';
import CommentModal from '../components/CommentModal';
import type { Reminder, ReminderFormData } from '../types';

export default function AllRemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleDone } = useReminders();
  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentReminderId, setCommentReminderId] = useState<string | null>(null);
  const [commentReminderTitle, setCommentReminderTitle] = useState('');

  const grouped = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    for (const r of reminders) {
      const key = r.reminder_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [reminders]);

  const handleAdd = async (data: ReminderFormData) => addReminder(data);
  const handleEdit = async (data: ReminderFormData) => {
    if (!editingReminder) return { error: null };
    const result = await updateReminder(editingReminder.id, data);
    setEditingReminder(null);
    return result;
  };

  const handleComment = (reminderId: string) => {
    const r = reminders.find(r => r.id === reminderId);
    setCommentReminderId(reminderId);
    setCommentReminderTitle(r?.title ?? '');
    setCommentOpen(true);
  };

  return (
    <div className="px-4 pb-24">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">All Reminders</h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setEditingReminder(null); setFormOpen(true); }}
          className="bg-accent hover:bg-accent-dim text-white rounded-full p-2.5 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {grouped.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-text-muted text-sm">No reminders yet</p>
          <p className="text-text-muted/60 text-xs mt-1">Tap + to create your first reminder</p>
        </motion.div>
      ) : (
        grouped.map(([date, items]) => {
          const label = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d');
          const pending = items.filter(r => !r.is_done);
          const done = items.filter(r => r.is_done);

          return (
            <div key={date} className="mb-6">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2 sticky top-0 bg-surface-0/95 backdrop-blur-sm py-1 z-10">
                {label}
              </p>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {pending.map(r => (
                    <ReminderCard
                      key={r.id}
                      reminder={r}
                      onToggleDone={toggleDone}
                      onEdit={rem => { setEditingReminder(rem); setFormOpen(true); }}
                      onDelete={deleteReminder}
                      onAddComment={handleComment}
                    />
                  ))}
                  {done.map(r => (
                    <ReminderCard
                      key={r.id}
                      reminder={r}
                      onToggleDone={toggleDone}
                      onEdit={rem => { setEditingReminder(rem); setFormOpen(true); }}
                      onDelete={deleteReminder}
                      onAddComment={handleComment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })
      )}

      <ReminderFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingReminder(null); }}
        onSubmit={editingReminder ? handleEdit : handleAdd}
        initial={editingReminder}
      />

      <CommentModal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        reminderId={commentReminderId}
        reminderTitle={commentReminderTitle}
      />
    </div>
  );
}
