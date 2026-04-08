import { supabase } from './supabase';

export interface GPARecord {
  id?: number;
  user_id: string;
  semester: number;
  gpa: number;
}

export async function fetchGpaRecords(userId: string): Promise<GPARecord[]> {
  const { data, error } = await supabase
    .from('gpa')
    .select('*')
    .eq('user_id', userId)
    .order('semester', { ascending: true });

  if (error) throw error;
  return (data || []) as GPARecord[];
}

export async function saveGpaRecord(record: Omit<GPARecord, 'id'>): Promise<GPARecord> {
  // Upsert based on user_id + semester
  const { data, error } = await supabase
    .from('gpa')
    .upsert(record, { onConflict: 'user_id,semester' })
    .select()
    .single();

  if (error) throw error;
  return data as GPARecord;
}

export async function deleteGpaRecord(id: number): Promise<void> {
  const { error } = await supabase.from('gpa').delete().eq('id', id);
  if (error) throw error;
}
