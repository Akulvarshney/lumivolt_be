import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL.replace('.storage.supabase.co/storage/v1/s3', '.supabase.co');
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'uploads';

console.log('Testing connection with:');
console.log('URL:', supabaseUrl);
console.log('Bucket:', supabaseBucket);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Connection failed:', error.message);
    } else {
      console.log('Connection successful! Buckets:', data.map(b => b.name));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testConnection();
