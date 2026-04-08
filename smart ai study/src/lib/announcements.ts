import { supabase } from './supabase';

export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
  posted_by?: string;
}

/** Fetch all announcements, newest first */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Announcement[];
}

/** Post a new announcement (teachers only) */
export async function postAnnouncement(payload: {
  title: string;
  description: string;
  category: string;
  posted_by?: string;
}): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Announcement;
}
