import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fn = isLogin ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) setError(error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Remind</h1>
          <p className="text-text-secondary text-sm mt-1">Track your daily reminders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-error text-xs"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-dim text-white rounded-lg py-3 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? '...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-text-muted text-xs mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-accent hover:text-accent-dim transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
