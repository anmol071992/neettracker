import { supabase } from './supabase';
import { uploadImage } from './storage';
import type { Mistake } from '../types';

export async function getMistakes(subjectId: string, chapterId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('mistakes')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject_id', subjectId)
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, mistakes: data };
  } catch (error) {
    console.error('Error fetching mistakes:', error);
    return { success: false, error };
  }
}

export async function addMistake(
  subjectId: string,
  chapterId: string,
  content: string,
  priority: 'low' | 'medium' | 'high',
  solution: string | null = null,
  mistakeImage?: File,
  solutionImage?: File
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Upload images if provided
    const [mistakeImageUrl, solutionImageUrl] = await Promise.all([
      mistakeImage ? uploadImage(mistakeImage, 'mistakes') : null,
      solutionImage ? uploadImage(solutionImage, 'solutions') : null
    ]);

    const { data, error } = await supabase
      .from('mistakes')
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        chapter_id: chapterId,
        content,
        priority,
        solution,
        image_url: mistakeImageUrl,
        solution_image_url: solutionImageUrl
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, mistake: data };
  } catch (error) {
    console.error('Error adding mistake:', error);
    return { success: false, error };
  }
}

export async function updateMistake(
  mistakeId: string,
  updates: Partial<Mistake>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('mistakes')
      .update(updates)
      .eq('id', mistakeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, mistake: data };
  } catch (error) {
    console.error('Error updating mistake:', error);
    return { success: false, error };
  }
}

export async function deleteMistake(mistakeId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get mistake data first to delete associated images
    const { data: mistake, error: fetchError } = await supabase
      .from('mistakes')
      .select('image_url, solution_image_url')
      .eq('id', mistakeId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    // Delete associated images
    if (mistake.image_url) await deleteImage(mistake.image_url);
    if (mistake.solution_image_url) await deleteImage(mistake.solution_image_url);

    // Delete the mistake record
    const { error: deleteError } = await supabase
      .from('mistakes')
      .delete()
      .eq('id', mistakeId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
    return { success: true };
  } catch (error) {
    console.error('Error deleting mistake:', error);
    return { success: false, error };
  }
}

// Subscribe to real-time updates
export function subscribeMistakes(callback: (mistake: Mistake) => void) {
  return supabase
    .channel('mistakes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mistakes'
      },
      (payload) => {
        callback(payload.new as Mistake);
      }
    )
    .subscribe();
}