import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nbabnusqiukeomzhflbu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_m9ULeQJH8XbLaZsBnbYXzQ_u3ZUmfHy';

// التحقق من صحة مفاتيح الاتصال وعدم كونها قيماً افتراضية تجريبية
export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

// إنشاء عميل Supabase إذا توفرت الإعدادات، أو كائن آمن بديل لتفادي تعطل التطبيق
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder-domain-for-offline-preview.supabase.co', 'placeholder-anon-key');

export default supabase;
