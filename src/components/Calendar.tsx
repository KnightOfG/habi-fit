import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday
} from 'date-fns';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  reminderDates: string[];
}

export default function Calendar({ selectedDate, onSelectDate, reminderDates }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selected = new Date(selectedDate + 'T00:00:00');

  const dateSet = useMemo(() => new Set(reminderDates), [reminderDates]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const result: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-surface-2 border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-medium text-text-primary">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] text-text-muted font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasReminder = dateSet.has(dateStr);
          const inMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selected);
          const today = isToday(day);

          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate(dateStr)}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-xs transition-colors ${
                !inMonth ? 'text-text-muted/30' :
                isSelected ? 'bg-accent text-white font-semibold' :
                today ? 'bg-surface-3 text-accent font-medium' :
                'text-text-secondary hover:bg-surface-3'
              }`}
            >
              {format(day, 'd')}
              {hasReminder && inMonth && (
                <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                  isSelected ? 'bg-white' : 'bg-accent'
                }`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
