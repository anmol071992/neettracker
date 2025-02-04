import { StudyTask } from '../types';

const STORAGE_KEY = 'study_planner';

interface StudySettings {
  startDate: string;
  endDate: string;
  dailyHours: number;
}

// Load data from localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

// Save data to localStorage
function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Get study settings
export function getStudySettings(): StudySettings {
  return loadFromStorage<StudySettings>(`${STORAGE_KEY}_settings`, {
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2025-05-04',
    dailyHours: 6
  });
}

// Save study settings
export function saveStudySettings(settings: StudySettings) {
  try {
    saveToStorage(`${STORAGE_KEY}_settings`, settings);
    return { success: true };
  } catch (error) {
    console.error('Error saving study settings:', error);
    return { success: false, error };
  }
}

// Get study tasks
export function getStudyTasks(): StudyTask[] {
  return loadFromStorage<StudyTask[]>(`${STORAGE_KEY}_tasks`, []);
}

// Add study task
export function addStudyTask(task: Omit<StudyTask, 'id'>): { success: boolean; error?: string } {
  try {
    const tasks = getStudyTasks();
    const newTask: StudyTask = {
      ...task,
      id: crypto.randomUUID()
    };
    
    tasks.push(newTask);
    saveToStorage(`${STORAGE_KEY}_tasks`, tasks);
    return { success: true };
  } catch (error) {
    console.error('Error adding study task:', error);
    return { success: false, error: 'Failed to add task' };
  }
}

// Update task status
export function updateTaskStatus(taskId: string, isCompleted: boolean): { success: boolean; error?: string } {
  try {
    const tasks = getStudyTasks();
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, isCompleted } : task
    );
    
    saveToStorage(`${STORAGE_KEY}_tasks`, updatedTasks);
    return { success: true };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

// Delete task
export function deleteTask(taskId: string): { success: boolean; error?: string } {
  try {
    const tasks = getStudyTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    saveToStorage(`${STORAGE_KEY}_tasks`, updatedTasks);
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}