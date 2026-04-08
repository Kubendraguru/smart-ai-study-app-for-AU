import { supabase } from './supabase';

export interface Reminder {
  id?: number;
  user_id: string;
  title: string;
  time?: string;
  type: 'study' | 'exam' | 'hydration' | 'assignment';
  completed: boolean;
  created_at?: string;
}

export async function fetchReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Reminder[];
}

export async function addReminder(reminder: Omit<Reminder, 'id' | 'created_at'>): Promise<Reminder> {
  const { data, error } = await supabase.from('reminders').insert(reminder).select().single();
  if (error) throw error;
  return data as Reminder;
}

export async function updateReminder(id: number, updates: Partial<Reminder>): Promise<void> {
  const { error } = await supabase.from('reminders').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteReminder(id: number): Promise<void> {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw error;
}
