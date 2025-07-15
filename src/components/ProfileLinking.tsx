import React, { useState, useEffect } from 'react';
import { Search, User, Users, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Dancer, Crew, ProfileRequest } from '../types';
import { searchDancers } from '../services/dancerService';
import { searchCrews } from '../services/crewService';
import { createProfileRequest, getUserProfileRequests } from '../services/profileService';

interface ProfileLinkingProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileLinking: React.FC<ProfileLinkingProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'dancer' | 'crew'>('dancer');
  const [searchResults, setSearchResults] = useState<(Dancer | Crew)[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Dancer | Crew | null>(null);
  const [message, setMessage] = useState('');
  const [existingRequests, setExistingRequests] = useState<ProfileRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadExistingRequests();
    }
  }, [isOpen, user]);

  const loadExistingRequests = async () => {
    if (!user) return;
    try {
      const requests = await getUserProfileRequests(user.id);
      setExistingRequests(requests);
    } catch (error) {
      console.error('Error loading profile requests:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      let results: (Dancer | Crew)[] = [];
      
      if (searchType === 'dancer') {
        results = await searchDancers(searchQuery, 20);
      } else {
        results = await searchCrews(searchQuery, 20);
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedProfile || !user) return;
    
    setSubmitting(true);
    try {
      const request: Omit<ProfileRequest, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        requestType: searchType,
        targetId: selectedProfile.id,
        targetName: searchType === 'dancer' ? (selectedProfile as Dancer).nickname : selectedProfile.name,
        message: message.trim() || undefined,
        status: 'pending'
      };

      await createProfileRequest(request);
      await loadExistingRequests();
      setSelectedProfile(null);
      setMessage('');
      alert('연동 요청이 성공적으로 제출되었습니다. 관리자 승인을 기다려주세요.');
    } catch (error) {
      console.error('Error submitting profile request:', error);
      alert('연동 요청 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyRequested = (profileId: string) => {
    return existingRequests.some(req => 
      req.targetId === profileId && 
      req.requestType === searchType &&
      req.status === 'pending'
    );
  };

  const getRequestStatus = (profileId: string) => {
    return existingRequests.find(req => 
      req.targetId === profileId && 
      req.requestType === searchType
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">프로필 연동 요청</h2>
            <button
              onClick={onClose}
              className={`text-gray-500 hover:text-gray-700 ${
                isDarkMode ? 'hover:text-gray-300' : ''
              }`}
            >
              ✕
            </button>
          </div>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            본인의 댄서 또는 크루 프로필을 검색하여 연동을 요청하세요.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              연동 유형
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchType('dancer')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  searchType === 'dancer'
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>댄서</span>
              </button>
              <button
                onClick={() => setSearchType('crew')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  searchType === 'crew'
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>크루</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {searchType === 'dancer' ? '댄서' : '크루'} 검색
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={`${searchType === 'dancer' ? '댄서 이름 또는 닉네임' : '크루 이름'}을 입력하세요`}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '검색중...' : '검색'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                검색 결과 ({searchResults.length}개)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((profile) => {
                  const request = getRequestStatus(profile.id);
                  const isRequested = isAlreadyRequested(profile.id);
                  
                  return (
                    <div
                      key={profile.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedProfile?.id === profile.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => !isRequested && setSelectedProfile(profile)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}>
                            {searchType === 'dancer' ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-medium">
                              {searchType === 'dancer' ? (profile as Dancer).nickname : profile.name}
                            </div>
                            {searchType === 'dancer' && (
                              <div className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {(profile as Dancer).name} • {(profile as Dancer).crew || '무소속'}
                              </div>
                            )}
                            {searchType === 'crew' && (
                              <div className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {(profile as Crew).genre}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request && (
                            <div className="flex items-center space-x-1">
                              {request.status === 'pending' && (
                                <>
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-yellow-500">대기중</span>
                                </>
                              )}
                              {request.status === 'approved' && (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-500">승인됨</span>
                                </>
                              )}
                              {request.status === 'rejected' && (
                                <>
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-red-500">거부됨</span>
                                </>
                              )}
                            </div>
                          )}
                          {!isRequested && <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Profile Details */}
          {selectedProfile && (
            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                연동 요청 정보
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    선택된 프로필
                  </label>
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <div className="font-medium">
                      {searchType === 'dancer' ? (selectedProfile as Dancer).nickname : selectedProfile.name}
                    </div>
                    {searchType === 'dancer' && (
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {(selectedProfile as Dancer).name} • {(selectedProfile as Dancer).crew || '무소속'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    요청 메시지 (선택사항)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="본인임을 증명할 수 있는 정보나 메시지를 입력하세요"
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitRequest}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? '요청 중...' : '연동 요청'}
                  </button>
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Requests */}
          {existingRequests.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                이전 요청 내역
              </h3>
              <div className="space-y-2">
                {existingRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded-lg border ${
                      isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{request.targetName}</div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {request.requestType === 'dancer' ? '댄서' : '크루'} • {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {request.status === 'pending' && (
                          <>
                            <Clock className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-500">승인 대기</span>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">승인됨</span>
                          </>
                        )}
                        {request.status === 'rejected' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">거부됨</span>
                          </>
                        )}
                      </div>
                    </div>
                    {request.adminNote && (
                      <div className={`mt-2 p-2 rounded text-sm ${
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        관리자 메모: {request.adminNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileLinking;