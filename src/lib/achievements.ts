import { supabase } from './supabase';

export const ACHIEVEMENTS = {
  FIRST_LOGIN: {
    title: 'First Steps',
    description: 'Started your NEET preparation journey',
    type: 'milestone' as const,
    points: 10,
  },
  STUDY_STREAK_3: {
    title: '3-Day Streak',
    description: 'Studied for 3 consecutive days',
    type: 'streak' as const,
    points: 30,
  },
  STUDY_STREAK_7: {
    title: 'Week Warrior',
    description: 'Maintained a 7-day study streak',
    type: 'streak' as const,
    points: 70,
  },
  CHAPTER_MASTERY: {
    title: 'Chapter Master',
    description: 'Completed all activities for a chapter',
    type: 'performance' as const,
    points: 50,
  },
  MISTAKE_RESOLVED: {
    title: 'Problem Solver',
    description: 'Resolved 5 mistakes through practice',
    type: 'performance' as const,
    points: 40,
  },
};

export async function unlockAchievement(userId: string, achievementKey: keyof typeof ACHIEVEMENTS) {
  const achievement = ACHIEVEMENTS[achievementKey];
  
  try {
    const { error } = await supabase.from('achievements').insert({
      user_id: userId,
      ...achievement,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return { success: false, error };
  }
}

export async function checkAndAwardAchievements(userId: string) {
  // Check study streak
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('start_time')
    .eq('user_id', userId)
    .order('start_time', { ascending: false });

  if (sessions) {
    const dates = new Set(sessions.map(s => 
      new Date(s.start_time).toISOString().split('T')[0]
    ));
    
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date(today);

    while (dates.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    if (streak >= 3) await unlockAchievement(userId, 'STUDY_STREAK_3');
    if (streak >= 7) await unlockAchievement(userId, 'STUDY_STREAK_7');
  }

  // Check resolved mistakes
  const { data: mistakes } = await supabase
    .from('mistakes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_resolved', true);

  if (mistakes && mistakes.length >= 5) {
    await unlockAchievement(userId, 'MISTAKE_RESOLVED');
  }
}