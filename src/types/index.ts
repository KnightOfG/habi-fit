export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  category_id: string | null;
  user_id: string;
  is_done: boolean;
  notified_10min: boolean;
  notified_5min: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  reminder_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ReminderFormData {
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  category_id: string | null;
}
