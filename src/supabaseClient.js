import { createClient } from '@supabase/supabase-js';

// قراءة مفاتيح الربط من متغيرات البيئة في Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbabnusqiukeomzhflbu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_m9ULeQJH8XbLaZsBnbYXzQ_u3ZUmfHy';

// التحقق مما إذا كانت مفاتيح Supabase قد تم ضبطها بشكل صحيح
export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
  );
};

// إنشاء وتصدير عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
