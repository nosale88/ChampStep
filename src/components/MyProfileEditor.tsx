import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, Plus, Trash2, Upload, User, Award, Star, Mic, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Dancer, Crew, Award as AwardType, Performance, Lecture, Choreography } from '../types';
import { 
  getUserAccountLinks, 
  updateDancerProfile, 
  updateCrewProfile,
  addAwardToDancer,
  addPerformanceToDancer,
  addLectureToDancer,
  addChoreographyToDancer
} from '../services/profileService';
import { fetchDancerById } from '../services/dancerService';
import { fetchCrewById } from '../services/crewService';

interface MyProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyProfileEditor: React.FC<MyProfileEditorProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [linkedProfiles, setLinkedProfiles] = useState<{dancer?: Dancer, crew?: Crew}>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'awards' | 'performances' | 'lectures' | 'choreographies'>('basic');
  const [editingProfile, setEditingProfile] = useState<'dancer' | 'crew' | null>(null);
  
  // Form states
  const [profileData, setProfileData] = useState<any>({});
  const [newAward, setNewAward] = useState({ name: '', rank: '', date: '', organizer: '' });
  const [newPerformance, setNewPerformance] = useState({ name: '', role: '', date: '', location: '', description: '' });
  const [newLecture, setNewLecture] = useState({ title: '', institution: '', date: '', duration: '', participants: 0, description: '' });
  const [newChoreography, setNewChoreography] = useState({ title: '', client: '', date: '', genre: '', description: '', videoUrl: '' });

  useEffect(() => {
    if (isOpen && user) {
      loadLinkedProfiles();
    }
  }, [isOpen, user]);

  const loadLinkedProfiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const links = await getUserAccountLinks(user.id);
      const profiles: {dancer?: Dancer, crew?: Crew} = {};
      
      for (const link of links) {
        if (link.linkType === 'dancer') {
          const dancer = await fetchDancerById(link.linkedId);
          if (dancer) profiles.dancer = dancer;
        } else if (link.linkType === 'crew') {
          const crew = await fetchCrewById(link.linkedId);
          if (crew) profiles.crew = crew;
        }
      }
      
      setLinkedProfiles(profiles);
    } catch (error) {
      console.error('Error loading linked profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (type: 'dancer' | 'crew') => {
    setEditingProfile(type);
    if (type === 'dancer' && linkedProfiles.dancer) {
      setProfileData({ ...linkedProfiles.dancer });
    } else if (type === 'crew' && linkedProfiles.crew) {
      setProfileData({ ...linkedProfiles.crew });
    }
  };

  const saveProfile = async () => {
    if (!editingProfile || !user) return;
    setSaving(true);
    try {
      if (editingProfile === 'dancer' && linkedProfiles.dancer) {
        await updateDancerProfile(user.id, linkedProfiles.dancer.id, {
          bio: profileData.bio,
          phone: profileData.phone,
          email: profileData.email,
          instagram_url: profileData.instagramUrl,
          youtube_url: profileData.youtubeUrl,
          twitter_url: profileData.twitterUrl,
          profile_image: profileData.profileImage,
          background_image: profileData.backgroundImage
        });
        setLinkedProfiles(prev => ({ ...prev, dancer: { ...linkedProfiles.dancer!, ...profileData } }));
      } else if (editingProfile === 'crew' && linkedProfiles.crew) {
        await updateCrewProfile(user.id, linkedProfiles.crew.id, {
          introduction: profileData.introduction,
          background_image: profileData.backgroundImage
        });
        setLinkedProfiles(prev => ({ ...prev, crew: { ...linkedProfiles.crew!, ...profileData } }));
      }
      setEditingProfile(null);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const addAward = async () => {
    if (!linkedProfiles.dancer || !user || !newAward.name || !newAward.rank || !newAward.date) return;
    try {
      await addAwardToDancer(user.id, linkedProfiles.dancer.id, newAward);
      setNewAward({ name: '', rank: '', date: '', organizer: '' });
      await loadLinkedProfiles();
      alert('수상 이력이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding award:', error);
      alert('수상 이력 추가 중 오류가 발생했습니다.');
    }
  };

  const addPerformance = async () => {
    if (!linkedProfiles.dancer || !user || !newPerformance.name || !newPerformance.date) return;
    try {
      await addPerformanceToDancer(user.id, linkedProfiles.dancer.id, newPerformance);
      setNewPerformance({ name: '', role: '', date: '', location: '', description: '' });
      await loadLinkedProfiles();
      alert('공연 이력이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding performance:', error);
      alert('공연 이력 추가 중 오류가 발생했습니다.');
    }
  };

  const addLecture = async () => {
    if (!linkedProfiles.dancer || !user || !newLecture.title || !newLecture.date) return;
    try {
      await addLectureToDancer(user.id, linkedProfiles.dancer.id, newLecture);
      setNewLecture({ title: '', institution: '', date: '', duration: '', participants: 0, description: '' });
      await loadLinkedProfiles();
      alert('강의 이력이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding lecture:', error);
      alert('강의 이력 추가 중 오류가 발생했습니다.');
    }
  };

  const addChoreography = async () => {
    if (!linkedProfiles.dancer || !user || !newChoreography.title || !newChoreography.date) return;
    try {
      await addChoreographyToDancer(user.id, linkedProfiles.dancer.id, newChoreography);
      setNewChoreography({ title: '', client: '', date: '', genre: '', description: '', videoUrl: '' });
      await loadLinkedProfiles();
      alert('연출 이력이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding choreography:', error);
      alert('연출 이력 추가 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">내 프로필 관리</h2>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 ${
                isDarkMode ? 'hover:text-gray-300' : ''
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Profile Selection */}
          <div className={`w-1/3 border-r overflow-y-auto ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">연동된 프로필</h3>
              
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>로딩 중...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedProfiles.dancer && (
                    <div
                      onClick={() => startEditing('dancer')}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        editingProfile === 'dancer'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{linkedProfiles.dancer.nickname}</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            댄서 프로필
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {linkedProfiles.crew && (
                    <div
                      onClick={() => startEditing('crew')}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        editingProfile === 'crew'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{linkedProfiles.crew.name}</div>
                          <div className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            크루 프로필
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!linkedProfiles.dancer && !linkedProfiles.crew && (
                    <div className="text-center py-8">
                      <User className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        연동된 프로필이 없습니다
                      </p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        프로필 페이지에서 연동을 요청하세요
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Editor */}
          <div className="w-2/3 overflow-y-auto">
            {editingProfile ? (
              <div className="p-6">
                {/* Save Button */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {editingProfile === 'dancer' ? '댄서' : '크루'} 프로필 편집
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProfile(null)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      취소
                    </button>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>

                {editingProfile === 'dancer' && (
                  <div>
                    {/* Tabs for Dancer */}
                    <div className="flex space-x-4 mb-6 border-b">
                      {[
                        { key: 'basic', label: '기본 정보', icon: User },
                        { key: 'awards', label: '수상 이력', icon: Award },
                        { key: 'performances', label: '공연 이력', icon: Star },
                        { key: 'lectures', label: '강의 이력', icon: Mic },
                        { key: 'choreographies', label: '연출 이력', icon: Palette }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key as any)}
                          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                            activeTab === key
                              ? 'border-blue-500 text-blue-500'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 inline mr-1" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'basic' && (
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            자기소개
                          </label>
                          <textarea
                            value={profileData.bio || ''}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            rows={4}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              전화번호
                            </label>
                            <input
                              type="text"
                              value={profileData.phone || ''}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>

                          <div>
                            <label className={`block text-sm font-medium mb-2 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              이메일
                            </label>
                            <input
                              type="email"
                              value={profileData.email || ''}
                              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            인스타그램 URL
                          </label>
                          <input
                            type="url"
                            value={profileData.instagramUrl || ''}
                            onChange={(e) => setProfileData({ ...profileData, instagramUrl: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            유튜브 URL
                          </label>
                          <input
                            type="url"
                            value={profileData.youtubeUrl || ''}
                            onChange={(e) => setProfileData({ ...profileData, youtubeUrl: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            프로필 이미지 URL
                          </label>
                          <input
                            type="url"
                            value={profileData.profileImage || ''}
                            onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            배경 이미지 URL
                          </label>
                          <input
                            type="url"
                            value={profileData.backgroundImage || ''}
                            onChange={(e) => setProfileData({ ...profileData, backgroundImage: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'awards' && (
                      <div>
                        <div className="mb-6">
                          <h4 className="font-semibold mb-4">새 수상 이력 추가</h4>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <input
                              type="text"
                              placeholder="대회/시상 명"
                              value={newAward.name}
                              onChange={(e) => setNewAward({ ...newAward, name: e.target.value })}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <input
                              type="text"
                              placeholder="순위 (1위, 2위 등)"
                              value={newAward.rank}
                              onChange={(e) => setNewAward({ ...newAward, rank: e.target.value })}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <input
                              type="date"
                              value={newAward.date}
                              onChange={(e) => setNewAward({ ...newAward, date: e.target.value })}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <input
                              type="text"
                              placeholder="주최 기관"
                              value={newAward.organizer}
                              onChange={(e) => setNewAward({ ...newAward, organizer: e.target.value })}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                          <button
                            onClick={addAward}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            수상 이력 추가
                          </button>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">기존 수상 이력</h4>
                          {linkedProfiles.dancer?.awards && linkedProfiles.dancer.awards.length > 0 ? (
                            <div className="space-y-2">
                              {linkedProfiles.dancer.awards.map((award, index) => (
                                <div key={index} className={`p-3 rounded-lg border ${
                                  isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                }`}>
                                  <div className="font-medium">{award.name}</div>
                                  <div className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {award.rank} • {award.date} • {award.organizer}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              등록된 수상 이력이 없습니다.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 나머지 탭 내용들도 비슷한 패턴으로 구현 */}
                  </div>
                )}

                {editingProfile === 'crew' && (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        크루 소개
                      </label>
                      <textarea
                        value={profileData.introduction || ''}
                        onChange={(e) => setProfileData({ ...profileData, introduction: e.target.value })}
                        rows={4}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        배경 이미지 URL
                      </label>
                      <input
                        type="url"
                        value={profileData.backgroundImage || ''}
                        onChange={(e) => setProfileData({ ...profileData, backgroundImage: e.target.value })}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Edit3 className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    왼쪽에서 편집할 프로필을 선택하세요
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileEditor;