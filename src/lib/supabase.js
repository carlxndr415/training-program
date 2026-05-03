import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://swhfmccaqhjagosjquxq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lZxuaMvHUa_Xi-xqq9zJXQ_RjhhLEm9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
