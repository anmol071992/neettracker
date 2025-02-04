export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone_number: string
          roll_number: string
          education_level: string
          study_hours_target: number
          learning_style: string
          created_at: string
          last_active: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number: string
          roll_number: string
          education_level: string
          study_hours_target: number
          learning_style: string
          created_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string
          roll_number?: string
          education_level?: string
          study_hours_target?: number
          learning_style?: string
          created_at?: string
          last_active?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          chapter_id: string
          start_time: string
          end_time: string | null
          duration: number | null
          focus_score: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          chapter_id: string
          start_time: string
          end_time?: string | null
          duration?: number | null
          focus_score?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          chapter_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          focus_score?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          chapter_id: string
          scheduled_date: string
          duration: number
          priority: 'high' | 'medium' | 'low'
          status: 'pending' | 'completed' | 'missed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          chapter_id: string
          scheduled_date: string
          duration: number
          priority: 'high' | 'medium' | 'low'
          status: 'pending' | 'completed' | 'missed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          chapter_id?: string
          scheduled_date?: string
          duration?: number
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'completed' | 'missed'
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          type: 'milestone' | 'streak' | 'performance'
          points: number
          unlocked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          type: 'milestone' | 'streak' | 'performance'
          points: number
          unlocked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          type?: 'milestone' | 'streak' | 'performance'
          points?: number
          unlocked_at?: string
          created_at?: string
        }
      }
      mistakes: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          chapter_id: string
          content: string
          priority: 'low' | 'medium' | 'high'
          solution: string | null
          created_at: string
          is_resolved: boolean
          revision_count: number
          last_revised: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          subject_id: string
          chapter_id: string
          content: string
          priority: 'low' | 'medium' | 'high'
          solution?: string | null
          created_at?: string
          is_resolved?: boolean
          revision_count?: number
          last_revised?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          chapter_id?: string
          content?: string
          priority?: 'low' | 'medium' | 'high'
          solution?: string | null
          created_at?: string
          is_resolved?: boolean
          revision_count?: number
          last_revised?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}