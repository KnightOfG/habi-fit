import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import ReminderCard from '../components/ReminderCard';
import ReminderFormModal from '../components/ReminderFormModal';
import CommentModal from '../components/CommentModal';
import type { Reminder, ReminderFormData } from '../types';

export default function TodayPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleDone } = useReminders();
  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentReminderId, setCommentReminderId] = useState<string | null>(null);
  const [commentReminderTitle, setCommentReminderTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const todayReminders = useMemo(() => {
    return reminders.filter(r => r.reminder_date === today);
  }, [reminders, today]);

  const upcoming = todayReminders.filter(r => !r.is_done);
  const completed = todayReminders.filter(r => r.is_done);

  const handleAdd = async (data: ReminderFormData) => {
    return addReminder(data);
  };

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
      {/* Header */}
      <div className="pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Today</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setEditingReminder(null); setFormOpen(true); }}
          className="bg-accent hover:bg-accent-dim text-white rounded-full p-2.5 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2 mb-6">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
            Upcoming ({upcoming.length})
          </p>
          <AnimatePresence mode="popLayout">
            {upcoming.map(r => (
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
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
            Completed ({completed.length})
          </p>
          <AnimatePresence mode="popLayout">
            {completed.map(r => (
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
      )}

      {todayReminders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-text-muted text-sm">No reminders for today</p>
          <p className="text-text-muted/60 text-xs mt-1">Tap + to create one</p>
        </motion.div>
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
