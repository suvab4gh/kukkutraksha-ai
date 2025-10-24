import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Supabase Config Loading...');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase environment variables missing!');
  console.error('   Make sure backend/.env has SUPABASE_URL and SUPABASE_SERVICE_KEY');
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('✅ Supabase client created successfully');

export default supabase;
