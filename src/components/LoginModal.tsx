import React, { useState } from 'react';
import { X, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { signIn, signUp, signInWithGoogle, signInWithKakao } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nickname: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          nickname: formData.nickname
        });
        if (error) throw error;
        alert('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setError(null);
    setSocialLoading(provider);
    
    try {
      const { error } = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithKakao();
      
      if (error) throw error;
      // OAuth 리다이렉트가 발생하므로 여기서 onClose를 호출하지 않음
    } catch (err: any) {
      setError(err.message || `${provider === 'google' ? '구글' : '카카오'} 로그인 중 오류가 발생했습니다.`);
      setSocialLoading(null);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const KakaoIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#FEE500" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L7.5 21l.455-2.947C4.869 16.4 1.5 14.114 1.5 11.185 1.5 6.664 6.201 3 12 3z"/>
      <path fill="#000" d="M11.1 9.6c0-.3.3-.6.6-.6s.6.3.6.6v1.8h1.8c.3 0 .6.3.6.6s-.3.6-.6.6h-1.8v1.8c0 .3-.3.6-.6.6s-.6-.3-.6-.6v-1.8H9.3c-.3 0-.6-.3-.6-.6s.3-.6.6-.6h1.8V9.6z"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${
            isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {isSignUp ? '회원가입' : '로그인'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading === 'google'}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border font-medium transition-colors ${
              isDarkMode
                ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
            } ${socialLoading === 'google' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {socialLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>구글로 로그인</span>
          </button>

          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={socialLoading === 'kakao'}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              socialLoading === 'kakao' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: '#FEE500', color: '#000' }}
          >
            {socialLoading === 'kakao' ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <KakaoIcon />
            )}
            <span>카카오로 로그인</span>
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative mb-6">
          <div className={`absolute inset-0 flex items-center ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <div className={`w-full border-t ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${
              isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
            }`}>
              또는
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  이름
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="실명을 입력하세요"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  닉네임
                </label>
                <div className="relative">
                  <UserPlus className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="닉네임을 입력하세요"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              이메일
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              비밀번호
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="비밀번호를 입력하세요"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <LogIn className="w-5 h-5" />
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className={`text-sm ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 