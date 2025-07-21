import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// 환경변수 체크를 더 안전하게
let supabaseUrl: string
let supabaseAnonKey: string

try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmoalrtninbbgzqhfufe.supabase.co'
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2FscnRuaW5iYmd6cWhmdWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjM2NjAsImV4cCI6MjA2NzA5OTY2MH0.E6gj0plKMKWK3skBvBycKZsuanK2c0z5UcvZ1c9SfLA'
} catch (error) {
  console.error('🚨 Error accessing environment variables:', error)
  supabaseUrl = 'https://zmoalrtninbbgzqhfufe.supabase.co'
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptb2FscnRuaW5iYmd6cWhmdWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjM2NjAsImV4cCI6MjA2NzA5OTY2MH0.E6gj0plKMKWK3skBvBycKZsuanK2c0z5UcvZ1c9SfLA'
}

// 환경 변수 로딩 상태 디버깅 (updated for anon key fix)
console.log('🔧 🚨 CRITICAL Environment variables check 🚨:', {
  hasViteSupabaseUrl: !!supabaseUrl,
  hasViteSupabaseKey: !!supabaseAnonKey,
  finalUrl: supabaseUrl,
  finalKey: supabaseAnonKey.substring(0, 50) + '...',
  finalKeyLength: supabaseAnonKey.length,
  environment: typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'unknown',
  isDev: typeof import.meta !== 'undefined' ? import.meta.env?.DEV : false,
  isProd: typeof import.meta !== 'undefined' ? import.meta.env?.PROD : false
})

// Supabase 클라이언트 생성을 안전하게
let supabase: ReturnType<typeof createClient<Database>>

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  console.log('✅ Supabase client created successfully');
} catch (error) {
  console.error('🚨 Error creating Supabase client:', error);
  // 기본 클라이언트 생성
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// 연결 테스트 실행 (export 후에)
setTimeout(() => {
  console.log('🔧 🚨 Starting delayed connection test...');
  testSupabaseConnection().then(result => {
    console.log('🔧 🚨 Connection test result:', result);
  }).catch(error => {
    console.error('🔧 🚨 Connection test failed:', error);
  });
}, 100);

// Supabase 연결 테스트 함수
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Supabase connection...');
    console.log('🔗 Using URL:', supabaseUrl);
    console.log('🔗 Key length:', supabaseAnonKey.length);
    console.log('🔗 Key type:', supabaseAnonKey.includes('anon') ? 'anon' : 'service_role');
    
    // 먼저 단순한 테이블 존재 확인
    const { data: tableData, error: tableError } = await supabase
      .from('dancers')
      .select('count', { count: 'exact', head: true });
    
    console.log('🔗 Table access test:', { data: tableData, error: tableError });
    
    // RLS 무시하고 데이터 확인 (anon key로는 안 될 수 있음)
    const { data: sampleData, error: sampleError } = await supabase
      .from('dancers')
      .select('id, nickname')
      .limit(1);
    
    console.log('🔗 Sample data test:', { data: sampleData, error: sampleError });
    
    if (tableError) {
      console.error('❌ Table access failed:', {
        error: tableError,
        code: tableError.code,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      });
      
      // RLS 정책 문제일 가능성 체크
      if (tableError.code === 'PGRST116' || tableError.message?.includes('policy')) {
        console.warn('⚠️ 이것은 RLS(Row Level Security) 정책 문제일 수 있습니다.');
        console.warn('⚠️ Supabase 대시보드에서 테이블의 RLS 설정을 확인해주세요.');
      }
      
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error string:', String(error));
    return false;
  }
}; 