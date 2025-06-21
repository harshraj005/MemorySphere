import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ✅ Load environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Optional: log env values for debugging
console.log('🟡 Supabase URL:', supabaseUrl);
console.log('🟡 Supabase Anon Key:', supabaseAnonKey ? '✔️ Loaded' : '❌ Missing');

// Define Supabase client
let supabase: SupabaseClient | undefined;

if (supabaseUrl && supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    // Client-side (Expo/React Native)
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } else {
    // Server-side or SSR (e.g., in Next.js or Web)
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} else {
  console.error('❌ Supabase environment variables are missing.');
}

// ✅ Export getSupabase function for safe access
export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error('❌ Supabase client is undefined. Check environment variables.');
  }
  return supabase;
};

//
// -----------------------------
// ✅ Database Type Definitions
// -----------------------------
//

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  created_at: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  theme_preference: 'light' | 'dark' | 'system';
}

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  person?: string;
  location?: string;
  date_mentioned?: string;
  emotion?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id?: string;
  status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'past_due';
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
