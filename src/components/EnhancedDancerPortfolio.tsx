import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Play, 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Instagram, 
  Youtube, 
  Twitter,
  ExternalLink,
  Award,
  Music,
  Zap,
  Heart,
  Share2,
  Download,
  Edit3,
  Plus,
  Save,
  X,
  GraduationCap,
  Mic,
  Palette,
  Building
} from 'lucide-react';
import { Dancer, Award as AwardType, Performance, Lecture, Choreography } from '../types';
import { fetchDancerByNickname } from '../services/dancerService';

type PortfolioCategory = 'all' | 'awards' | 'performances' | 'lectures' | 'choreography';

const EnhancedDancerPortfolio: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [dancer, setDancer] = useState<Dancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const loadDancer = async () => {
      if (!nickname) return;
      
      try {
        const dancerData = await fetchDancerByNickname(nickname);
        if (dancerData) {
          setDancer(dancerData);
          setLikeCount(Math.floor(Math.random() * 1000) + 100);
        } else {
          setError('댄서를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('댄서 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadDancer();
  }, [nickname]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${dancer?.name} 댄서 포트폴리오`,
          text: `${dancer?.name} 댄서의 포트폴리오를 확인해보세요!`,
          url: window.location.href,
        });
      } catch (err) {
        // 필요시 사용자에게 알림 표시
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const categories = [
    { id: 'all', label: '전체', icon: Star, count: 0 },
    { id: 'awards', label: '수상경력', icon: Trophy, count: dancer?.awards?.length || 0 },
    { id: 'performances', label: '공연', icon: Music, count: dancer?.performances?.length || 0 },
    { id: 'lectures', label: '강의', icon: GraduationCap, count: dancer?.lectures?.length || 0 },
    { id: 'choreography', label: '연출', icon: Palette, count: dancer?.choreographies?.length || 0 },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderAwards = () => {
    if (!dancer?.awards?.length) return <div className="text-gray-400 text-center py-8">수상경력이 없습니다.</div>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dancer.awards.map((award) => (
          <div
            key={award.id}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{award.name}</h3>
                <p className="text-yellow-400 text-sm mb-2">{award.rank}</p>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(award.date)}</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">{award.organizer}</p>
              </div>
              {isEditMode && (
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPerformances = () => {
    if (!dancer?.performances?.length) return <div className="text-gray-400 text-center py-8">공연 이력이 없습니다.</div>;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dancer.performances.map((performance) => (
          <div
            key={performance.id}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{performance.name}</h3>
                  <p className="text-purple-400 text-sm mb-2">{performance.role}</p>
                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(performance.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{performance.location}</span>
                    </div>
                  </div>
                  {performance.description && (
                    <p className="text-gray-300 text-sm mt-2">{performance.description}</p>
                  )}
                </div>
              </div>
              {isEditMode && (
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLectures = () => {
    if (!dancer?.lectures?.length) return <div className="text-gray-400 text-center py-8">강의 이력이 없습니다.</div>;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dancer.lectures.map((lecture) => (
          <div
            key={lecture.id}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{lecture.title}</h3>
                  <p className="text-blue-400 text-sm mb-2">{lecture.institution}</p>
                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(lecture.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{lecture.participants}명</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">수업 시간: {lecture.duration}</p>
                  {lecture.description && (
                    <p className="text-gray-300 text-sm mt-2">{lecture.description}</p>
                  )}
                </div>
              </div>
              {isEditMode && (
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderChoreography = () => {
    if (!dancer?.choreographies?.length) return <div className="text-gray-400 text-center py-8">연출 이력이 없습니다.</div>;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dancer.choreographies.map((choreo) => (
          <div
            key={choreo.id}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{choreo.title}</h3>
                  <p className="text-green-400 text-sm mb-2">{choreo.client}</p>
                  <div className="flex items-center space-x-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(choreo.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Music className="w-4 h-4" />
                      <span>{choreo.genre}</span>
                    </div>
                  </div>
                  {choreo.description && (
                    <p className="text-gray-300 text-sm mt-2">{choreo.description}</p>
                  )}
                  {choreo.videoUrl && (
                    <a
                      href={choreo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-green-400 hover:text-green-300 text-sm mt-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>영상 보기</span>
                    </a>
                  )}
                </div>
              </div>
              {isEditMode && (
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'awards':
        return renderAwards();
      case 'performances':
        return renderPerformances();
      case 'lectures':
        return renderLectures();
      case 'choreography':
        return renderChoreography();
      default:
        return (
          <div className="space-y-12">
            {dancer?.awards?.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">수상경력</h3>
                {renderAwards()}
              </div>
            )}
            {dancer?.performances?.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">공연</h3>
                {renderPerformances()}
              </div>
            )}
            {dancer?.lectures?.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">강의</h3>
                {renderLectures()}
              </div>
            )}
            {dancer?.choreographies?.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">연출</h3>
                {renderChoreography()}
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">포트폴리오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !dancer) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕺</div>
          <h1 className="text-white text-2xl mb-4">댄서를 찾을 수 없습니다</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* 배경 이미지 */}
      {dancer.backgroundImage && (
        <div 
          className="fixed inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${dancer.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">{dancer.name}</h1>
              <p className="text-xs sm:text-sm text-gray-400">@{dancer.nickname}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {isEditMode ? (
              <>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full bg-green-500 hover:bg-green-600 text-white transition-all"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">저장</span>
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">취소</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
              >
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">편집</span>
              </button>
            )}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full transition-all ${
                isLiked 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs sm:text-sm">{likeCount}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm hidden sm:inline">공유</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pt-16 sm:pt-20 relative z-10">
        {/* 히어로 섹션 */}
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden px-4 sm:px-6">
          {/* 배경 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-blue-900/50"></div>
          
          {/* 애니메이션 배경 */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          {/* 프로필 이미지 */}
          <div className="relative z-10 text-center">
            <div className="relative inline-block mb-6 sm:mb-8">
              <img
                src={dancer.profileImage || dancer.avatar || '/api/placeholder/200/200'}
                alt={dancer.name}
                className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-purple-500 shadow-2xl"
              />
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {dancer.name}
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-4 sm:mb-6">@{dancer.nickname}</p>
            
            {dancer.bio && (
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
                {dancer.bio}
              </p>
            )}

            {/* 장르 태그 */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
              {dancer.genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs sm:text-sm font-medium border border-purple-500/30 backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* 소셜 링크 */}
            <div className="flex justify-center space-x-3 sm:space-x-4">
              {dancer.instagramUrl && (
                <a
                  href={dancer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </a>
              )}
              {dancer.youtubeUrl && (
                <a
                  href={dancer.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </a>
              )}
              {dancer.twitterUrl && (
                <a
                  href={dancer.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 카테고리 네비게이션 */}
        <div className="sticky top-16 sm:top-20 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id as PortfolioCategory)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      activeCategory === category.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                    {category.count > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeCategory === category.id
                          ? 'bg-white/20'
                          : 'bg-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 포트폴리오 콘텐츠 */}
        <div className="py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {activeCategory === 'all' ? '포트폴리오' : categories.find(c => c.id === activeCategory)?.label}
              </h2>
              {isEditMode && (
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>추가</span>
                </button>
              )}
            </div>
            
            {renderContent()}
          </div>
        </div>

        {/* 푸터 */}
        <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-gray-800">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">ChampStep</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Powered by ChampStep - The ultimate dance ranking platform
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EnhancedDancerPortfolio;