import React, { useState } from 'react';
import { Crown, Menu, X, Moon, Sun, LogIn, LogOut, User, Home, Trophy, Calendar, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

type View = 'home' | 'ranking' | 'competitions' | 'crews' | 'profile';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, dancer, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { key: 'home', label: '홈', icon: Home },
    { key: 'ranking', label: '랭킹', icon: Trophy },
    { key: 'competitions', label: '대회', icon: Calendar },
    { key: 'crews', label: '크루', icon: Users },
    ...(user ? [{ key: 'profile', label: '내 정보', icon: User }] : [])
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
              {/* 사용자 정보 (데스크톱) */}
              {user ? (
                <div className="hidden sm:flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className={`text-xs sm:text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    } max-w-20 sm:max-w-none truncate`}>
                      {dancer?.nickname || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title="로그아웃"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
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
    </>
  );
};

export default Header;