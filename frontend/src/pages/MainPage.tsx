import { Link } from 'react-router-dom';
import { Users, MessageSquare, Brain, CheckCircle, ArrowRight, Heart, Eye, BookOpen, Star, TrendingUp, Shield } from 'lucide-react';
import BeforeNavbar from '../components/BeforeLoginNavbar.tsx';

const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-cyan-500">
      <BeforeNavbar />

      {/* Hero Section - 개선된 디자인 */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 신뢰 배지 */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">AI 기반 맞춤 학습</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">전문가 검증 커리큘럼</span>
            </div>
          </div>

          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8 drop-shadow-lg">
              우리 아이만을 위한
              <br />
              <span className="text-yellow-300">특별한 학습 여정</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-12 font-medium drop-shadow-md">
              "어떤 치료를 받고 있는지" 궁금하셨죠?
              <br />
              Captain Echo는 오프라인 상담처럼 모든 과정을 투명하게 보여드립니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-white text-blue-600 font-bold px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-xl hover:scale-105 text-lg group"
              >
                무료로 시작하기
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                to="/introduction"
                className="inline-flex items-center justify-center bg-blue-600/20 backdrop-blur-sm text-white font-bold px-10 py-5 rounded-2xl border-2 border-white/50 hover:bg-white/30 transition-all text-lg"
              >
                서비스 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 가치 제안 - 3가지 */}
      <section className="py-20 px-6 bg-white/95">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Captain Echo가 특별한 이유
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              단순한 학습 앱이 아닙니다.
              부모님과 함께 성장하는 투명한 학습 파트너입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 카드 1 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">투명한 학습 과정</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                AI가 왜 이 문제를 선택했는지, 어떤 계획으로 진행되는지 모두 확인할 수 있습니다.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">AI 협의 과정 실시간 공개</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">학습 데이터 시각화</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">주간 상세 리포트</span>
                </li>
              </ul>
            </div>

            {/* 카드 2 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI 맞춤 커리큘럼</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                3개의 AI 에이전트가 매일 협의하여 우리 아이만을 위한 학습 계획을 생성합니다.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">학생 수준별 난이도 조절</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">관심사 반영 문제 생성</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">부모님 학습 목표 반영</span>
                </li>
              </ul>
            </div>

            {/* 카드 3 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">게임형 학습</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                메아리 동굴 탐험을 통해 음소 분절, 합성, 단어, 문장 읽기를 재미있게 학습합니다.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">4개 동굴 단계별 학습</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">즉각적인 음성 피드백</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">성취감을 주는 보상 시스템</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* A2A 협의 시스템 - 시각적 강화 */}
      <section className="py-24 px-6 bg-gradient-to-b from-white/95 to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-purple-100 text-purple-700 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-md">
              🤖 Captain Echo의 핵심 기술
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              A2A (Agent-to-Agent) 협의 시스템
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              마치 오프라인 상담에서 전문가들이 모여 논의하듯,
              <br className="hidden md:block" />
              <span className="font-semibold text-blue-700">3명의 AI 에이전트가 매일 아침 회의를 열어</span> 우리 아이만을 위한 학습 계획을 세웁니다.
            </p>
          </div>

          {/* 3개 에이전트 카드 - 재디자인 */}
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {/* 학업 에이전트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-xl border-2 border-blue-200 hover:border-blue-400 transition-all">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">학업 에이전트</h3>
                <div className="bg-blue-50 p-5 rounded-2xl mb-5">
                  <p className="text-gray-700 text-center italic leading-relaxed">
                    "이 자모를 집중적으로 연습하면 빠르게 향상될 거예요"
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700">
                  <TrendingUp className="w-5 h-5" />
                  <span>약점 분석 → 효과적인 학습</span>
                </div>
              </div>
            </div>

            {/* 정서 에이전트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-xl border-2 border-green-200 hover:border-green-400 transition-all">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">정서 에이전트</h3>
                <div className="bg-green-50 p-5 rounded-2xl mb-5">
                  <p className="text-gray-700 text-center italic leading-relaxed">
                    "어제 어려워했으니 오늘은 자신감을 회복할 수 있는 문제를 주자"
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
                  <Heart className="w-5 h-5" />
                  <span>정서 안정 → 학습 동기 유지</span>
                </div>
              </div>
            </div>

            {/* 부모 에이전트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">부모 에이전트</h3>
                <div className="bg-purple-50 p-5 rounded-2xl mb-5">
                  <p className="text-gray-700 text-center italic leading-relaxed">
                    "부모님이 설정한 '약점 집중'을 반영해서 계획을 조정할게요"
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-700">
                  <Users className="w-5 h-5" />
                  <span>부모 목표 → 맞춤형 방향</span>
                </div>
              </div>
            </div>
          </div>

          {/* 협의 과정 시각화 - 개선 */}
          <div className="bg-white p-12 rounded-3xl shadow-2xl border-2 border-blue-300">
            <h4 className="text-center text-2xl font-bold text-gray-900 mb-8">매일 아침 자동 회의</h4>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-6">
                <div className="bg-blue-100 p-5 rounded-2xl shadow-md">
                  <Brain className="w-10 h-10 text-blue-600" />
                </div>
                <MessageSquare className="w-8 h-8 text-gray-400" />
                <div className="bg-green-100 p-5 rounded-2xl shadow-md">
                  <Heart className="w-10 h-10 text-green-600" />
                </div>
                <MessageSquare className="w-8 h-8 text-gray-400" />
                <div className="bg-purple-100 p-5 rounded-2xl shadow-md">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
              </div>
              <div className="hidden md:block">
                <ArrowRight className="w-12 h-12 text-blue-600" />
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl shadow-2xl text-white min-w-[280px]">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">오늘의 학습 계획</p>
                    <p className="text-sm text-blue-100">3개 에이전트 합의 완료</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-8 text-lg leading-relaxed">
              어제의 학습 결과와 아이의 상태를 분석해
              <br className="hidden md:block" />
              <span className="font-bold text-blue-700">오늘 가장 필요한 학습 계획을 자동으로 만듭니다</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - 강화 */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 py-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-10">
            <img
              src="/introduce/introduce_echo_and_parrot.png"
              alt="꼬마선장 에코"
              className="w-64 mx-auto mb-8 drop-shadow-2xl"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            우리 아이를 위한 특별한 여정,
            <br className="hidden sm:block" />
            Captain Echo와 함께 시작하세요
          </h2>

          <p className="text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            투명한 학습 과정, 게임 같은 재미, 실시간 모니터링까지.
            <br className="hidden sm:block" />
            부모님이 원하시던 모든 것이 여기 있습니다.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-white text-blue-600 font-bold px-14 py-6 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-xl hover:scale-105 text-xl group mb-8"
          >
            지금 무료로 시작하기
            <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </Link>

          <div className="flex items-center justify-center gap-8 text-blue-100 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>회원가입 후 바로 사용</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>신용카드 필요 없음</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>언제든 무료</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <img
                src="/nav/logo.png"
                alt="꼬마선장 에코"
                className="h-12 mb-6 opacity-90"
              />
              <p className="text-blue-300 leading-relaxed">
                난독증 아동을 위한 AI 기반 맞춤형 학습 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">서비스</h4>
              <ul className="space-y-3">
                <li><Link to="/introduction" className="hover:text-white transition-colors">서비스 소개</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">시작하기</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">기술</h4>
              <p className="text-blue-300 text-sm leading-relaxed">
                CrewAI Multi-Agent System으로 아이만을 위한 학습 계획을 만듭니다
              </p>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center">
            <p className="text-sm text-blue-300">
              © 2025 Captain Echo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
