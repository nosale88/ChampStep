import React, { useState, useEffect } from 'react';
import { Shield, Users, Trophy, UserCog, Database, BarChart3,
  Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Dancer, Competition, Crew } from '../types';
import { fetchDancers } from '../services/dancerService';
import { fetchCompetitions } from '../services/competitionService';
import { fetchCrews } from '../services/crewService';

interface AdminPanelProps {
  dancers?: Dancer[];
  competitions?: Competition[];
  crews?: Crew[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  dancers: propDancers = [],
  competitions: propCompetitions = [],
  crews: propCrews = []
}) => {
  const { isDarkMode } = useTheme();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dancers, setDancers] = useState<Dancer[]>(propDancers);
  const [competitions, setCompetitions] = useState<Competition[]>(propCompetitions);
  const [crews, setCrews] = useState<Crew[]>(propCrews);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dancersData, competitionsData, crewsData] = await Promise.allSettled([
        fetchDancers(),
        fetchCompetitions(),
        fetchCrews()
      ]);

      if (dancersData.status === 'fulfilled') {
        setDancers(dancersData.value);
      }
      if (competitionsData.status === 'fulfilled') {
        setCompetitions(competitionsData.value);
      }
      if (crewsData.status === 'fulfilled') {
        setCrews(crewsData.value);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (entity: 'dancer' | 'competition' | 'crew') => {
    console.log(`Create ${entity}`);
  };

  const handleEdit = (item: any, entity: 'dancer' | 'competition' | 'crew') => {
    console.log(`Edit ${entity}:`, item);
  };

  const handleView = (item: any, entity: 'dancer' | 'competition' | 'crew') => {
    console.log(`View ${entity}:`, item);
  };

  const handleDelete = async (id: string, entity: 'dancer' | 'competition' | 'crew') => {
    if (window.confirm(`정말로 이 ${entity === 'dancer' ? '댄서' : entity === 'competition' ? '대회' : '크루'}를 삭제하시겠습니까?`)) {
      console.log(`Delete ${entity}:`, id);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: BarChart3 },
    { id: 'dancers', label: '댄서 관리', icon: Users },
    { id: 'competitions', label: '대회 관리', icon: Trophy },
    { id: 'crews', label: '크루 관리', icon: UserCog },
  ];

  const filteredDancers = dancers.filter(dancer =>
    dancer.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dancer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompetitions = competitions.filter(competition =>
    competition.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrews = crews.filter(crew =>
    crew.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-center p-8 rounded-xl shadow-lg transition-colors ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-500">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 transition-colors ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            관리자 패널
          </h1>
          <p className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            댄서, 대회, 크루를 관리하고 시스템을 모니터링하세요.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-xl shadow-lg transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      총 댄서
                    </p>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {dancers.length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      총 대회
                    </p>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {competitions.length}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      총 크루
                    </p>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {crews.length}
                    </p>
                  </div>
                  <UserCog className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className={`p-6 rounded-xl shadow-lg transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      시스템 상태
                    </p>
                    <p className={`text-2xl font-bold text-green-500`}>
                      정상
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-xl shadow-lg transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-bold mb-4 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                빠른 작업
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => loadData()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Database className="h-4 w-4" />
                  <span>{loading ? '새로고침 중...' : '데이터 새로고침'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('dancers')}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>댄서 관리</span>
                </button>
                <button
                  onClick={() => setActiveTab('competitions')}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trophy className="h-4 w-4" />
                  <span>대회 관리</span>
                </button>
                <button
                  onClick={() => setActiveTab('crews')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <UserCog className="h-4 w-4" />
                  <span>크루 관리</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dancers Tab */}
        {activeTab === 'dancers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                댄서 관리 ({dancers.length}명)
              </h2>
              <button
                onClick={() => handleCreate('dancer')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>새 댄서 추가</span>
              </button>
            </div>

            {/* Search */}
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="댄서 검색 (닉네임 또는 이름)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Dancers Table */}
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b transition-colors ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>닉네임</th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>이름</th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>스텝 점수</th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDancers.map((dancer) => (
                      <tr key={dancer.id} className={`border-b transition-colors ${
                        isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className={`py-3 px-4 transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{dancer.nickname}</td>
                        <td className={`py-3 px-4 transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{dancer.name}</td>
                        <td className={`py-3 px-4 transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{dancer.totalPoints || 0}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(dancer, 'dancer')}
                              className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(dancer, 'dancer')}
                              className="p-1 text-green-500 hover:text-green-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dancer.id, 'dancer')}
                              className="p-1 text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Competitions Tab */}
        {activeTab === 'competitions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                대회 관리 ({competitions.length}개)
              </h2>
              <button
                onClick={() => handleCreate('competition')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>새 대회 추가</span>
              </button>
            </div>
            
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="grid gap-4">
                {filteredCompetitions.map((competition) => (
                  <div key={competition.id} className={`p-4 rounded-lg border transition-colors ${
                    isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{competition.eventName}</h3>
                        <p className={`text-sm transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>날짜: {competition.eventStartDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(competition, 'competition')}
                          className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(competition, 'competition')}
                          className="p-1 text-green-500 hover:text-green-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(competition.id, 'competition')}
                          className="p-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Crews Tab */}
        {activeTab === 'crews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                크루 관리 ({crews.length}개)
              </h2>
              <button
                onClick={() => handleCreate('crew')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>새 크루 추가</span>
              </button>
            </div>
            
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="grid gap-4">
                {filteredCrews.map((crew) => (
                  <div key={crew.id} className={`p-4 rounded-lg border transition-colors ${
                    isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{crew.name}</h3>
                        <p className={`text-sm transition-colors ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{crew.introduction}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(crew, 'crew')}
                          className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(crew, 'crew')}
                          className="p-1 text-green-500 hover:text-green-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(crew.id, 'crew')}
                          className="p-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
