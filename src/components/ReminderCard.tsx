import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MoveVertical as MoreVertical, Pencil, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { Reminder } from '../types';

interface Props {
  reminder: Reminder;
  onToggleDone: (id: string, is_done: boolean) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  onAddComment: (reminderId: string) => void;
  showDate?: boolean;
}

export default function ReminderCard({ reminder, onToggleDone, onEdit, onDelete, onAddComment, showDate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryColor = reminder.category?.color ?? '#4a9eff';
  const timeStr = reminder.reminder_time.slice(0, 5);
  const dateStr = showDate
    ? new Date(reminder.reminder_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-surface-2 border border-border rounded-xl p-4 relative group"
    >
      <div className="flex items-start gap-3">
        {/* Done checkbox */}
        <button
          onClick={() => onToggleDone(reminder.id, !reminder.is_done)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            reminder.is_done
              ? 'bg-success border-success'
              : 'border-border-light hover:border-accent/50'
          }`}
        >
          {reminder.is_done && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-medium truncate transition-colors ${
              reminder.is_done ? 'text-text-muted line-through' : 'text-text-primary'
            }`}>
              {reminder.title}
            </h3>
            {reminder.category && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                style={{
                  backgroundColor: categoryColor + '20',
                  color: categoryColor,
                }}
              >
                {reminder.category.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {dateStr && <span className="text-xs text-text-muted">{dateStr}</span>}
            <span className="text-xs text-accent">{timeStr}</span>
          </div>

          {/* Expandable description */}
          <AnimatePresence>
            {expanded && reminder.description && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-text-secondary mt-2 overflow-hidden"
              >
                {reminder.description}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Comments indicator */}
          {reminder.comments && reminder.comments.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors"
              >
                <MessageSquare size={12} />
                <span className="text-[10px]">{reminder.comments.length} comment{reminder.comments.length > 1 ? 's' : ''}</span>
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <AnimatePresence>
                {expanded && reminder.comments.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 pl-3 border-l border-border text-xs text-text-secondary"
                  >
                    {c.content}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Menu */}
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded-lg hover:bg-surface-3"
          >
            <MoreVertical size={16} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 bg-surface-3 border border-border rounded-xl shadow-xl py-1.5 w-36 z-20"
              >
                <button
                  onClick={() => { onEdit(reminder); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-text-secondary hover:bg-surface-4 hover:text-text-primary transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => { onAddComment(reminder.id); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-text-secondary hover:bg-surface-4 hover:text-text-primary transition-colors"
                >
                  <MessageSquare size={13} /> Add Comment
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => { onDelete(reminder.id); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-error hover:bg-error-dim transition-colors"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expand trigger for description */}
      {reminder.description && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 ml-8 text-[10px] text-text-muted hover:text-text-secondary transition-colors"
        >
          Show more
        </button>
      )}
    </motion.div>
  );
}
