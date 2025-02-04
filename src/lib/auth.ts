import { supabase } from './supabase';

export async function signUp(fullName: string, phoneNumber: string, password: string) {
  try {
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Check if phone number already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: false,
        error: 'This phone number is already registered'
      };
    }

    // Create auth user with phone number as email
    const email = `${cleanPhone}@neettracker.app`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone_number: cleanPhone,
          full_name: fullName
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        phone_number: cleanPhone,
        education_level: '',
        study_hours_target: 6,
        learning_style: '',
        preferences: {}
      });

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    };
  }
}

export async function signIn(phoneNumber: string, password: string) {
  try {
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const email = `${cleanPhone}@neettracker.app`;

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return {
        success: false,
        error: 'Invalid phone number or password',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Phone number not found. Please register first.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: 'Invalid credentials. Please try again.',
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) return null;

    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}