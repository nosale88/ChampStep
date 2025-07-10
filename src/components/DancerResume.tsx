import React, { useState, useRef } from 'react';
import { Download, FileText, Eye, Calendar, Trophy, Users, Music, School, Briefcase } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Dancer } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DancerResumeProps {
  dancer: Dancer;
  onClose: () => void;
}

const DancerResume: React.FC<DancerResumeProps> = ({ dancer, onClose }) => {
  const { isDarkMode } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // 이력서 PDF 다운로드
  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(resumeRef.current);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${dancer.name}_이력서.pdf`);
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 실제 댄서 데이터 사용, 없으면 기본값
  const education = dancer.education || [
    { id: 1, school: '한국예술종합학교', major: '무용과', period: '2018.03 - 2022.02', degree: '학사' }
  ];

  const career = dancer.career || [
    { id: 1, company: '1MILLION Dance Studio', position: '안무가', period: '2022.03 - 현재', description: '힙합 안무 및 지도' },
    { id: 2, company: 'Just Jerk Crew', position: '댄서', period: '2020.06 - 2022.02', description: '크루 활동 및 공연' }
  ];

  const awards = dancer.awards || [
    { id: 1, name: 'World of Dance 2023', rank: '우승', date: '2023.08', organizer: 'NBC' },
    { id: 2, name: 'Groove Night Vol.3', rank: '준우승', date: '2024.08', organizer: 'Groove Night' }
  ];

  const performances = dancer.performances || [
    { id: 1, name: 'BTS World Tour', role: '백댄서', date: '2023.06 - 2023.08', location: '전세계' },
    { id: 2, name: 'Street Woman Fighter', role: '참가자', date: '2022.08 - 2022.10', location: 'Mnet' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* 헤더 */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
            <FileText className="mr-3 h-6 w-6" />
            이력서 미리보기
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? 'PDF 생성 중...' : 'PDF 다운로드'}
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              닫기
            </button>
          </div>
        </div>

        {/* 이력서 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div 
            ref={resumeRef}
            className="bg-white text-black p-8 mx-auto"
            style={{ maxWidth: '210mm', minHeight: '297mm' }}
          >
            {/* 제목 */}
            <h1 className="text-3xl font-bold text-center mb-8">이 력 서</h1>

            {/* 기본 정보 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">기본 정보</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 row-span-4">
                  <img 
                    src={dancer.profileImage || dancer.avatar} 
                    alt={dancer.name}
                    className="w-32 h-40 object-cover border border-gray-300"
                  />
                </div>
                <div className="col-span-2">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100 w-1/3">성명</td>
                        <td className="py-2 px-4">{dancer.name}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100">활동명</td>
                        <td className="py-2 px-4">{dancer.nickname}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100">생년월일</td>
                        <td className="py-2 px-4">{dancer.birthDate ? new Date(dancer.birthDate).toLocaleDateString('ko-KR') : '1995.01.01'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100">연락처</td>
                        <td className="py-2 px-4">{dancer.phone || '010-1234-5678'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100">이메일</td>
                        <td className="py-2 px-4">{dancer.email || 'dancer@example.com'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100">전문 장르</td>
                        <td className="py-2 px-4">{dancer.genres.join(', ')}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4 font-medium bg-gray-100">소속 크루</td>
                        <td className="py-2 px-4">{dancer.crew || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 학력 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2 flex items-center">
                <School className="mr-2 h-5 w-5" />
                학력
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">학교명</th>
                    <th className="py-2 px-4 text-left">전공</th>
                    <th className="py-2 px-4 text-left">재학기간</th>
                    <th className="py-2 px-4 text-left">학위</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((edu) => (
                    <tr key={edu.id} className="border-b">
                      <td className="py-2 px-4">{edu.school}</td>
                      <td className="py-2 px-4">{edu.major}</td>
                      <td className="py-2 px-4">{edu.period}</td>
                      <td className="py-2 px-4">{edu.degree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 경력 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2 flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                경력
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">소속</th>
                    <th className="py-2 px-4 text-left">직책</th>
                    <th className="py-2 px-4 text-left">기간</th>
                    <th className="py-2 px-4 text-left">주요 업무</th>
                  </tr>
                </thead>
                <tbody>
                  {career.map((car) => (
                    <tr key={car.id} className="border-b">
                      <td className="py-2 px-4">{car.company}</td>
                      <td className="py-2 px-4">{car.position}</td>
                      <td className="py-2 px-4">{car.period}</td>
                      <td className="py-2 px-4">{car.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 수상 경력 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2 flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                수상 경력
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">대회명</th>
                    <th className="py-2 px-4 text-left">순위</th>
                    <th className="py-2 px-4 text-left">일자</th>
                    <th className="py-2 px-4 text-left">주최</th>
                  </tr>
                </thead>
                <tbody>
                  {awards.map((award) => (
                    <tr key={award.id} className="border-b">
                      <td className="py-2 px-4">{award.name}</td>
                      <td className="py-2 px-4">{award.rank}</td>
                      <td className="py-2 px-4">{award.date}</td>
                      <td className="py-2 px-4">{award.organizer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 공연 활동 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2 flex items-center">
                <Music className="mr-2 h-5 w-5" />
                공연 활동
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">공연명</th>
                    <th className="py-2 px-4 text-left">역할</th>
                    <th className="py-2 px-4 text-left">기간</th>
                    <th className="py-2 px-4 text-left">장소</th>
                  </tr>
                </thead>
                <tbody>
                  {performances.map((perf) => (
                    <tr key={perf.id} className="border-b">
                      <td className="py-2 px-4">{perf.name}</td>
                      <td className="py-2 px-4">{perf.role}</td>
                      <td className="py-2 px-4">{perf.date}</td>
                      <td className="py-2 px-4">{perf.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 자기소개 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-800 pb-2">자기소개</h2>
              <p className="text-sm leading-relaxed">
                {dancer.bio || '안녕하세요. 댄서 ' + dancer.name + '입니다. 다양한 장르의 춤을 통해 관객들과 소통하며, 끊임없이 발전하는 아티스트가 되고자 노력하고 있습니다.'}
              </p>
            </div>

            {/* 작성일 */}
            <div className="text-right text-sm text-gray-600 mt-8">
              작성일: {new Date().toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DancerResume; 