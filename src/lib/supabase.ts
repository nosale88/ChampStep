import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmoalrtninbbgzqhfufe.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2FscnRuaW5iYmd6cWhmdWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjM2NjAsImV4cCI6MjA2NzA5OTY2MH0.E6gj0plKMKWK3skBvBycKZsuanK2c0z5UcvZ1c9SfLA'

// 환경 변수 로딩 상태 디버깅
console.log('🔧 Environment variables check:', {
  hasViteSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasViteSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  supabaseUrl: supabaseUrl.substring(0, 30) + '...',
  keyLength: supabaseAnonKey.length,
  environment: import.meta.env.MODE || 'unknown'
})

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));
    }
  }
})

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('dancers')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
}; 