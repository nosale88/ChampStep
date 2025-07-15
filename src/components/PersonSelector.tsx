import React, { useState, useEffect } from 'react';
import { Search, X, Users, User, Star, Check } from 'lucide-react';
import { Dancer, Crew } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface PersonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  dancers: Dancer[];
  crews: Crew[];
  onSelect: (person: SelectedPerson) => void;
  title: string;
  description?: string;
  allowMultiple?: boolean;
  selectedItems?: SelectedPerson[];
  filterType?: 'all' | 'dancer' | 'crew';
}

export interface SelectedPerson {
  id: string;
  type: 'dancer' | 'crew';
  name: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  dancerId?: string;
  crewId?: string;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({
  isOpen,
  onClose,
  dancers,
  crews,
  onSelect,
  title,
  description,
  allowMultiple = false,
  selectedItems = [],
  filterType = 'all'
}) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dancer' | 'crew'>(filterType === 'dancer' ? 'dancer' : filterType === 'crew' ? 'crew' : 'dancer');
  const [tempSelected, setTempSelected] = useState<SelectedPerson[]>(selectedItems);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedItems);
      setSearchTerm('');
    }
  }, [isOpen, selectedItems]);

  if (!isOpen) return null;

  const filteredDancers = dancers.filter(dancer =>
    dancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dancer.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dancer.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCrews = crews.filter(crew =>
    crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crew.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crew.introduction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (person: SelectedPerson) => {
    return tempSelected.some(item => 
      item.type === person.type && 
      item.id === person.id
    );
  };

  const handleSelect = (person: SelectedPerson) => {
    if (!allowMultiple) {
      onSelect(person);
      onClose();
      return;
    }

    if (isSelected(person)) {
      setTempSelected(prev => prev.filter(item => 
        !(item.type === person.type && item.id === person.id)
      ));
    } else {
      setTempSelected(prev => [...prev, person]);
    }
  };

  const handleConfirmMultiple = () => {
    tempSelected.forEach(person => onSelect(person));
    onClose();
  };

  const convertDancerToSelectedPerson = (dancer: Dancer): SelectedPerson => ({
    id: dancer.id,
    type: 'dancer',
    name: dancer.name,
    nickname: dancer.nickname,
    avatar: dancer.avatar || dancer.profileImage,
    dancerId: dancer.id
  });

  const convertCrewToSelectedPerson = (crew: Crew): SelectedPerson => ({
    id: crew.id,
    type: 'crew',
    name: crew.name,
    avatar: crew.avatar,
    crewId: crew.id
  });

  const renderDancerCard = (dancer: Dancer) => {
    const person = convertDancerToSelectedPerson(dancer);
    const selected = isSelected(person);

    return (
      <div
        key={dancer.id}
        onClick={() => handleSelect(person)}
        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
          selected
            ? (isDarkMode ? 'bg-blue-900 border-blue-500' : 'bg-blue-50 border-blue-500')
            : (isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50')
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={dancer.avatar || dancer.profileImage || '/api/placeholder/40/40'}
              alt={dancer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {selected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {dancer.name}
              </h4>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                @{dancer.nickname}
              </span>
              {dancer.rank <= 3 && (
                <Star className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                #{dancer.rank}
              </span>
              <div className="flex flex-wrap gap-1">
                {dancer.genres.slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            {dancer.crew && (
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {dancer.crew}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCrewCard = (crew: Crew) => {
    const person = convertCrewToSelectedPerson(crew);
    const selected = isSelected(person);

    return (
      <div
        key={crew.id}
        onClick={() => handleSelect(person)}
        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
          selected
            ? (isDarkMode ? 'bg-blue-900 border-blue-500' : 'bg-blue-50 border-blue-500')
            : (isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50')
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={crew.avatar || '/api/placeholder/40/40'}
              alt={crew.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {selected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {crew.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
              }`}>
                {crew.genre}
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {crew.members?.length || 0}명
              </span>
            </div>
            <p className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {crew.introduction}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`border-b p-6 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h2>
              {description && (
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="이름, 닉네임, 장르로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Tabs */}
          {filterType === 'all' && (
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setActiveTab('dancer')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dancer'
                    ? 'bg-blue-500 text-white'
                    : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                <User className="w-4 h-4" />
                <span>댄서</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {filteredDancers.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('crew')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'crew'
                    ? 'bg-blue-500 text-white'
                    : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                <Users className="w-4 h-4" />
                <span>크루</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {filteredCrews.length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {allowMultiple && tempSelected.length > 0 && (
            <div className="mb-4">
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                선택된 항목 ({tempSelected.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tempSelected.map((item, index) => (
                  <span
                    key={`${item.type}-${item.id}-${index}`}
                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <span>{item.name}</span>
                    <button
                      onClick={() => handleSelect(item)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(filterType === 'dancer' || activeTab === 'dancer') &&
              filteredDancers.map(renderDancerCard)
            }
            {(filterType === 'crew' || activeTab === 'crew') &&
              filteredCrews.map(renderCrewCard)
            }
          </div>

          {((filterType === 'dancer' || activeTab === 'dancer') && filteredDancers.length === 0) ||
           ((filterType === 'crew' || activeTab === 'crew') && filteredCrews.length === 0) ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                검색 결과가 없습니다
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                다른 키워드로 검색해보세요
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {allowMultiple && (
          <div className={`border-t p-6 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                취소
              </button>
              <button
                onClick={handleConfirmMultiple}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                선택 완료 ({tempSelected.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonSelector;