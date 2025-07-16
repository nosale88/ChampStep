import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Trophy, Users, Camera } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Dancer } from '../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<Dancer>) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const { dancer } = useAuth();
  
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    birthDate: '',
    genres: [] as string[],
    crew: '',
    bio: '',
    profileImage: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: ''
  });

  useEffect(() => {
    if (dancer && isOpen) {
      setFormData({
        nickname: dancer.nickname || '',
        email: dancer.email || '',
        birthDate: dancer.birthDate || '',
        genres: dancer.genres || [],
        crew: dancer.crew || '',
        bio: dancer.bio || '',
        profileImage: dancer.profileImage || '',
        instagramUrl: dancer.instagramUrl || '',
        youtubeUrl: dancer.youtubeUrl || '',
        twitterUrl: dancer.twitterUrl || ''
      });
    }
  }, [dancer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profileImage: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>프로필 편집</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt="프로필" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className={`h-12 w-12 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <User className="inline h-4 w-4 mr-1" />
                닉네임
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Mail className="inline h-4 w-4 mr-1" />
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="이메일을 입력하세요"
              />
            </div>



            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Calendar className="inline h-4 w-4 mr-1" />
                생년월일
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Trophy className="inline h-4 w-4 mr-1" />
                장르 (다중 선택 가능)
              </label>
              <div className="space-y-2">
                {['Hip-Hop', 'Popping', 'Locking', 'Breaking', 'House', 'Waacking', 'Krump', 'Choreography'].map((genre) => (
                  <label key={genre} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.genres.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, genres: [...prev.genres, genre] }));
                        } else {
                          setFormData(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Users className="inline h-4 w-4 mr-1" />
                크루
              </label>
              <input
                type="text"
                value={formData.crew}
                onChange={(e) => setFormData(prev => ({ ...prev, crew: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="소속 크루를 입력하세요"
              />
            </div>
          </div>

          {/* 자기소개 */}
          {/* 소셜 미디어 URL */}
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>소셜 미디어</h3>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="https://youtube.com/@username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Twitter URL
              </label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              자기소개
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="자신을 소개해주세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
