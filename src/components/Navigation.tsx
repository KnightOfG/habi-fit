import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, List, Tag, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/', icon: Clock, label: 'Today' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/all', icon: List, label: 'All' },
];

export default function Navigation() {
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-1/95 backdrop-blur-sm border-t border-border z-50 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="relative">
            {({ isActive }) => (
              <motion.div
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
                }`}
                whileTap={{ scale: 0.92 }}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
        <button
          onClick={signOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-text-muted hover:text-error transition-colors"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </div>
    </nav>
  );
}
