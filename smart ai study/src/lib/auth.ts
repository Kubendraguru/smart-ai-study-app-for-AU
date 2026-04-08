import { supabase } from './supabase';

export interface StudentProfile {
  id?: number;
  auth_id: string;
  name: string;
  email: string;
  department: string;
  department_code: string;
  roll_no: string;
  year: number;
  semester: number;
  role: 'student';
}

export interface TeacherProfile {
  id?: number;
  auth_id?: string;
  name: string;
  email: string;
  subject?: string;
  role: 'teacher';
}

/** Sign up a new user */
export async function signUp(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Signup failed: no user returned');

  // DO NOT insert into the database during signup
  return authData;
}

/** Save or update the student profile */
export async function saveProfile(name: string, extraData?: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not logged in');

  const uid = user.id;
  if (!uid) throw new Error('UID is null');

  // Check if student already exists using auth_id
  const { data: existingUser, error: fetchError } = await supabase
    .from('students')
    .select('auth_id')
    .eq('auth_id', uid)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError; // Ignore row not found error (PGRST116)
  }

  if (!existingUser) {
    // If not exists -> insert new row
    const { error: insertError } = await supabase.from('students').insert({
      auth_id: uid,
      name,
      role: 'student',
      department: extraData?.department || 'N/A',
      department_code: extraData?.department_code || 'N/A',
      roll_no: extraData?.roll_no || 'N/A',
      year: extraData?.year || 1,
      semester: extraData?.semester || 1,
    });

    if (insertError) throw insertError;
  } else {
    throw new Error('Profile already exists. Duplicate entry not allowed for insertions.');
  }

  return uid;
}

/** Sign in existing user and fetch their profile */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get current session */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Fetch the profile for the current logged-in user */
export async function getCurrentProfile(): Promise<(StudentProfile | TeacherProfile) | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error || !data) return null;

  if (data.role === 'teacher') {
    return {
      auth_id: data.auth_id,
      name: data.name,
      email: data.email,
      role: 'teacher',
    } as TeacherProfile;
  }

  return {
    id: data.id,
    auth_id: data.auth_id,
    name: data.name,
    email: data.email,
    department: data.department,
    department_code: data.department_code,
    roll_no: data.roll_no,
    year: data.year,
    semester: data.semester,
    role: 'student',
  } as StudentProfile;
}
