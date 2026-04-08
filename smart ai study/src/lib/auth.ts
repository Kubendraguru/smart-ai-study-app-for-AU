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

/** Sign up a new user and insert their profile into the correct table */
export async function signUp(
  email: string,
  password: string,
  role: 'student' | 'teacher',
  profileData: Omit<StudentProfile | TeacherProfile, 'auth_id' | 'email' | 'role'>
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Signup failed: no user returned');

  if (role === 'student') {
    const sp = profileData as Omit<StudentProfile, 'auth_id' | 'email' | 'role'>;
    const { error } = await supabase.from('students').insert({
      auth_id: authData.user.id,
      name: sp.name,
      email,
      department: sp.department,
      department_code: sp.department_code,
      roll_no: sp.roll_no,
      year: sp.year,
      semester: sp.semester,
      role: 'student',
    });
    if (error) throw error;
  } else {
    // Teachers: insert into lowercase teachers table with auth_id via students columns workaround
    // We store teacher in students table with role='teacher' for simplicity & auth_id linkage
    const tp = profileData as Omit<TeacherProfile, 'auth_id' | 'email' | 'role'>;
    const { error } = await supabase.from('students').insert({
      auth_id: authData.user.id,
      name: tp.name,
      email,
      department: 'Faculty',
      department_code: 'FAC',
      roll_no: '',
      year: 0,
      semester: 0,
      role: 'teacher',
    });
    if (error) throw error;
  }

  return authData;
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
  const session = await getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('auth_id', session.user.id)
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
