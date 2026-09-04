import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ghdivumqppvvjwdtqids.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZGl2dW1xcHB2dmp3ZHRxaWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjI1MDcsImV4cCI6MjEwNDA5ODUwN30.ip9_wbt6c8D2DgvGrW3Nm6UQJKlleAgTTb1KXlHwnus';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
