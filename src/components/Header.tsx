import React, { useState, useEffect, useRef } from 'react';
import { Crown, Menu, X, Moon, Sun, LogIn, LogOut, User, Home, Trophy, Calendar, Users, Shield, Bell, MessageCircle, Settings, ExternalLink, UserPlus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import ProfileEditModal from './ProfileEditModal';
import DancerRegistrationModal from './DancerRegistrationModal';

type View = 'home' | 'ranking' | 'competitions' | 'crews' | 'profile' | 'admin';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, dancer, signOut, isAdmin } = useAuth();
  
  // 관리자 권한 디버깅
  console.log('🔍 Header - Auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasDancer: !!dancer,
    dancerEmail: dancer?.email,
    isAdmin: isAdmin,
    dancerIsAdmin: dancer?.isAdmin,
    shouldShowAdminMenu: isAdmin && user
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // 임시 알림 및 댓글 데이터
  const notifications = [
    { id: '1', message: '새로운 대회가 등록되었습니다.', time: '5분 전', read: false },
    { id: '2', message: '프로필이 업데이트되었습니다.', time: '1시간 전', read: true },
  ];
  
  const myComments = [
    { id: '1', content: '정말 멋진 퍼포먼스였어요!', target: '김댄서', time: '10분 전' },
    { id: '2', content: '다음 대회도 화이팅!', target: '박크루', time: '30분 전' },
  ];
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  // 외부 클릭 감지를 위한 ref
  const notificationRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (commentRef.current && !commentRef.current.contains(event.target as Node)) {
        setShowComments(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 관리자 메뉴 표시 조건 강화
  const shouldShowAdminMenu = user && isAdmin;
  console.log('🔍 Admin menu visibility:', { user: !!user, isAdmin, shouldShowAdminMenu });

  const navItems = [
    { key: 'home', label: '홈', icon: Home },
    { key: 'ranking', label: '스텝', icon: Trophy },
    { key: 'competitions', label: '대회', icon: Calendar },
    { key: 'crews', label: '크루', icon: Users },
    ...(user ? [{ key: 'profile', label: '내 정보', icon: User }] : []),
    ...(shouldShowAdminMenu ? [{ key: 'admin', label: '관리자', icon: Shield }] : [])
  ];

  const handleNavClick = (view: View) => {
    onViewChange(view);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'} shadow-lg border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 좌측 영역 */}
            <div className="flex items-center space-x-4">
              {/* DanceCode 링크 */}
              <a 
                href="https://www.dancecode.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors hover:bg-opacity-80 ${
                  isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="DanceCode 바로가기"
              >
                <span className="text-sm font-medium">DanceCode</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              
              {/* 로고 */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 sm:p-2 rounded-xl">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                    ChampStep
                  </h1>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors hidden lg:block`}>
                    챔피언으로 가는 댄서들의 여정을 기록합니다.
                  </p>
                </div>
                <div className="sm:hidden">
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                    ChampStep
                  </h1>
                </div>
              </div>
            </div>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onViewChange(key as View)}
                  className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === key
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* 우측 버튼들 */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user ? (
                <>
                  {/* 알림 버튼 */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-2 rounded-lg transition-colors relative ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title="알림"
                    >
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>
                    
                    {/* 알림 드롭다운 */}
                    {showNotifications && (
                      <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <div className={`p-4 border-b ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>알림</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div key={notification.id} className={`p-3 border-b last:border-b-0 ${
                              isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                            } ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>{notification.message}</p>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 댓글 버튼 */}
                  <div className="relative" ref={commentRef}>
                    <button
                      onClick={() => setShowComments(!showComments)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title="내 댓글"
                    >
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    
                    {/* 댓글 드롭다운 */}
                    {showComments && (
                      <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <div className={`p-4 border-b ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>내가 작성한 댓글</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {myComments.map((comment) => (
                            <div key={comment.id} className={`p-3 border-b last:border-b-0 ${
                              isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                            }`}>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>"{comment.content}"</p>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>→ {comment.target} · {comment.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 프로필 메뉴 */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden transition-all hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      title={dancer?.nickname || user.email}
                    >
                      {dancer?.avatar || dancer?.profileImage ? (
                        <img
                          src={dancer.avatar || dancer.profileImage}
                          alt={dancer.nickname || 'Profile'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-white font-semibold text-sm sm:text-base ${
                        dancer?.avatar || dancer?.profileImage ? 'hidden' : ''
                      } bg-gradient-to-br from-blue-500 to-purple-600`}>
                        {(dancer?.nickname || user.email)?.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    
                    {/* 프로필 드롭다운 */}
                    {showProfileMenu && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <div className="py-2">
                          <button
                            onClick={() => {
                              onViewChange('profile');
                              setShowProfileMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <User className="h-4 w-4" />
                            <span>내 프로필</span>
                          </button>
                          {/* 댄서/크루 등록 */}
                          <button
                            onClick={() => {
                              setShowRegistrationModal(true);
                              setShowProfileMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <UserPlus className="h-4 w-4" />
                            <span>댄서/크루 등록</span>
                          </button>
                          {/* 프로필 편집 - 관리자만 가능 */}
                          {user && isAdmin && (
                            <button
                              onClick={() => {
                                setShowProfileEditModal(true);
                                setShowProfileMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              <Settings className="h-4 w-4" />
                              <span>프로필 편집</span>
                            </button>
                          )}
                          <hr className={`my-2 ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                          }`} />
                          <button
                            onClick={() => {
                              signOut();
                              setShowProfileMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>로그아웃</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className={`hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">로그인</span>
                </button>
              )}

              {/* 다크 모드 토글 */}
              <button 
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>

              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {showMobileMenu && (
          <div className={`md:hidden border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} transition-colors duration-300`}>
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleNavClick(key as View)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                    currentView === key
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
              
              {/* 모바일 사용자 정보 */}
              {user ? (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <User className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {dancer?.nickname || '사용자'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 mt-2 rounded-lg font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-red-400 hover:text-red-300 hover:bg-gray-700'
                        : 'text-red-600 hover:text-red-700 hover:bg-gray-50'
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>로그인</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 모바일 메뉴 배경 오버레이 */}
      {showMobileMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <ProfileEditModal 
        isOpen={showProfileEditModal} 
        onClose={() => setShowProfileEditModal(false)}
        onSave={(data) => {
          console.log('프로필 업데이트:', data);
          // TODO: 실제 프로필 업데이트 로직 구현
          setShowProfileEditModal(false);
        }}
      />
      <DancerRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          // 등록 성공 시 처리
          console.log('댄서/크루 등록 성공');
        }}
      />
    </>
  );
};

export default Header;