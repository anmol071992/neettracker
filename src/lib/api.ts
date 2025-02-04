import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { TestScore, Subject, Chapter } from '../types';

// Progress Management
export async function updateChapterProgress(
  subjectId: string,
  chapterId: string,
  field: keyof Chapter,
  value: boolean | number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Map frontend field names to database column names
    const columnMapping = {
      isNCERTRead: 'is_ncert_read',
      isVideoWatched: 'is_video_watched',
      isPracticeDone: 'is_practice_done',
      revisionCount: 'revision_count'
    };

    const dbField = columnMapping[field as keyof typeof columnMapping];
    if (!dbField) throw new Error('Invalid field name');

    const { data, error } = await supabase
      .from('chapter_progress')
      .upsert({
        user_id: user.id,
        subject_id: subjectId,
        chapter_id: chapterId,
        [dbField]: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,subject_id,chapter_id'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating chapter progress:', error);
    return { success: false, error };
  }
}

export async function getChapterProgress() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chapter_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching chapter progress:', error);
    return { success: false, error, data: [] };
  }
}

// Test Score Management
export async function addTestScore(data: Omit<TestScoreFormData, 'id'>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('test_scores')
      .insert({
        user_id: user.id,
        type: data.type,
        scores: data.scores,
        remarks: data.remarks,
        date: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error adding test score:', error);
    return { success: false, error };
  }
}

export async function getTestScores() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('test_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return { success: true, scores: data || [] };
  } catch (error) {
    console.error('Error fetching test scores:', error);
    return { success: false, error, scores: [] };
  }
}

// Real-time Subscriptions
export async function subscribeToProgress(callback: (payload: any) => void) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { unsubscribe: () => {} };

    return supabase
      .channel('chapter_progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapter_progress',
          filter: `user_id=eq.${user.id}`
        },
        callback
      )
      .subscribe();
  } catch (error) {
    console.error('Error setting up progress subscription:', error);
    return { unsubscribe: () => {} };
  }
}

export async function subscribeToTestScores(callback: (payload: any) => void) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { unsubscribe: () => {} };

    return supabase
      .channel('test_scores')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_scores',
          filter: `user_id=eq.${user.id}`
        },
        callback
      )
      .subscribe();
  } catch (error) {
    console.error('Error setting up test scores subscription:', error);
    return { unsubscribe: () => {} };
  }
}