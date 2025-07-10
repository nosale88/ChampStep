import React, { useState } from 'react';
import { Crown, Search, Menu, Moon, Sun, LogIn, LogOut, User } from 'lucide-react';
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

  return (
    <header className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'} shadow-lg border-b sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                ChampStep
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors`}>
                챔피언으로 가는 댄서들의 여정을 기록합니다.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1">
            {[
              { key: 'home', label: '홈' },
              { key: 'ranking', label: '랭킹' },
              { key: 'competitions', label: '대회' },
              { key: 'crews', label: '크루' },
              ...(user ? [{ key: 'profile', label: '내 정보' }] : [])
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onViewChange(key as View)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <User className="h-4 w-4" />
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
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
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>로그인</span>
              </button>
            )}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};

export default Header;