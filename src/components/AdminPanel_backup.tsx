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
      
      if (dancersData.status === 'fulfilled') setDancers(dancersData.value);
      if (competitionsData.status === 'fulfilled') setCompetitions(competitionsData.value);
      if (crewsData.status === 'fulfilled') setCrews(crewsData.value);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
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
    { id: 'crews', label: '크루 관리', icon: UserCog },
  ];

  const handleCreate = (entity: 'dancer' | 'competition' | 'crew') => {
    setCurrentEntity(entity);
    setModalType('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: any, entity: 'dancer' | 'competition' | 'crew') => {
    setCurrentEntity(entity);
    setModalType('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleView = (item: any, entity: 'dancer' | 'competition' | 'crew') => {
    setCurrentEntity(entity);
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string, entity: 'dancer' | 'competition' | 'crew') => {
    if (!confirm(`정말로 이 ${entity === 'dancer' ? '댄서' : entity === 'competition' ? '대회' : '크루'}를 삭제하시겠습니까?`)) return;
    
    try {
      // TODO: 실제 삭제 API 호출
      if (entity === 'dancer') {
        setDancers(prev => prev.filter(d => d.id !== id));
      } else if (entity === 'competition') {
        setCompetitions(prev => prev.filter(c => c.id !== id));
      } else if (entity === 'crew') {
        setCrews(prev => prev.filter(c => c.id !== id));
      }
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredDancers = dancers.filter(d => 
    d.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompetitions = competitions.filter(c => 
    c.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrews = crews.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className={`rounded-xl p-6 transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {dancers.length}
                    </p>
                    <p className={`text-sm transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      총 댄서 수
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
                    <Trophy className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {competitions.length}
                    </p>
                    <p className={`text-sm transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      총 대회 수
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-purple-500 bg-opacity-20">
                    <UserCog className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {crews.length}
                    </p>
                    <p className={`text-sm transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      총 크루 수
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-xl p-6 transition-colors ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-indigo-500 bg-opacity-20">
                    <Database className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      정상
                    </p>
                    <p className={`text-sm transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      시스템 상태
                    </p>
                  </div>
                </div>
              </div>
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
                  onClick={loadData}
                  disabled={loading}
                  className="p-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                >
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  데이터 새로고침
                </button>
                <button
                  onClick={() => setActiveTab('dancers')}
                  className="p-4 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  댄서 관리
                </button>
                <button
                  onClick={() => setActiveTab('competitions')}
                  className="p-4 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                >
                  <Trophy className="h-6 w-6 mx-auto mb-2" />
                  대회 관리
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
            
            <div className={`rounded-xl p-6 transition-colors ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="댄서 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b transition-colors ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>닉네임</th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>실명</th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>스텝 점수</th>
                      <th className={`text-left py-3 px-4 font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDancers.slice(0, 10).map((dancer) => (
                      <tr key={dancer.id} className={`border-b transition-colors ${
                        isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className={`py-3 px-4 transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
          </div>
        </div>
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