import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let url = '';
let key = '';

envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (t.startsWith('VITE_SUPABASE_URL=')) url = t.substring(18).replace(/["']/g, '');
  if (t.startsWith('VITE_SUPABASE_ANON_KEY=')) key = t.substring(23).replace(/["']/g, '');
});

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.log("ERROR fetching all rows:", error.message);
  } else {
    console.log("SUCCESS. Rows count:", data.length);
    console.log("Data:", data);
  }
}

check();
