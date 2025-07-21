import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Dancer } from '../types';
import { getValidAvatarUrl } from '../utils/avatarUtils';
import { isAdmin, isAdminSync } from '../utils/adminUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  dancer: Dancer | null;
  loading: boolean;
  isAdmin: boolean;
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
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🚀 AuthContext initializing...');
    
    // 초기 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('📋 Initial session check:', session ? 'Found' : 'None');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 User found, fetching profile for:', session.user.id);
        
        // 초기 세션에서도 관리자 권한 확인
        if (session.user.email) {
          console.log('🔍 Initial admin check for:', session.user.email);
          const adminStatus = isAdminSync(session.user.email);
          console.log('🔍 Initial admin status:', adminStatus);
          setUserIsAdmin(adminStatus);
          
          // 비동기 더블체크
          try {
            const asyncAdminStatus = await isAdmin(session.user.email);
            console.log('🔍 Initial async admin status:', asyncAdminStatus);
            if (asyncAdminStatus !== adminStatus) {
              setUserIsAdmin(asyncAdminStatus);
            }
          } catch (error) {
            console.error('🔍 Error in initial async admin check:', error);
          }
        }
        
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
        
        // 1. 관리자 권한 즉시 확인 (댄서 프로필과 별도로)
        if (session.user.email) {
          console.log('🔍 Checking admin status immediately for:', session.user.email);
          const adminStatus = isAdminSync(session.user.email);
          console.log('🔍 Immediate admin status:', adminStatus);
          setUserIsAdmin(adminStatus);
          
          // 2. 비동기로 더블체크
          try {
            const asyncAdminStatus = await isAdmin(session.user.email);
            console.log('🔍 Async admin status:', asyncAdminStatus);
            if (asyncAdminStatus !== adminStatus) {
              console.log('🔍 Admin status updated after async check');
              setUserIsAdmin(asyncAdminStatus);
            }
          } catch (error) {
            console.error('🔍 Error in async admin check:', error);
          }
        }
        
        // 3. 댄서 프로필 로딩 (선택적)
        // 소셜 로그인 시 프로필이 없으면 생성
        if (event === 'SIGNED_IN' && session.user.app_metadata.provider !== 'email') {
          console.log('🔑 Social login detected, creating profile if needed');
          await createSocialProfile(session.user);
        }
        fetchDancerProfile(session.user.id);
      } else {
        console.log('🚪 User signed out, clearing dancer profile');
        setDancer(null);
        setUserIsAdmin(false);
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
        avatar: getValidAvatarUrl(avatarUrl, user.id)
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
      setLoading(true);
      
      // 타임아웃을 3초로 증가 (너무 짧으면 네트워크 지연 시 문제)
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
        if (error.code === 'PGRST116') {
          console.log('🔄 No profile found - will show onboarding');
        } else if (error.message === 'Profile fetch timeout') {
          console.log('⏰ Profile fetch timeout - will show onboarding');
        } else {
          console.log('🔄 Other error occurred - will show onboarding');
        }
        setDancer(null);
        setLoading(false);
        return;
      }
      
      if (data) {
        console.log('✅ Dancer profile loaded:', data.nickname);
        const dancerData = {
          id: data.id,
          nickname: data.nickname,
          name: data.name,
          crew: data.crew,
          genres: data.genres || [],
          sns: data.sns || '',
          totalPoints: data.total_points || 0,
          rank: data.rank || 999,
          avatar: getValidAvatarUrl(data.avatar, data.id),
          competitions: [],
          videos: [],
          email: data.email,
          phone: data.phone,
          birthDate: data.birth_date,
          bio: data.bio,
          isAdmin: data.is_admin || isAdminSync(data.email || '')
        };
        
        console.log('👤 User admin status:', {
          email: data.email,
          dbIsAdmin: data.is_admin,
          syncIsAdmin: isAdminSync(data.email || ''),
          finalIsAdmin: dancerData.isAdmin
        });
        
        // 즉시 동기적으로 관리자 권한 확인
        const userEmail = data.email || '';
        const syncAdminStatus = isAdminSync(userEmail);
        console.log('🔍 Immediate admin status check:', {
          email: data.email,
          userEmail,
          emailType: typeof userEmail,
          emailLength: userEmail.length,
          syncAdminStatus,
          dbIsAdmin: data.is_admin,
          finalAdmin: syncAdminStatus || data.is_admin
        });
        
        // 관리자 권한을 즉시 설정
        const finalAdminStatus = syncAdminStatus || data.is_admin || false;
        console.log('🔑 FINAL ADMIN STATUS SET:', {
          email: data.email,
          syncAdminStatus,
          dbIsAdmin: data.is_admin,
          finalAdminStatus,
          willSetUserIsAdmin: finalAdminStatus
        });
        setUserIsAdmin(finalAdminStatus);
        
        setDancer(dancerData);
        
        // 비동기 관리자 권한 확인 (더블 체크)
        if (data.email) {
          console.log('🔍 Double-checking admin status asynchronously for:', data.email);
          try {
            const adminStatus = await isAdmin(data.email);
            console.log('🔍 Async admin status result:', adminStatus);
            if (adminStatus !== syncAdminStatus) {
              console.log('🔍 Admin status mismatch, updating to async result');
              setUserIsAdmin(adminStatus);
            }
          } catch (error) {
            console.error('🔍 Error checking admin status asynchronously:', error);
            console.log('🔍 Keeping sync admin status:', syncAdminStatus);
          }
        }
      } else {
        console.log('🔄 No profile data - will show onboarding');
        setDancer(null);
        setUserIsAdmin(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching dancer profile:', error);
      console.log('🔄 Error occurred - will show onboarding');
      setDancer(null);
      setLoading(false);
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
        avatar: getValidAvatarUrl(null, userId)
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
          avatar: getValidAvatarUrl(null, userId),
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
          avatar: getValidAvatarUrl(null, authData.user.id)
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
      setUserIsAdmin(false);
      setLoading(false);
      
      // Supabase 로그아웃 실행
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
      }
      
      // 브라우저 캐시 정리 (새로고침 제거)
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.') || key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.') || key.startsWith('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      console.log('✅ Signed out successfully');
      
    } catch (error) {
      console.error('❌ Error signing out:', error);
      setUser(null);
      setSession(null);
      setDancer(null);
      setUserIsAdmin(false);
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Dancer>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // 기존 프로필이 있는지 확인
      const { data: existingProfile } = await supabase
        .from('dancers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        // 기존 프로필 업데이트
        const { error } = await supabase
          .from('dancers')
          .update({
            name: updates.name,
            nickname: updates.nickname,
            genres: updates.genres,
            sns: updates.sns,
            bio: updates.bio,
            phone: updates.phone,
            birth_date: updates.birthDate,
            crew: updates.crew,
            avatar: updates.avatar
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // 로컬 상태 업데이트
        setDancer(prev => prev ? { ...prev, ...updates } : null);
      } else {
        // 새 프로필 생성
        const { data, error } = await supabase
          .from('dancers')
          .insert({
            user_id: user.id,
            email: user.email,
            name: updates.name,
            nickname: updates.nickname,
            genres: updates.genres || [],
            sns: updates.sns || '',
            bio: updates.bio || '',
            phone: updates.phone || '',
            birth_date: updates.birthDate || '',
            crew: updates.crew || '',
            avatar: getValidAvatarUrl(updates.avatar, user.id),
            total_points: 0,
            rank: 999
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // 새로 생성된 프로필로 상태 업데이트
        setDancer({
          id: data.id,
          nickname: data.nickname,
          name: data.name,
          crew: data.crew,
          genres: data.genres || [],
          sns: data.sns || '',
          totalPoints: data.total_points || 0,
          rank: data.rank || 999,
          avatar: getValidAvatarUrl(data.avatar, data.id),
          competitions: [],
          videos: [],
          email: data.email,
          phone: data.phone,
          birthDate: data.birth_date,
          bio: data.bio
        });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 디버깅용 window 객체에 상태 확인 함수 추가
  React.useEffect(() => {
    (window as any).debugAuth = () => {
      console.log('🔍 DEBUG AUTH STATE:', {
        user: user?.email,
        userIsAdmin,
        dancer: dancer?.email,
        dancerIsAdmin: dancer?.isAdmin,
        loading
      });
    };
    
    (window as any).checkAdminStatus = (email?: string) => {
      const targetEmail = email || user?.email;
      if (targetEmail) {
        console.log('🔍 Checking admin status for:', targetEmail);
        const syncResult = isAdminSync(targetEmail);
        console.log('🔍 Sync admin result:', syncResult);
        isAdmin(targetEmail).then(asyncResult => {
          console.log('🔍 Async admin result:', asyncResult);
        });
      }
    };
  }, [user, userIsAdmin, dancer, loading]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      dancer,
      loading,
      isAdmin: userIsAdmin,
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