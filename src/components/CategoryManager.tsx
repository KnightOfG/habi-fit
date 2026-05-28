import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Trash2, Check } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

const COLORS = ['#4a9eff', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#fb923c', '#22d3ee'];

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addCategory(name.trim(), color);
    setName('');
    setColor(COLORS[0]);
    setAdding(false);
  };

  const handleUpdate = async (id: string) => {
    if (!name.trim()) return;
    await updateCategory(id, name.trim(), color);
    setEditing(null);
    setName('');
    setColor(COLORS[0]);
  };

  const startEdit = (id: string, n: string, c: string) => {
    setEditing(id);
    setName(n);
    setColor(c);
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setDeleting(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-text-primary">Categories</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null); setName(''); setColor(COLORS[0]); }}
          className="flex items-center gap-1.5 text-accent text-sm hover:text-accent-dim transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {(adding || editing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-2 border border-border rounded-xl p-4 space-y-3">
              <input
                type="text"
                placeholder="Category name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-surface-3 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-all"
                autoFocus
              />
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editing ? handleUpdate(editing) : handleAdd()}
                  disabled={!name.trim()}
                  className="flex-1 bg-accent hover:bg-accent-dim text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {editing ? 'Update' : 'Add Category'}
                </button>
                <button
                  onClick={() => { setAdding(false); setEditing(null); }}
                  className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map(cat => (
          <motion.div
            key={cat.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl p-3"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="flex-1 text-sm text-text-primary truncate">{cat.name}</span>

            <button
              onClick={() => startEdit(cat.id, cat.name, cat.color)}
              className="p-1.5 text-text-muted hover:text-text-secondary transition-colors"
            >
              <Pencil size={14} />
            </button>

            {deleting === cat.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 text-error hover:bg-error-dim rounded-lg transition-colors"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setDeleting(null)}
                  className="p-1.5 text-text-muted hover:text-text-secondary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleting(cat.id)}
                className="p-1.5 text-text-muted hover:text-error transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </motion.div>
        ))}

        {categories.length === 0 && !adding && (
          <p className="text-center text-text-muted text-sm py-8">
            No categories yet. Add one to organize your reminders.
          </p>
        )}
      </div>
    </div>
  );
}
