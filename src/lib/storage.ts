import { supabase } from './supabase';

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('mistake_images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('mistake_images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const path = url.split('/').pop();
    if (!path) return false;

    const { error } = await supabase.storage
      .from('mistake_images')
      .remove([`${user.id}/${path}`]);

    return !error;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}