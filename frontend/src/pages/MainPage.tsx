import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Brain,
  CheckCircle,
  ArrowRight,
  Heart,
  Eye,
  BookOpen,
  Star,
  TrendingUp,
  Shield,
} from 'lucide-react';
import BeforeNavbar from '../components/BeforeLoginNavbar.tsx';
import BeforeFooter from '../components/BeforeLoginFooter.tsx'

const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar 컴포넌트 */}
      <BeforeNavbar />

      {/* 헤더 이미지 섹터 */}
      <header className="py-24 md:py-40 px-6 relative bg-[url('/mainpage/mainimage.png')] bg-cover bg-center">
        {/* 가독성을 위한 어두운 오버레이 추가 */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* 꼬마선장 에코 소개 요약 뱃지 */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {/* AI 기반 맞춤 학습 소개 뱃지 */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-700">
                AI 기반 맞춤 학습
              </span>
            </div>
            {/* 난독증 전문가와 기획한 서비스 소개 뱃지 */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                난독증 전문가와 기획한 서비스
              </span>
            </div>
          </div>

          <div className="text-center max-w-5xl mx-auto">
            {/* 헤더 제목 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8 drop-shadow-lg">
              천천히 한걸음 내딛을
              <br />
              <span className="text-yellow-300">
                난독증 학생을 위한 학습 서비스
              </span>
            </h1>
            {/* 헤더 설명 */}
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-12 font-medium drop-shadow-md">
              개인화된 AI 맞춤형 커리큘럼 제공으로
              <br />
              꼬마선장 에코는 난독증 학생들의 미래를 위하여 함께하겠습니다.
            </p>
            {/* 각종 연결 링크 버튼들 */}
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
                서비스 소개
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 핵심 가치 소개 섹터 */}
      <section className="py-20 px-6 bg-white/95">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* 핵심 가치 소개 제목*/}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              꼬마선장 에코가 특별한 이유
            </h2>
            {/* 핵심가치 소개 설명 */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              단순한 학습 앱이 아닙니다.
              <br />
              부모님과 함께하는 난독증 학생을 위한 길잡이입니다.
            </p>
          </div>

          {/* 소개 카드들 */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* 카드 1: 똑똑하고 투명한 AI */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hovxler:shadow-2 transition-all duration-300 border-2 border-transparent">
              <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden mb-6 transition-transform duration-300">
                {/* 이미지 */}
                <img
                  src="/mainpage/card1.png"
                  alt="똑똑하고 투명한 AI"
                  className="w-full h-full object-cover"
                />
                {/* 하단 페이드아웃 효과 */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"></div>
              </div>
              {/* 소개 제목 */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                똑똑하고 투명한 AI
              </h3>
              {/* 소개 설명 */}
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                단순한 AI활용 서비스가 아닌, AI가 왜 이 문제를 선택했는지, 어떤
                계획으로 진행되는지 모두 확인할 수 있습니다.
              </p>
              {/* 체크 표시 소개 */}
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

            {/* 카드 2: 개인화된 맞춤 커리큘럼 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg transition-all duration-300 border-2 border-transparent">
              <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden mb-6 transition-transform duration-300">
                {/* 이미지 */}
                <img
                  src="/mainpage/card2.png"
                  alt="개인화된 맞춤 커리큘럼"
                  className="w-full h-full object-cover"
                />
                {/* 하단 페이드아웃 효과 */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"></div>
              </div>
              {/* 소개 제목 */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                개인화된 맞춤 커리큘럼
              </h3>
              {/* 소개 설명 */}
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                3개의 AI 에이전트가 매일 협의하여 우리 아이만을 위한 학습 계획을
                생성합니다.
              </p>
              {/* 체크 표시 소개 */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">학생 수준별 난이도 조절</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    AI Agent를 활용한 학습지원
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">부모님 학습 목표 반영</span>
                </li>
              </ul>
            </div>

            {/* 카드 3 : 게이미피케이션 학습 */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg transition-all duration-300 border-2 border-transparent">
              {/* 이미지 공간 */}
              <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden mb-6 transition-transform duration-300">
                <img
                  src="/mainpage/card3.png"
                  alt="게이미피케이션 학습"
                  className="w-full h-full object-cover"
                />
                {/* 하단 페이드아웃 효과 */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent"></div>
              </div>
              {/* 소개 제목 */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                게이미피케이션 학습
              </h3>
              {/* 소개 설명 */}
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                종이책 학습의 지루함에서 벗어날 수 있는 체계적이고 재미있는
                학습을 지향합니다.
              </p>
              {/* 체크 표시 소개 */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    단계별 계층화된 학습 지원
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    학생 관심사 반영 문제 출제
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    게임적 요소를 결합한 몰입형 학습
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* A2A 협의 시스템 소개 섹터 */}
      <section className="py-24 px-6 bg-gradient-to-b from-white/95 to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            {/* 차별점 뱃지 */}
            <div className="inline-block bg-purple-100 text-purple-700 px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-md">
              꼬마선장 에코의 차별점
            </div>
            {/* 소개 제목 */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              A2A (Agent-to-Agent) 협의 시스템
            </h2>
            {/* 소개 설명 */}
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              마치 오프라인 상담에서 전문가들이 모여 논의하듯,
              <br className="hidden md:block" />
              <span className="font-semibold text-blue-700">
                3명의 AI 에이전트가 학생의 상태, 진도, 학습 결과 등을 분석하여,
                우리 아이만을 위한 학습 계획을 세웁니다.
              </span>
            </p>
          </div>

          {/* 3개의 AI 에이전트 소개 */}
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {/* 학업 에이전트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-xl border-2 border-blue-200 transition-all">
                {/* 아이콘 */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                </div>
                {/* 소개 제목 */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  학업 에이전트
                </h3>
                {/* 예시 */}
                <div className="bg-blue-50 p-5 rounded-2xl mb-5">
                  <p className="text-gray-700 text-center italic leading-relaxed">
                    "이 자모를 집중적으로 연습하면 빠르게 향상될 거예요"
                  </p>
                </div>
                {/* 요약 소개 */}
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-700">
                  <TrendingUp className="w-5 h-5" />
                  <span>약점 분석 → 효과적인 학습</span>
                </div>
              </div>
            </div>

            {/* 정서 에이전트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-xl border-2 border-green-200 transition-all">
                {/* 아이콘 */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                {/* 소개 제목 */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  정서 에이전트
                </h3>
                {/* 예시 */}
                <div className="bg-green-50 p-5 rounded-2xl mb-5">
                  <p className="text-gray-700 text-center italic leading-relaxed">
                    "어제 어려워했으니 오늘은 자신감을 회복할 수 있는 문제를
                    주자"
                  </p>
                </div>
                {/* 요약 소개 */}
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-700">
                  <Heart className="w-5 h-5" />
                  <span>정서 안정 → 학습 동기 유지</span>
                </div>
              </div>
            </div>

            {/* 부모 에이전트 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative bg-white p-10 rounded-3xl shadow-xl border-2 border-purple-200 transition-all">
                <div className="flex justify-center mb-6">
                  {/* 아이콘 */}
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                {/* 소개 제목 */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  부모 에이전트
                </h3>
                {/* 예시 */}
                <div className="bg-purple-50 p-5 rounded-2xl mb-5">
                  <p className="text-gray-700 text-center italic leading-relaxed">
                    "부모님이 설정한 '약점 집중'을 반영해서 계획을 조정할게요"
                  </p>
                </div>
                {/* 요약 소개 */}
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-purple-700">
                  <Users className="w-5 h-5" />
                  <span>부모 목표 → 맞춤형 방향</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 협의 과정 시각화 */}
        <div className="bg-white p-12 rounded-3xl shadow-2xl border-2 border-blue-300">
          <h4 className="text-center text-2xl font-bold text-gray-900 mb-8">
            매일 아침 자동 회의
          </h4>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-6">
              {/* 학업 에이전트 아이콘 */}
              <div className="bg-blue-100 p-5 rounded-2xl shadow-md">
                <Brain className="w-10 h-10 text-blue-600" />
              </div>
              {/* 연결 */}
              <MessageSquare className="w-8 h-8 text-gray-400" />
              {/* 정서 에이전트 아이콘 */}
              <div className="bg-green-100 p-5 rounded-2xl shadow-md">
                <Heart className="w-10 h-10 text-green-600" />
              </div>
              {/* 연결 */}
              <MessageSquare className="w-8 h-8 text-gray-400" />
              {/* 부모 에이전트 아이콘 */}
              <div className="bg-purple-100 p-5 rounded-2xl shadow-md">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            {/* 결론 */}
            <div className="hidden md:block">
              <ArrowRight className="w-12 h-12 text-blue-600" />
            </div>
            {/* AI 에이전트 합의 완료 */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl shadow-2xl text-white min-w-[280px]">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">오늘의 학습 계획</p>
                  <p className="text-sm text-blue-100">
                    3개 에이전트 합의 완료
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8 text-lg leading-relaxed">
            어제의 학습 결과와 아이의 상태를 분석해
            <br className="hidden md:block" />
            <span className="font-bold text-blue-700">
              오늘 가장 필요한 학습 계획을 자동으로 만듭니다
            </span>
          </p>
        </div>
      </section>

      {/* 가입 유도 섹션 */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 py-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* 에코쿤 이미지 들어가는 곳 */}
          <div className="mb-10">
            <img
              src="/introduce/introduce_echo_and_parrot.png"
              alt="꼬마선장 에코"
              className="w-64 mx-auto mb-8 drop-shadow-2xl"
            />
          </div>

          {/* 대 제목 */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            우리 아이를 위한 특별한 여정,
            <br className="hidden sm:block" />
            꼬마선장 에코와 함께 시작하세요
          </h2>

          {/* 사이트 포부 들어가는 곳 */}
          <p className="text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            체계적인 학습 과정, 게임 같은 재미, 실시간 모니터링까지.
            <br className="hidden sm:block" />
            조금은 느릴뿐인 학생들의 훌륭한 길잡이가 되어드리겠습니다.
          </p>

          {/* 가입 링크 */}
          <Link
            to="/login"
            className="inline-flex items-center justify-center bg-white text-blue-600 font-bold px-14 py-6 rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-xl hover:scale-105 text-xl group mb-8"
          >
            지금 무료로 시작하기
            <ArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </Link>

          {/* 사용자 부담 줄게하기 */}
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
      <BeforeFooter />
    </div>
  );
};

export default MainPage;