import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kiovptmeuwvazxlanqha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3ZwdG1ldXd2YXp4bGFucWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjY4MjcsImV4cCI6MjA4NzgwMjgyN30.immHLvKe-DT5BCZpTO8agSYa9aarWLCALjP2DJQRwQE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
