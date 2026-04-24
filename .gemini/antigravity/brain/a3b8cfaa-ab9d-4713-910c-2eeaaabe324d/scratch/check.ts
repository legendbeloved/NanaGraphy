import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let url = '';
let key = '';

envContent.split('\n').forEach(line => {
  if (line.trim().startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.trim().startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('site_settings').select('social_links').eq('id', 1).single();
  if (error) {
    console.log("ERROR fetching social_links:", error.message);
  } else {
    console.log("SUCCESS. Data:", data);
  }
}

check();
