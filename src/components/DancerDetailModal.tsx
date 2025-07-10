import React, { useState } from 'react';
import { X, Trophy, Users, Instagram, MessageCircle, Calendar, MapPin, Upload, Camera, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Dancer, Competition, Crew, Message } from '../types';
import { competitions as allCompetitions } from '../data/mockData';
import MessageModal from './MessageModal';
import MessageList from './MessageList';
import DancerResume from './DancerResume';

interface DancerDetailModalProps {
  dancer: Dancer;
  isOpen: boolean;
  onClose: () => void;
  onSelectCompetition: (competition: Competition) => void;
  onSelectCrew: (crew: Crew) => void;
  crews: Crew[];
  messages: Message[];
  onSendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
  onDancerClick: (dancerId: string) => void;
  onUpdateDancer?: (dancerId: string, updates: Partial<Dancer>) => void;
}

const DancerDetailModal: React.FC<DancerDetailModalProps> = ({ 
  dancer, 
  isOpen, 
  onClose, 
  onSelectCompetition, 
  onSelectCrew, 
  crews, 
  messages = [], 
  onSendMessage, 
  onDancerClick,
  onUpdateDancer
}) => {
  const { isDarkMode } = useTheme();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  if (!isOpen) return null;

  const handleImageUpload = (type: 'background' | 'profile') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onUpdateDancer) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          onUpdateDancer(dancer.id, {
            [type === 'background' ? 'backgroundImage' : 'profileImage']: imageUrl
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return isDarkMode ? 'text-yellow-400 bg-yellow-900' : 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50';
    if (rank === 3) return isDarkMode ? 'text-amber-400 bg-amber-900' : 'text-amber-600 bg-amber-50';
    return isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-50';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCrewClick = (crewName: string) => {
    if (onSelectCrew && crews) {
      const crew = crews.find(c => c.name === crewName);
      if (crew) {
        onClose();
        onSelectCrew(crew);
      }
    }
  };

  const handleSendMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
    if (onSendMessage) {
      await onSendMessage(message);
    }
  };

  // 댄서에게 온 메시지 필터링
  const dancerMessages = messages.filter(msg => msg.targetId === dancer.id && msg.targetType === 'dancer');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 border-b p-6 rounded-t-2xl transition-colors ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={dancer.profileImage || dancer.avatar || 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'}
                  alt={dancer.nickname}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100"
                />
                <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(dancer.rank)}`}>
                  {getRankIcon(dancer.rank)}
                </div>
                {onUpdateDancer && (
                  <button
                    onClick={() => handleImageUpload('profile')}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dancer.nickname}
                </h2>
                <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dancer.name}
                </p>
                {dancer.crew && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <button
                      onClick={() => handleCrewClick(dancer.crew!)}
                      className={`text-sm font-medium transition-colors hover:underline ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {dancer.crew}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {onUpdateDancer && (
                  <button
                    onClick={() => handleImageUpload('background')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>배경</span>
                  </button>
                )}
                <button
                  onClick={() => setShowResumeModal(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    isDarkMode 
                      ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>이력서</span>
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    isDarkMode 
                      ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>메시지</span>
                </button>
              </div>
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
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-blue-900 to-blue-800' : 'bg-gradient-to-r from-blue-50 to-blue-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Trophy className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                    {dancer.totalPoints.toFixed(1)}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    총 랭킹 포인트
                  </p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-green-900 to-green-800' : 'bg-gradient-to-r from-green-50 to-green-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Calendar className={`h-8 w-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>
                    {dancer.competitions.length}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    참여 대회 수
                  </p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-purple-900 to-purple-800' : 'bg-gradient-to-r from-purple-50 to-purple-100'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(dancer.rank)}`}>
                  {getRankIcon(dancer.rank)}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                    #{dancer.rank}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    현재 랭킹
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              전문 장르
            </h3>
            <div className="flex flex-wrap gap-2">
              {dancer.genres.map((genre, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Crew Information */}
          {dancer.crew && crews && (
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                소속 크루
              </h3>
              {(() => {
                const crew = crews.find(c => c.name === dancer.crew);
                if (crew) {
                  return (
                    <div 
                      onClick={() => handleCrewClick(dancer.crew!)}
                      className={`p-6 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={crew.avatar}
                          alt={crew.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className={`text-xl font-bold transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {crew.name}
                          </h4>
                          <p className={`text-sm transition-colors ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {crew.genre} • {crew.members.length}명
                          </p>
                          <p className={`text-sm mt-2 line-clamp-2 transition-colors ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {crew.introduction}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {crew.members.length}
                            </div>
                            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              멤버
                            </div>
                          </div>
                          <div className="text-center">
                            <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {crew.schedules.length}
                            </div>
                            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              스케줄
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {crew.members.slice(0, 3).map((member) => (
                            <button
                              key={member.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onDancerClick) {
                                  onClose();
                                  onDancerClick(member.id);
                                }
                              }}
                              className={`flex items-center space-x-2 px-2 py-1 rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'hover:bg-gray-600' 
                                  : 'hover:bg-gray-200'
                              }`}
                            >
                              <img
                                src={member.avatar}
                                alt={member.nickname}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className={`text-sm ${
                                isDarkMode 
                                  ? 'text-blue-400 hover:text-blue-300' 
                                  : 'text-blue-600 hover:text-blue-700'
                              }`}>
                                {member.nickname}
                              </span>
                            </button>
                          ))}
                          {crew.members.length > 3 && (
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              외 {crew.members.length - 3}명
                            </span>
                          )}
                        </div>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          크루 상세보기 →
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Users className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {dancer.crew}
                        </span>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* SNS */}
          {dancer.sns && (
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                SNS
              </h3>
              <a
                href={dancer.sns}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-pink-900 text-pink-300 hover:bg-pink-800' 
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                }`}
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram 보기</span>
              </a>
            </div>
          )}

          {/* Competition History */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              대회 참여 이력
            </h3>
            <div className="space-y-4">
              {dancer.competitions.map((competition) => {
                const participant = competition.participants.find(p => p.dancerId === dancer.id);
                const position = participant?.position || 0;
                const points = participant?.points || 0;
                
                return (
                  <div key={competition.id} className={`rounded-xl p-6 transition-colors ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {competition.eventName}
                        </h4>
                        <div className={`flex items-center space-x-4 text-sm transition-colors ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(competition.eventStartDate)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {competition.genres.map((genre, index) => (
                              <span key={index} className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                isDarkMode 
                                  ? 'bg-orange-900 text-orange-300' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg font-bold text-blue-600">{position}위</span>
                        </div>
                        <div className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          +{points.toFixed(1)} 포인트
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm line-clamp-2 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {competition.detailedDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Videos Section */}
          {dancer.videos && dancer.videos.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                관련 영상
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dancer.videos.map((video) => {
                  const competition = allCompetitions.find(c => c.id === video.competitionId);
                  return (
                    <div key={video.id} className={`rounded-lg overflow-hidden shadow-md transition-all ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative group">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                        </div>
                      </a>
                      <div className="p-4">
                        <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{video.title}</p>
                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(video.uploadDate)}</p>
                        {competition && (
                          <button 
                            onClick={() => {
                              onClose();
                              onSelectCompetition(competition);
                            }}
                            className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                              isDarkMode 
                                ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}>
                            {competition.eventName}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages Section */}
          <div className="mt-8">
            <MessageList 
              messages={dancerMessages}
              targetType="dancer"
              targetName={dancer.nickname}
            />
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <MessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            targetType="dancer"
            targetName={dancer.nickname}
            targetId={dancer.id}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* Resume Modal */}
        {showResumeModal && (
          <DancerResume
            dancer={dancer}
            onClose={() => setShowResumeModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DancerDetailModal;