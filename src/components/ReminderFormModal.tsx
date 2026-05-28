import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import type { ReminderFormData, Reminder } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ReminderFormData) => Promise<{ error: string | null }>;
  initial?: Reminder | null;
}

const emptyForm: ReminderFormData = {
  title: '',
  description: '',
  reminder_date: new Date().toISOString().split('T')[0],
  reminder_time: '09:00',
  category_id: null,
};

export default function ReminderFormModal({ open, onClose, onSubmit, initial }: Props) {
  const [form, setForm] = useState<ReminderFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { categories } = useCategories();

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        reminder_date: initial.reminder_date,
        reminder_time: initial.reminder_time,
        category_id: initial.category_id,
      });
    } else {
      setForm({
        ...emptyForm,
        reminder_date: new Date().toISOString().split('T')[0],
        reminder_time: new Date().toISOString().slice(11, 16),
      });
    }
    setError(null);
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await onSubmit(form);
    if (error) setError(error);
    else onClose();
    setSubmitting(false);
  };

  const inputClass = "w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-surface-1 rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {initial ? 'Edit Reminder' : 'New Reminder'}
              </h2>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Title</label>
                <input
                  type="text"
                  placeholder="What do you need to remember?"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Description</label>
                <textarea
                  placeholder="Add details..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={form.reminder_date}
                    onChange={e => setForm({ ...form, reminder_date: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block">Time</label>
                  <input
                    type="time"
                    value={form.reminder_time}
                    onChange={e => setForm({ ...form, reminder_time: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Category</label>
                <select
                  value={form.category_id ?? ''}
                  onChange={e => setForm({ ...form, category_id: e.target.value || null })}
                  className={inputClass}
                >
                  <option value="">No category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-error text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent hover:bg-accent-dim text-white rounded-lg py-3 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : initial ? 'Update' : 'Create Reminder'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
