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
  Download
} from 'lucide-react';
import { Dancer } from '../types';
import { fetchDancerByNickname } from '../services/dancerService';

const DancerPortfolio: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [dancer, setDancer] = useState<Dancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const loadDancer = async () => {
      if (!nickname) return;
      
      try {
        const dancerData = await fetchDancerByNickname(nickname);
        if (dancerData) {
          setDancer(dancerData);
          setLikeCount(Math.floor(Math.random() * 1000) + 100); // 임시 좋아요 수
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
        console.log('공유 취소됨');
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
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

  const videoUrls = dancer.videos || [];
  const achievements = dancer.awards || [];
  const genres = dancer.genres || [];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
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
      <div className="pt-16 sm:pt-20">
        {/* 히어로 섹션 */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
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
                src={dancer.profileImage || '/api/placeholder/200/200'}
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
                             {genres.map((genre, index) => (
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

        {/* 동영상 섹션 */}
        {videoUrls.length > 0 && (
          <section className="py-12 sm:py-20 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Performance Videos
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {videoUrls.map((video, index) => {
                  const videoId = extractYouTubeId(video.url);
                  return (
                    <div
                      key={index}
                      className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        {videoId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={video.title}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Play className="w-16 h-16 text-purple-500" />
                          </div>
                        )}
                      </div>
                                             <div className="p-4 sm:p-6">
                         <h3 className="text-lg sm:text-xl font-bold mb-2">{video.title}</h3>
                         <p className="text-gray-400 text-sm">{video.description}</p>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 수상 내역 섹션 */}
        {achievements.length > 0 && (
          <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-900/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Achievements
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {achievements.map((achievement, index) => (
                                     <div
                     key={index}
                     className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 sm:p-6 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 group"
                   >
                     <div className="flex items-start space-x-3 sm:space-x-4">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                         <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                       </div>
                       <div className="flex-1">
                         <h3 className="font-bold text-base sm:text-lg mb-1">{achievement.name}</h3>
                         <p className="text-yellow-400 text-sm mb-2">{achievement.rank}</p>
                         <div className="flex items-center space-x-2 text-gray-400 text-sm">
                           <Calendar className="w-4 h-4" />
                           <span>{achievement.date}</span>
                         </div>
                         <p className="text-gray-500 text-xs mt-1">{achievement.organizer}</p>
                       </div>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 기본 정보 섹션 */}
        <section className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Profile Info
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-gray-900/50 p-6 sm:p-8 rounded-2xl border border-blue-500/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-blue-400">Personal</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="font-medium">{dancer.name}</p>
                    </div>
                  </div>
                  
                  {dancer.birthDate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Birth Date</p>
                        <p className="font-medium">{dancer.birthDate}</p>
                      </div>
                    </div>
                  )}
                  
                  {dancer.crew && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Crew</p>
                        <p className="font-medium">{dancer.crew}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900/50 p-6 sm:p-8 rounded-2xl border border-purple-500/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-purple-400">Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Rank</p>
                      <p className="font-medium">#{dancer.rank}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Achievements</p>
                      <p className="font-medium">{achievements.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Music className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Genres</p>
                      <p className="font-medium">{genres.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

export default DancerPortfolio; 