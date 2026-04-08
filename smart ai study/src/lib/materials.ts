import { supabase } from './supabase';

export interface Material {
  id: number;
  title: string;
  subject: string;
  department: string;
  year: number;
  semester: number;
  type: 'pdf' | 'doc' | 'notes';
  file_url: string;
  file_size?: string;
  teacher_name: string;
  teacher_auth_id?: string;
  created_at: string;
}

export interface UploadMaterialPayload {
  title: string;
  subject: string;
  department: string;
  year: number;
  semester: number;
  type: 'pdf' | 'doc' | 'notes';
  teacher_name: string;
  teacher_auth_id: string;
  file: File;
  onProgress?: (progress: number) => void;
}

/** Fetch materials filtered by department + year (RLS handles security automatically) */
export async function fetchMaterials(filters?: {
  department?: string;
  year?: number;
  semester?: number;
  search?: string;
}): Promise<Material[]> {
  let query = supabase.from('materials').select('*').order('created_at', { ascending: false });

  if (filters?.department) query = query.eq('department', filters.department);
  if (filters?.year) query = query.eq('year', filters.year);
  if (filters?.semester) query = query.eq('semester', filters.semester);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Material[];
}

/** Upload a file to Supabase Storage and insert record in materials table */
export async function uploadMaterial(payload: UploadMaterialPayload): Promise<Material> {
  const fileExt = payload.file.name.split('.').pop();
  const fileName = `${payload.department}/${payload.year}/${Date.now()}_${payload.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('materials')
    .upload(fileName, payload.file, { upsert: false });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage.from('materials').getPublicUrl(uploadData.path);
  const publicUrl = urlData.publicUrl;

  // Insert metadata into DB
  const { data, error } = await supabase
    .from('materials')
    .insert({
      title: payload.title,
      subject: payload.subject,
      department: payload.department,
      year: payload.year,
      semester: payload.semester,
      type: payload.type,
      file_url: publicUrl,
      file_size: `${(payload.file.size / 1024 / 1024).toFixed(1)} MB`,
      teacher_name: payload.teacher_name,
      teacher_auth_id: payload.teacher_auth_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Material;
}

/** Delete a material (removes from DB + Storage) */
export async function deleteMaterial(materialId: number, fileUrl: string): Promise<void> {
  // Extract storage path from URL
  const urlParts = fileUrl.split('/materials/');
  if (urlParts.length > 1) {
    const storagePath = urlParts[1].split('?')[0];
    await supabase.storage.from('materials').remove([storagePath]);
  }

  const { error } = await supabase.from('materials').delete().eq('id', materialId);
  if (error) throw error;
}

/** Get download URL for a material */
export function getDownloadUrl(fileUrl: string): string {
  return fileUrl;
}

/** Fetch materials uploaded by this teacher */
export async function fetchTeacherMaterials(teacherAuthId: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('teacher_auth_id', teacherAuthId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Material[];
}
