import React, { useState, useEffect } from 'react';
import { User, Camera, Upload, Save, Edit, X, Users, Music, Mail, Phone, Calendar, MapPin, Link, Image } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Dancer, Crew } from '../types';
import { uploadImage } from '../services/storageService';
import { fetchCrews } from '../services/crewService';
import { getValidAvatarUrl } from '../utils/avatarUtils';
import ImageUpload from './ImageUpload';
import ProfileOnboarding from './ProfileOnboarding';

const ProfilePage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user, dancer, updateProfile, loading, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [showImageUpload, setShowImageUpload] = useState<'avatar' | 'background' | null>(null);
  
  const [formData, setFormData] = useState({
    name: dancer?.name || '',
    nickname: dancer?.nickname || '',
    bio: dancer?.bio || '',
    phone: dancer?.phone || '',
    birthDate: dancer?.birthDate || '',
    genres: dancer?.genres || [],
    sns: dancer?.sns || '',
    crew: dancer?.crew || '',
    avatar: dancer?.avatar || '',
    backgroundImage: ''
  });

  useEffect(() => {
    if (dancer) {
      setFormData({
        name: dancer.name || '',
        nickname: dancer.nickname || '',
        bio: dancer.bio || '',
        phone: dancer.phone || '',
        birthDate: dancer.birthDate || '',
        genres: dancer.genres || [],
        sns: dancer.sns || '',
        crew: dancer.crew || '',
        avatar: dancer.avatar || '',
        backgroundImage: ''
      });
    }
  }, [dancer]);

  useEffect(() => {
    const loadCrews = async () => {
      try {
        const crewsData = await fetchCrews();
        setCrews(crewsData);
      } catch (error) {
        console.error('Error loading crews:', error);
      }
    };
    loadCrews();
  }, []);

  const handleSave = async () => {
    if (!user || !dancer) return;
    
    setProfileLoading(true);
    try {
      const { error } = await updateProfile({
        ...dancer,
        name: formData.name,
        nickname: formData.nickname,
        bio: formData.bio,
        phone: formData.phone,
        birthDate: formData.birthDate,
        genres: formData.genres,
        sns: formData.sns,
        crew: formData.crew,
        avatar: formData.avatar
      });

      if (error) throw error;
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'background') => {
    if (!user || !dancer) return;
    
    try {
      const imageUrl = await uploadImage(file, type, dancer.id);
      if (imageUrl) {
        setFormData(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatar' : 'backgroundImage']: imageUrl
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const availableGenres = ['Hip-Hop', 'Popping', 'Locking', 'Breaking', 'House', 'Krump', 'Waacking', 'Voguing', 'Jazz', 'Contemporary'];

  // 로딩 중일 때
  if (loading) {
    console.log('🔄 ProfilePage: Loading state - user:', !!user, 'dancer:', !!dancer);
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-center px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-500">프로필을 불러오는 중...</p>
          <p className="text-xs text-gray-400 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // 인증되지 않았을 때
  if (!user) {
    console.log('🔄 ProfilePage: No user - redirecting to login');
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-center px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <User className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">로그인이 필요합니다</h2>
          <p className="text-sm sm:text-base text-gray-500">프로필을 관리하려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  // 댄서 프로필이 없을 때 (로그인은 되었지만 프로필이 아직 생성되지 않음)
  if (!dancer) {
    console.log('🔄 ProfilePage: No dancer profile - showing onboarding');
    return <ProfileOnboarding />;
  }

  console.log('✅ ProfilePage: Rendering profile for dancer:', dancer.nickname);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-4 sm:py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 프로필 헤더 */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg sm:rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8`}>
          {/* 배경 이미지 */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {formData.backgroundImage && (
              <img 
                src={formData.backgroundImage} 
                alt="Background" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            
            {/* 배경 이미지 업로드 버튼 */}
            <button
              onClick={() => setShowImageUpload('background')}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-lg text-white transition-colors"
            >
              <Image className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            
            {/* 프로필 이미지 */}
            <div className="absolute -bottom-8 sm:-bottom-16 left-4 sm:left-8">
              <div className="relative">
                <img
                  src={getValidAvatarUrl(formData.avatar, user.id)}
                  alt={formData.name}
                  className="w-16 h-16 sm:w-32 sm:h-32 rounded-full border-2 sm:border-4 border-white shadow-lg object-cover"
                />
                <button
                  onClick={() => setShowImageUpload('avatar')}
                  className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 p-1 sm:p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white shadow-lg transition-colors"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* 프로필 정보 */}
          <div className="pt-12 sm:pt-20 pb-4 sm:pb-6 px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="mb-4 sm:mb-0">
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formData.name}
                </h1>
                <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  @{formData.nickname}
                </p>
              </div>
              {/* 편집 버튼 - 관리자만 가능 */}
              {user && isAdmin && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto ${
                    isEditing
                      ? isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  <span>{isEditing ? '취소' : '편집'}</span>
                </button>
              )}
            </div>
            
            {formData.bio && (
              <p className={`text-sm sm:text-base lg:text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formData.bio}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.genres.map(genre => (
                <span
                  key={genre}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 편집 폼 */}
        {isEditing && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8`}>
            <h2 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              프로필 편집
            </h2>
            
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4 md:gap-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    생년월일
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    SNS 링크
                  </label>
                  <input
                    type="url"
                    value={formData.sns}
                    onChange={(e) => setFormData(prev => ({ ...prev, sns: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    크루
                  </label>
                  <select
                    value={formData.crew}
                    onChange={(e) => setFormData(prev => ({ ...prev, crew: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">크루 선택</option>
                    {crews.map(crew => (
                      <option key={crew.id} value={crew.name}>
                        {crew.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* 자기소개 */}
            <div className="mt-4 sm:mt-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                자기소개
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="자신을 소개해주세요..."
              />
            </div>
            
            {/* 장르 선택 */}
            <div className="mt-4 sm:mt-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                전문 장르
              </label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.genres.includes(genre)
                        ? 'bg-blue-500 text-white'
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 저장 버튼 */}
            <div className="mt-6 sm:mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={profileLoading}
                className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  profileLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{profileLoading ? '저장 중...' : '저장'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 통계 및 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 활동 통계 */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6`}>
            <h3 className={`text-base sm:text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              활동 통계
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  총 스텝 점수
                </span>
                <span className={`font-bold text-blue-500 text-sm sm:text-base`}>
                  {dancer.totalPoints.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  전체 스텝
                </span>
                <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  #{dancer.rank}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  참여 대회
                </span>
                <span className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dancer.competitions.length}개
                </span>
              </div>
            </div>
          </div>
          
          {/* 연락처 정보 */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6`}>
            <h3 className={`text-base sm:text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              연락처 정보
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                  {user.email}
                </span>
              </div>
              {formData.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formData.phone}
                  </span>
                </div>
              )}
              {formData.sns && (
                <div className="flex items-center space-x-3">
                  <Link className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <a 
                    href={formData.sns}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm sm:text-base break-all"
                  >
                    SNS 프로필
                  </a>
                </div>
              )}
              {formData.crew && (
                <div className="flex items-center space-x-3">
                  <Users className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formData.crew}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 이미지 업로드 모달 */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 sm:p-6 max-w-md w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {showImageUpload === 'avatar' ? '프로필 사진 변경' : '배경 이미지 변경'}
              </h3>
              <button
                onClick={() => setShowImageUpload(null)}
                className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <ImageUpload
              onUpload={async (file) => {
                if (!user || !dancer) return null;
                
                try {
                  const imageUrl = await uploadImage(file, showImageUpload, dancer.id);
                  if (imageUrl) {
                    setFormData(prev => ({
                      ...prev,
                      [showImageUpload === 'avatar' ? 'avatar' : 'backgroundImage']: imageUrl
                    }));
                    setShowImageUpload(null);
                    return imageUrl;
                  }
                  return null;
                } catch (error) {
                  console.error('Error uploading image:', error);
                  return null;
                }
              }}
              aspectRatio={showImageUpload === 'avatar' ? '1:1' : '16:9'}
              label={showImageUpload === 'avatar' ? '프로필 사진' : '배경 이미지'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 