import React, { useState, useEffect } from 'react';
import { Settings, Users, Trophy, UserCog, Database, BarChart3, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { adminActions } from '../utils/adminUtils';

const AdminPanel: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalDancers: 0,
    totalCompetitions: 0,
    totalCrews: 0,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const systemStats = await adminActions.getSystemStats();
      setStats(systemStats);
    } catch (error) {
      console.error('관리자 통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 dark:text-gray-400">
            관리자 권한이 필요한 페이지입니다.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'dancers', label: '댄서 관리', icon: Users },
    { id: 'competitions', label: '대회 관리', icon: Trophy },
    { id: 'system', label: '시스템 설정', icon: Settings },
  ];

  const statsCards = [
    {
      title: '총 댄서 수',
      value: stats.totalDancers,
      icon: Users,
      color: 'blue'
    },
    {
      title: '총 대회 수',
      value: stats.totalCompetitions,
      icon: Trophy,
      color: 'green'
    },
    {
      title: '총 크루 수',
      value: stats.totalCrews,
      icon: UserCog,
      color: 'purple'
    },
    {
      title: '시스템 상태',
      value: '정상',
      icon: Database,
      color: 'indigo'
    }
  ];

  const handleRecalculateSteps = async () => {
    if (confirm('모든 댄서의 스텝 점수를 재계산하시겠습니까?')) {
      try {
        setLoading(true);
        await adminActions.recalculateAllSteps();
        alert('스텝 점수 재계산이 완료되었습니다.');
        await loadStats();
      } catch (error) {
        console.error('스텝 점수 재계산 실패:', error);
        alert('스텝 점수 재계산 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className={`text-2xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                관리자 패널
              </h1>
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                ChampStep 시스템 관리 및 설정
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === id
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map(({ title, value, icon: Icon, color }, index) => (
                <div key={index} className={`rounded-xl p-6 transition-colors ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-lg`}>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-${color}-500 bg-opacity-20`}>
                      <Icon className={`h-6 w-6 text-${color}-500`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold transition-colors ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {value}
                      </p>
                      <p className={`text-sm transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                빠른 작업
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleRecalculateSteps}
                  disabled={loading}
                  className="p-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                >
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  스텝 점수 재계산
                </button>
                <button
                  onClick={loadStats}
                  disabled={loading}
                  className="p-4 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                >
                  <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                  통계 새로고침
                </button>
                <button
                  className="p-4 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                >
                  <Settings className="h-6 w-6 mx-auto mb-2" />
                  시스템 설정
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h3 className={`text-lg font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                최근 활동
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <p className={`text-sm transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    관리자 패널에 접속했습니다.
                  </p>
                  <p className={`text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    방금 전
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content placeholder */}
        {activeTab !== 'dashboard' && (
          <div className={`rounded-xl p-8 text-center transition-colors ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'
          } shadow-lg`}>
            <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p>이 기능은 아직 구현 중입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;