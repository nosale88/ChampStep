import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Trophy, 
  Music, 
  GraduationCap, 
  Palette,
  Calendar,
  MapPin,
  Users,
  Building
} from 'lucide-react';
import { Dancer, Award, Performance, Lecture, Choreography } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface PortfolioAdminProps {
  dancer: Dancer;
  onUpdateDancer: (dancerId: string, updates: Partial<Dancer>) => void;
  onClose: () => void;
}

type EditItem = {
  type: 'award' | 'performance' | 'lecture' | 'choreography';
  item: any;
  isNew: boolean;
};

const PortfolioAdmin: React.FC<PortfolioAdminProps> = ({ dancer, onUpdateDancer, onClose }) => {
  const { isDarkMode } = useTheme();
  const [editingItem, setEditingItem] = useState<EditItem | null>(null);
  const [newItemType, setNewItemType] = useState<'award' | 'performance' | 'lecture' | 'choreography' | null>(null);

  const generateId = () => Date.now().toString();

  const createNewItem = (type: 'award' | 'performance' | 'lecture' | 'choreography') => {
    const baseItem = { id: generateId() };
    
    switch (type) {
      case 'award':
        return { ...baseItem, name: '', rank: '', date: '', organizer: '' };
      case 'performance':
        return { ...baseItem, name: '', role: '', date: '', location: '', description: '' };
      case 'lecture':
        return { ...baseItem, title: '', institution: '', date: '', duration: '', participants: 0, description: '' };
      case 'choreography':
        return { ...baseItem, title: '', client: '', date: '', genre: '', description: '', videoUrl: '' };
      default:
        return baseItem;
    }
  };

  const handleSaveItem = (item: any) => {
    if (!editingItem) return;

    const updates: Partial<Dancer> = {};
    
    switch (editingItem.type) {
      case 'award':
        if (editingItem.isNew) {
          updates.awards = [...(dancer.awards || []), item as Award];
        } else {
          updates.awards = (dancer.awards || []).map(a => a.id === item.id ? item : a);
        }
        break;
      case 'performance':
        if (editingItem.isNew) {
          updates.performances = [...(dancer.performances || []), item as Performance];
        } else {
          updates.performances = (dancer.performances || []).map(p => p.id === item.id ? item : p);
        }
        break;
      case 'lecture':
        if (editingItem.isNew) {
          updates.lectures = [...(dancer.lectures || []), item as Lecture];
        } else {
          updates.lectures = (dancer.lectures || []).map(l => l.id === item.id ? item : l);
        }
        break;
      case 'choreography':
        if (editingItem.isNew) {
          updates.choreographies = [...(dancer.choreographies || []), item as Choreography];
        } else {
          updates.choreographies = (dancer.choreographies || []).map(c => c.id === item.id ? item : c);
        }
        break;
    }

    onUpdateDancer(dancer.id, updates);
    setEditingItem(null);
    setNewItemType(null);
  };

  const handleDeleteItem = (type: 'award' | 'performance' | 'lecture' | 'choreography', id: string | number) => {
    const updates: Partial<Dancer> = {};
    
    switch (type) {
      case 'award':
        updates.awards = (dancer.awards || []).filter(a => a.id !== id);
        break;
      case 'performance':
        updates.performances = (dancer.performances || []).filter(p => p.id !== id);
        break;
      case 'lecture':
        updates.lectures = (dancer.lectures || []).filter(l => l.id !== id);
        break;
      case 'choreography':
        updates.choreographies = (dancer.choreographies || []).filter(c => c.id !== id);
        break;
    }

    onUpdateDancer(dancer.id, updates);
  };

  const startEdit = (type: 'award' | 'performance' | 'lecture' | 'choreography', item: any) => {
    setEditingItem({ type, item, isNew: false });
  };

  const startNew = (type: 'award' | 'performance' | 'lecture' | 'choreography') => {
    const newItem = createNewItem(type);
    setEditingItem({ type, item: newItem, isNew: true });
    setNewItemType(type);
  };

  const renderEditForm = () => {
    if (!editingItem) return null;

    const { type, item } = editingItem;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`sticky top-0 border-b p-6 rounded-t-2xl ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingItem.isNew ? '새 항목 추가' : '항목 편집'} - {
                  type === 'award' ? '수상경력' :
                  type === 'performance' ? '공연' :
                  type === 'lecture' ? '강의' : '연출'
                }
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {type === 'award' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    대회/시상식명
                  </label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, name: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    수상 순위
                  </label>
                  <input
                    type="text"
                    value={item.rank || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, rank: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    날짜
                  </label>
                  <input
                    type="date"
                    value={item.date || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, date: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    주최기관
                  </label>
                  <input
                    type="text"
                    value={item.organizer || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, organizer: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {type === 'performance' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    공연명
                  </label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, name: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    역할
                  </label>
                  <input
                    type="text"
                    value={item.role || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, role: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    날짜
                  </label>
                  <input
                    type="date"
                    value={item.date || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, date: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    장소
                  </label>
                  <input
                    type="text"
                    value={item.location || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, location: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    설명
                  </label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, description: e.target.value}})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {type === 'lecture' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    강의명
                  </label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, title: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    기관/장소
                  </label>
                  <input
                    type="text"
                    value={item.institution || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, institution: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    날짜
                  </label>
                  <input
                    type="date"
                    value={item.date || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, date: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    수업 시간
                  </label>
                  <input
                    type="text"
                    value={item.duration || ''}
                    placeholder="예: 2시간, 90분"
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, duration: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    참가자 수
                  </label>
                  <input
                    type="number"
                    value={item.participants || 0}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, participants: parseInt(e.target.value) || 0}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    설명
                  </label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, description: e.target.value}})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {type === 'choreography' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    작품명
                  </label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, title: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    클라이언트/의뢰처
                  </label>
                  <input
                    type="text"
                    value={item.client || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, client: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    날짜
                  </label>
                  <input
                    type="date"
                    value={item.date || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, date: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    장르
                  </label>
                  <input
                    type="text"
                    value={item.genre || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, genre: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    영상 URL (선택)
                  </label>
                  <input
                    type="url"
                    value={item.videoUrl || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, videoUrl: e.target.value}})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    설명
                  </label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, item: {...item, description: e.target.value}})}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                취소
              </button>
              <button
                onClick={() => handleSaveItem(editingItem.item)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`sticky top-0 border-b p-6 rounded-t-2xl ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              포트폴리오 관리 - {dancer.name}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 추가 버튼들 */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => startNew('award')}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span>수상경력 추가</span>
            </button>
            <button
              onClick={() => startNew('performance')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Music className="w-4 h-4" />
              <span>공연 추가</span>
            </button>
            <button
              onClick={() => startNew('lecture')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              <span>강의 추가</span>
            </button>
            <button
              onClick={() => startNew('choreography')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>연출 추가</span>
            </button>
          </div>

          {/* 수상경력 섹션 */}
          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              수상경력 ({dancer.awards?.length || 0})
            </h3>
            <div className="space-y-3">
              {(dancer.awards || []).map((award) => (
                <div
                  key={award.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {award.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {award.rank} • {award.organizer} • {award.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit('award', award)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem('award', award.id)}
                      className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 공연 섹션 */}
          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              공연 ({dancer.performances?.length || 0})
            </h3>
            <div className="space-y-3">
              {(dancer.performances || []).map((performance) => (
                <div
                  key={performance.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <Music className="w-5 h-5 text-purple-500" />
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {performance.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {performance.role} • {performance.location} • {performance.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit('performance', performance)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem('performance', performance.id)}
                      className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 강의 섹션 */}
          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              강의 ({dancer.lectures?.length || 0})
            </h3>
            <div className="space-y-3">
              {(dancer.lectures || []).map((lecture) => (
                <div
                  key={lecture.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-blue-500" />
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {lecture.title}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {lecture.institution} • {lecture.participants}명 • {lecture.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit('lecture', lecture)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem('lecture', lecture.id)}
                      className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 연출 섹션 */}
          <div className="mb-8">
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              연출 ({dancer.choreographies?.length || 0})
            </h3>
            <div className="space-y-3">
              {(dancer.choreographies || []).map((choreo) => (
                <div
                  key={choreo.id}
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <Palette className="w-5 h-5 text-green-500" />
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {choreo.title}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {choreo.client} • {choreo.genre} • {choreo.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit('choreography', choreo)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem('choreography', choreo.id)}
                      className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderEditForm()}
      </div>
    </div>
  );
};

export default PortfolioAdmin;