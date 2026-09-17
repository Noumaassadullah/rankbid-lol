import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxjcamscavnagixlwyfp.supabase.co';
const supabaseServiceKey = 'sb_secret_LoiSawnxQerv1oJvL6VovA_3gqMW_cm';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkStats() {
  try {
    const { count, error } = await supabase
      .from('visitor_sessions')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`Records in visitor_sessions table: ${count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStats();
