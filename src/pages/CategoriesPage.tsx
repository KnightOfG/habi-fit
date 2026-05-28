import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import { useCategories } from '../hooks/useCategories';
import CategoryManager from '../components/CategoryManager';
import ReminderCard from '../components/ReminderCard';
import ReminderFormModal from '../components/ReminderFormModal';
import CommentModal from '../components/CommentModal';
import type { Reminder, ReminderFormData } from '../types';

export default function CategoriesPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleDone } = useReminders();
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentReminderId, setCommentReminderId] = useState<string | null>(null);
  const [commentReminderTitle, setCommentReminderTitle] = useState('');

  const categoryReminders = useMemo(() => {
    if (!selectedCategory) return [];
    return reminders.filter(r => r.category_id === selectedCategory);
  }, [reminders, selectedCategory]);

  const selectedCat = categories.find(c => c.id === selectedCategory);

  const pending = categoryReminders.filter(r => !r.is_done);
  const done = categoryReminders.filter(r => r.is_done);

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

  // Show category detail view
  if (selectedCategory && selectedCat) {
    return (
      <div className="px-4 pb-24">
        <div className="pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCat.color }} />
            <h1 className="text-xl font-semibold text-text-primary">{selectedCat.name}</h1>
          </div>
          <div className="flex-1" />
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
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
              Pending ({pending.length})
            </p>
            <AnimatePresence mode="popLayout">
              {pending.map(r => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onToggleDone={toggleDone}
                  onEdit={rem => { setEditingReminder(rem); setFormOpen(true); }}
                  onDelete={deleteReminder}
                  onAddComment={handleComment}
                  showDate
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
                  showDate
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {categoryReminders.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <p className="text-text-muted text-sm">No reminders in this category</p>
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

  // Show category list + manager
  return (
    <div className="px-4 pb-24">
      <div className="pt-6 pb-4">
        <h1 className="text-xl font-semibold text-text-primary">Categories</h1>
      </div>

      <CategoryManager />

      {/* Category quick links */}
      {categories.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
            Browse by category
          </p>
          {categories.map(cat => {
            const count = reminders.filter(r => r.category_id === cat.id).length;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
                className="w-full flex items-center gap-3 bg-surface-2 border border-border rounded-xl p-3 hover:bg-surface-3 transition-colors text-left"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-sm text-text-primary">{cat.name}</span>
                <span className="text-xs text-text-muted">{count}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      <ReminderFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingReminder(null); }}
        onSubmit={editingReminder ? handleEdit : handleAdd}
        initial={editingReminder}
      />
    </div>
  );
}
