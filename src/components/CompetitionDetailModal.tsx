import React from 'react';
import { X, Calendar, Trophy, Users, Globe, Star, Award } from 'lucide-react';
import { Competition, Dancer } from '../types';
import { dancers as allDancers } from '../data/mockData';
import { useTheme } from '../contexts/ThemeContext';

interface CompetitionDetailModalProps {
  competition: Competition;
  isOpen: boolean;
  onClose: () => void;
  onDancerClick: (dancerId: string) => void;
}

const CompetitionDetailModal: React.FC<CompetitionDetailModalProps> = ({ competition, isOpen, onClose, onDancerClick }) => {
  const { isDarkMode } = useTheme();
  
  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

    const getParticipantDancer = (dancerId: string): Dancer | undefined => {
    return allDancers.find(d => d.id === dancerId);
  };

  

  

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `${position}위`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="relative">
          <img
            src={competition.poster || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg'}
            alt={competition.eventName}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-3xl font-bold mb-2">{competition.eventName}</h2>
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center space-x-1">
                <Calendar className="h-5 w-5" />
                                <span>{formatDate(competition.eventStartDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="h-5 w-5" />
                <span>{competition.prizeDetails}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Competition Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-purple-900 to-purple-800' : 'bg-gradient-to-r from-purple-50 to-purple-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Award className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                    {competition.participants?.length || 0}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    수상자 수
                  </p>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-xl transition-colors ${
              isDarkMode ? 'bg-gradient-to-r from-orange-900 to-orange-800' : 'bg-gradient-to-r from-orange-50 to-orange-100'
            }`}>
              <div className="flex items-center space-x-3">
                <Globe className={`h-8 w-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                    {competition.regionRequirement}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    참가 지역
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              대회 소개
            </h3>
                        <div
              className={`prose max-w-none transition-colors ${isDarkMode ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{ __html: competition.detailedDescription }}
            />
          </div>

          {/* Competition Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                대회 정보
              </h3>
              <div className="space-y-4">
                
                {competition.link && (
                  <div className="pt-2">
                    <a
                      href={competition.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      <span>공식 웹사이트</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            
          </div>

          {/* Genres */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              대회 장르
            </h3>
            <div className="flex flex-wrap gap-2">
              {competition.genres.map((genre, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-orange-900 text-orange-300' 
                      : 'bg-orange-50 text-orange-700'
                  }`}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Winners */}
          <div>
            <h3 className={`text-xl font-semibold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              수상자 명단
            </h3>
            <div className="space-y-4">
              {competition.participants
                .sort((a, b) => a.position - b.position)
                .map((participant) => {
                  const dancer = getParticipantDancer(participant.dancerId);
                  if (!dancer) return null;

                  return (
                    <div key={participant.dancerId} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {getPositionIcon(participant.position)}
                        </div>
                        <div
                          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onDancerClick(participant.dancerId)}
                        >
                          <img
                            src={dancer.avatar || 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg'}
                            alt={dancer.nickname}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className={`font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {dancer.nickname}
                            </p>
                            <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {dancer.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">+{participant.points.toFixed(1)}점</div>
                        {dancer.crew && (
                          <div className={`text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {dancer.crew}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetailModal;