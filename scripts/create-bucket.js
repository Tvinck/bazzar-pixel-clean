import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY
);

async function run() {
  const { data, error } = await supabase.storage.createBucket('assets', { public: true });
  if (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('Bucket already exists');
    } else {
      console.error(error);
    }
  } else {
    console.log('Bucket created successfully', data);
  }
}
run();
