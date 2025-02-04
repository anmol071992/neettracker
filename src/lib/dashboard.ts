import { supabase } from './supabase';
import { getCurrentUser } from './auth';

// Types
interface DashboardSettings {
  theme: 'light' | 'dark' | 'system';
  layout: any[];
  preferences: Record<string, any>;
}

interface Widget {
  id: string;
  widget_type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  settings: Record<string, any>;
  is_enabled: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// Dashboard Settings
export async function getDashboardSettings() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { success: true, settings: data };
  } catch (error) {
    console.error('Error fetching dashboard settings:', error);
    return { success: false, error };
  }
}

export async function updateDashboardSettings(settings: Partial<DashboardSettings>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, settings: data };
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    return { success: false, error };
  }
}

// Widgets
export async function getWidgets() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, widgets: data };
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return { success: false, error };
  }
}

export async function saveWidget(widget: Partial<Widget>) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .upsert({
        user_id: user.id,
        ...widget,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, widget: data };
  } catch (error) {
    console.error('Error saving widget:', error);
    return { success: false, error };
  }
}

export async function deleteWidget(widgetId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', widgetId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting widget:', error);
    return { success: false, error };
  }
}

// Notifications
export async function getNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, notifications: data };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('dashboard_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

// Activity Logging
export async function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, any> = {}
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('dashboard_activity_log')
      .insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id,
        metadata
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false, error };
  }
}

// Real-time Subscriptions
export function subscribeToNotifications(callback: (notification: Notification) => void) {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dashboard_notifications'
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();
}

export function subscribeToWidgetUpdates(callback: (widget: Widget) => void) {
  return supabase
    .channel('widgets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dashboard_widgets'
      },
      (payload) => {
        callback(payload.new as Widget);
      }
    )
    .subscribe();
}