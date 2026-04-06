import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase Config Loading...');
console.log('  URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('  Service Role Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  const { createClient } = await import('@supabase/supabase-js');
  
  // Create Supabase client with service role key for backend operations
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  console.log('✅ Supabase client created successfully');
  console.log('📊 Database: PostgreSQL with TimescaleDB capabilities');
  console.log('🔐 Auth: Supabase Authentication enabled');
  console.log('⚡ Real-time: Subscriptions available');
} else {
  console.log('❌ Supabase not properly configured. Please check .env file.');
  throw new Error('Supabase configuration missing. Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

export { supabase };
export default supabase;
