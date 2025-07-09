import { createClient } from '@supabase/supabase-js'
const supabaseUrl = "https://apzkngbuzaofjddkqcbo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwemtuZ2J1emFvZmpkZGtxY2JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA0NTI4NSwiZXhwIjoyMDY3NjIxMjg1fQ.A-SX6fiJgBxIkG5DDbCroAoMenIlhfTTX3OhaLzA3Ls";

console.log('supabaseUrl:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('supabaseKey:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);



export const supabase = createClient(supabaseUrl,supabaseAnonKey)