import { createClient } from '@supabase/supabase-js';

const url = 'https://example.supabase.co';
const anonKey = 'public-anon-placeholder';

export const supabase = createClient(url, anonKey);
export const jobsQuery = supabase.from('agent_jobs').select('*');
