import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useReminders } from '../hooks/useReminders';
import Calendar from '../components/Calendar';
import ReminderCard from '../components/ReminderCard';
import ReminderFormModal from '../components/ReminderFormModal';
import CommentModal from '../components/CommentModal';
import type { Reminder, ReminderFormData } from '../types';

export default function CalendarPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleDone } = useReminders();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentReminderId, setCommentReminderId] = useState<string | null>(null);
  const [commentReminderTitle, setCommentReminderTitle] = useState('');

  const reminderDates = useMemo(() => [...new Set(reminders.map(r => r.reminder_date))], [reminders]);

  const dateReminders = useMemo(() => {
    return reminders.filter(r => r.reminder_date === selectedDate);
  }, [reminders, selectedDate]);

  const pending = dateReminders.filter(r => !r.is_done);
  const done = dateReminders.filter(r => r.is_done);

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

  const displayDate = format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy');

  return (
    <div className="px-4 pb-24">
      <div className="pt-6 pb-4">
        <h1 className="text-xl font-semibold text-text-primary">Calendar</h1>
      </div>

      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        reminderDates={reminderDates}
      />

      {/* Selected date reminders */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-text-secondary">{displayDate}</p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setEditingReminder(null); setFormOpen(true); }}
            className="bg-accent hover:bg-accent-dim text-white rounded-full p-2 transition-colors"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {pending.length > 0 && (
          <div className="space-y-2 mb-4">
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
            </AnimatePresence>
          </div>
        )}

        {done.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
              Done ({done.length})
            </p>
            <AnimatePresence mode="popLayout">
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
        )}

        {dateReminders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <p className="text-text-muted text-sm">No reminders on this date</p>
          </motion.div>
        )}
      </div>

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
