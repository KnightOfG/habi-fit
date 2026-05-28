import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useComments } from '../hooks/useComments';

interface Props {
  open: boolean;
  onClose: () => void;
  reminderId: string | null;
  reminderTitle: string;
}

export default function CommentModal({ open, onClose, reminderId, reminderTitle }: Props) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { comments, loading, fetchComments, addComment } = useComments(reminderId);

  useEffect(() => {
    if (open && reminderId) fetchComments();
  }, [open, reminderId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    await addComment(content.trim());
    setContent('');
    setSubmitting(false);
  };

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
            className="w-full max-w-lg bg-surface-1 rounded-t-2xl sm:rounded-2xl p-6 max-h-[70vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Comments</h2>
                <p className="text-xs text-text-muted truncate max-w-[280px]">{reminderTitle}</p>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
              {loading ? (
                <p className="text-xs text-text-muted text-center py-4">Loading...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No comments yet</p>
              ) : (
                comments.map(c => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface-2 border border-border rounded-lg p-3"
                  >
                    <p className="text-sm text-text-primary">{c.content}</p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="bg-accent hover:bg-accent-dim text-white rounded-lg px-3 py-2.5 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
