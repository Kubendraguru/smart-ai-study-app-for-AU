import { supabase } from './supabase';

export async function updateStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  const today = new Date().toISOString().split('T')[0];

  if (error || !data) {
    // First login ever
    await supabase.from('streaks').insert({ user_id: userId, streak_count: 1, last_login_date: today });
    return 1;
  }

  if (data.last_login_date === today) {
    return data.streak_count;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newStreak = data.last_login_date === yesterdayStr ? data.streak_count + 1 : 1;

  await supabase
    .from('streaks')
    .update({ streak_count: newStreak, last_login_date: today, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  return newStreak;
}

export async function getStreak(userId: string): Promise<number> {
  const { data } = await supabase.from('streaks').select('streak_count').eq('user_id', userId).single();
  return data?.streak_count || 0;
}
