import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Dancer } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  dancer: Dancer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: { name: string; nickname: string }) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithKakao: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Dancer>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dancer, setDancer] = useState<Dancer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthContext initializing...');
    
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session check:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 User found, fetching profile for:', session.user.id);
        fetchDancerProfile(session.user.id);
      } else {
        console.log('❌ No user session, setting loading to false');
        setLoading(false); // 세션이 없으면 로딩 완료
      }
    }).catch(error => {
      console.error('❌ Error getting initial session:', error);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? 'with session' : 'without session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 User authenticated, fetching profile for:', session.user.id);
        // 소셜 로그인 시 프로필이 없으면 생성
        if (event === 'SIGNED_IN' && session.user.app_metadata.provider !== 'email') {
          console.log('🔑 Social login detected, creating profile if needed');
          await createSocialProfile(session.user);
        }
        fetchDancerProfile(session.user.id);
      } else {
        console.log('🚪 User signed out, clearing dancer profile');
        setDancer(null);
        setLoading(false); // 로그아웃 시 로딩 완료
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createSocialProfile = async (user: User) => {
    try {
      // 이미 프로필이 있는지 확인
      const { data: existingProfile } = await supabase
        .from('dancers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) return;

      // 소셜 로그인 사용자 정보에서 이름 추출
      const fullName = user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0] || 'Unknown';
      const nickname = user.user_metadata.preferred_username || user.user_metadata.nickname || fullName;
      const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;

      // 댄서 프로필 생성
      const { error } = await supabase.from('dancers').insert({
        user_id: user.id,
        email: user.email,
        name: fullName,
        nickname: nickname,
        genres: [],
        total_points: 0,
        rank: 999,
        avatar: avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`
      });

      if (error) {
        console.error('Error creating social profile:', error);
      }
    } catch (error) {
      console.error('Error in createSocialProfile:', error);
    }
  };

  const fetchDancerProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching dancer profile for user:', userId);
      setLoading(true); // 프로필 로딩 시작
      
      // 3초 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });
      
      const fetchPromise = supabase
        .from('dancers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error fetching dancer profile:', error);
        // 프로필이 없을 경우 기본 프로필 생성
        if (error.code === 'PGRST116') {
          console.log('🔄 Creating default profile for user');
          await createDefaultProfile(userId);
        } else if (error.message === 'Profile fetch timeout') {
          console.log('⏰ Profile fetch timeout - creating default profile');
          await createDefaultProfile(userId);
        }
        setLoading(false); // 에러 시에도 로딩 완료
        return;
      }
      
      if (data) {
        console.log('✅ Dancer profile loaded:', data.nickname);
        setDancer({
          id: data.id,
          nickname: data.nickname,
          name: data.name,
          crew: data.crew,
          genres: data.genres || [],
          sns: data.sns || '',
          totalPoints: data.total_points || 0,
          rank: data.rank || 999,
          avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.id}`,
          competitions: [],
          videos: [],
          email: data.email,
          phone: data.phone,
          birthDate: data.birth_date,
          bio: data.bio
        });
      }
      
      setLoading(false); // 성공 시 로딩 완료
    } catch (error) {
      console.error('❌ Error fetching dancer profile:', error);
      // 타임아웃이나 기타 오류 시 기본 프로필 생성
      console.log('🔄 Creating default profile due to error');
      await createDefaultProfile(userId);
      setLoading(false); // 예외 발생 시에도 로딩 완료
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const { error } = await supabase.from('dancers').insert({
        user_id: userId,
        email: user.data.user.email,
        name: user.data.user.email?.split('@')[0] || 'User',
        nickname: user.data.user.email?.split('@')[0] || 'User',
        genres: [],
        total_points: 0,
        rank: 999,
        avatar: `https://i.pravatar.cc/150?u=${userId}`
      });

      if (error) {
        console.error('Error creating default profile:', error);
      } else {
        console.log('✅ Default profile created');
        // 재귀 호출을 피하기 위해 직접 프로필 데이터 설정
        setDancer({
          id: userId,
          nickname: user.data.user.email?.split('@')[0] || 'User',
          name: user.data.user.email?.split('@')[0] || 'User',
          crew: '',
          genres: [],
          sns: '',
          totalPoints: 0,
          rank: 999,
          avatar: `https://i.pravatar.cc/150?u=${userId}`,
          competitions: [],
          videos: [],
          email: user.data.user.email,
          phone: '',
          birthDate: '',
          bio: ''
        });
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; nickname: string }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      
      if (authError) throw authError;
      
      // 댄서 프로필 생성
      if (authData.user) {
        const { error: profileError } = await supabase.from('dancers').insert({
          user_id: authData.user.id,
          email: email,
          name: userData.name,
          nickname: userData.nickname,
          genres: [],
          total_points: 0,
          rank: 999,
          avatar: `https://i.pravatar.cc/150?u=${authData.user.id}`
        });
        
        if (profileError) throw profileError;
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    try {
      // 먼저 로컬 상태를 즉시 초기화
      setUser(null);
      setSession(null);
      setDancer(null);
      
      // Supabase 로그아웃 실행
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        // 에러가 있어도 로컬 상태는 이미 초기화됨
      }
      
      // 브라우저 캐시 강제 정리
      if (typeof window !== 'undefined') {
        // 로컬 스토리지에서 Supabase 관련 데이터 제거
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.') || key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // 세션 스토리지도 정리
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.') || key.startsWith('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      console.log('✅ Signed out successfully');
      
      // 페이지 새로고침으로 완전한 상태 초기화
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // 에러가 있어도 로컬 상태는 초기화하고 새로고침
      setUser(null);
      setSession(null);
      setDancer(null);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const updateProfile = async (updates: Partial<Dancer>) => {
    try {
      if (!user || !dancer) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('dancers')
        .update({
          name: updates.name,
          nickname: updates.nickname,
          genres: updates.genres,
          sns: updates.sns,
          bio: updates.bio,
          phone: updates.phone,
          birth_date: updates.birthDate
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // 로컬 상태 업데이트
      setDancer(prev => prev ? { ...prev, ...updates } : null);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      dancer,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithKakao,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 