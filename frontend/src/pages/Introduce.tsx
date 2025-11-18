import { Link } from 'react-router-dom';
import BeforeNavbar from '../components/BeforeLoginNavbar.tsx';
import BeforeFooter from '../components/BeforeLoginFooter.tsx';
import {
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  FileText,
  Mic,
  Brain,
  CheckCircle,
  BarChart3,
  Calendar,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  Gamepad,
  Clock,
  Star,
} from 'lucide-react';
import { useState } from 'react';

const Introduction = () => {
  {/* FAQ 열고 접고 하는 기능 부여하는 곳 */}
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  {/* 모험 설명 내용 들어가는 곳 */}
  const adventures = [
    {
      id: 1,
      name: '자모맞추기',
      description: '먼저 자모음과 친해져보자. 힌트에 맞는 음소를 찾아보세요.',
      icon: Sparkles, // 이 아이콘은 이제 사용되지 않습니다.
      color: 'from-purple-500 to-pink-500', // 이 색상값도 사용되지 않습니다.
      example: '예: "ㄱ-?" → "ㅏ"',
    },
    {
      id: 2,
      name: '빈 음소 찾기',
      description: '그림을 보고 빈 자리에 들어갈 음소를 찾아보세요.',
      icon: LinkIcon,
      color: 'from-blue-500 to-cyan-500',
      example: '예: "ㄱ-ㅏ" → "가"',
    },
    {
      id: 3,
      name: '단어 맞히기',
      description: '그림을 보고 어울리는 단어를 찾아보세요',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      example: '예: "가방" 그림을 보고 "가방" 단어 찾기',
    },
    {
      id: 4,
      name: '단어 읽기',
      description: '단어를 읽는 탐험! 다양한 단어를 정확하게 읽어보세요.',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      example: '예: "강아지"를 정확하게 읽기',
    },
  ];

  {/* 학습 프로레스 내용 들어가는 곳 */}
  const learningFlow = [
    { step: 'TTS 문제 제시', icon: Mic, description: 'AI 음성으로 문제 들려주기' },
    { step: '음성 녹음', icon: Mic, description: '아이가 답변 말하기' },
    { step: 'STT 인식', icon: Brain, description: 'AI가 음성을 텍스트로 변환' },
    { step: '정답 검증', icon: CheckCircle, description: '자동으로 정답 확인' },
    { step: '피드백', icon: Star, description: '성공/실패 애니메이션' },
    { step: '진행도 저장', icon: BarChart3, description: '학습 데이터 자동 저장' },
  ];

  {/* 부모 대시보드 내용 들어가는 곳 */}
  const dashboardFeatures = [
    {
      title: '자녀별 학습 진도',
      icon: TrendingUp,
      description: '모험별 완료율과 성취도를 한눈에 확인하세요',
    },
    {
      title: '약점 영역 시각화',
      icon: BarChart3,
      description: '차트로 보는 우리 아이의 강점과 약점 분석',
    },
    {
      title: '세션별 분석',
      icon: Calendar,
      description: '정답률, 소요 시간 등 상세한 학습 기록',
    },
    {
      title: 'AI 주간 리포트',
      icon: FileText,
      description: 'AI가 생성하는 맞춤형 학습 분석 보고서',
    },
  ];

  {/* 자주 묻는 질문 내용 들어가는 곳 */}
  const faqs = [
    {
      question: '난독증이 무엇인가요?',
      answer:
        '난독증은 지능이나 시력에 문제가 없음에도 불구하고 글자를 읽거나 쓰는 데 어려움을 겪는 학습 장애입니다. 꼬마선장 에코는 음소 인식 훈련을 통해 난독증 아동의 읽기 능력 향상을 돕습니다.',
    },
    {
      question: '하루에 얼마나 학습하면 되나요?',
      answer:
        'AI 에이전트가 아이의 상태, 학습 진도, 부모님의 목표를 종합하여 매일 최적의 학습 계획을 제안합니다. 일반적으로 하루 15-30분 정도가 권장됩니다만, 아이가 학습을 어려워한다면 천천히 완료하는 것에 의의를 두고 진행해주셔도 괜찮습니다.',
    },
    {
      question: 'A2A 시스템이란 무엇인가요?',
      answer:
        '3개의 AI 에이전트(학업, 정서, 부모)가 서로 협의하여 아이에게 가장 적합한 학습 계획을 만드는 시스템입니다. 마치 여러 전문가가 상담하는 것처럼 균형 잡힌 교육을 제공합니다.',
    },
    {
      question: '학습 데이터는 안전한가요?',
      answer:
        '모든 학습 데이터는 외부의 어떤 사람도 접근할 수 없으며 오직 부모님만 접근할 수 있습니다. 저희 서비스는 개인정보 보호를 최우선으로 합니다.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-cyan-500">
      {/* 상단바 */}
      <BeforeNavbar />

      {/* 소개 페이지 요약 설명 섹터 */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 font-peach drop-shadow-lg">
            꼬마선장 에코 서비스 소개
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            게임처럼 즐겁게, AI가 맞춤형으로 설계하는
            <br />
            우리 아이만의 난독증 극복 여정
          </p>

          {/* 뱃지 부분 */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Gamepad className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                게이미피케이션
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">
                짧고 꾸준하게
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 모험 소개 섹터 */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-peach">
              4가지 모험으로 배우는 읽기
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              각 모험은 난독증 극복에 필수적인 음소 인식 능력을 단계별로
              향상시킵니다
            </p>
          </div>

          {/* 모험 소개 카드 폼펙터 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {adventures.map((adventure) => {
              return (
                <div
                  key={adventure.id}
                  className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl transition-all duration-300 group"
                >
                  {/* 모범 장면 소개 이미지 들어가는 곳 */}
                  <div className="relative w-full aspect-[8/5] rounded-2xl overflow-hidden mb-6 transition-transform duration-300">
                    <img
                      src={`/introduce/card${adventure.id}.png`}
                      alt={adventure.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 모험 번호 */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 font-peach">
                    모험 {adventure.id}: {adventure.name}
                  </h3>

                  {/* 모험 설명 요약 */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {adventure.description}
                  </p>

                  {/* 모험 설명 */}
                  <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      {adventure.example}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 학습 프로세스 소개 섹터 */}
      <section className="relative z-10 py-20 px-4 bg-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-peach">
              학습 흐름
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              AI 기술로 완전 자동화된 학습 프로세스
            </p>
          </div>
          {/* 학습 프로세스 카드 포멧 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningFlow.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* 아이콘 들어가는 곳 */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      {/* 단계 들어가는 곳. 반복될 떄마다 자동으로 +1씩 증가 */}
                      <div className="text-sm font-bold text-blue-600 mb-1">
                        STEP {index + 1}
                      </div>
                      {/* 스탭별 요약 */}
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        {item.step}
                      </h4>
                      {/* 스텝 별 설명 */}
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 부모 대시보드 소개 섹터  */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-peach">
              부모 대시보드
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              우리 아이의 학습 과정을 투명하게 확인하고
              <br />
              데이터 기반으로 성장을 지켜보세요
            </p>
          </div>
          {/* 부모 대시보드 소개의 카드 포멧을 구성하는 코드 */}
          <div className="grid md:grid-cols-2 gap-8">
            {dashboardFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl transition-all duration-300 "
                >
                  <div className="flex items-start gap-6">
                    {/* 이미지 들어가는 곳 */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      {/* 소개 요약 들어가는 곳 */}
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 font-peach">
                        {feature.title}
                      </h3>
                      {/* 설명 들어가는 곳 */}
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 대시보드 미리보기 */}
          <div className="mt-12 bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <img src="/introduce/dashboard.png" alt="대시보드 미리보기" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 자주 묻는 질문(FAQ) 섹션 */}
      <section className="relative z-10 py-20 px-4 bg-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-peach">
              자주 묻는 질문
            </h2>
            <p className="text-xl text-white/90">
              궁금하신 점이 있으신가요?
            </p>
          </div>
          {/* FAQ 포멧을 구성하는 코드. */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between transition-colors"
                >
                  {/* FAQ 질문이 들어가는 장소 */}
                  <h3 className="text-lg font-bold text-gray-800 text-left pr-4">
                    {faq.question}
                  </h3>
                  {/* 열기 닫기 버튼 */}
                  <ChevronDown
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {/* FAQ 답이 들어가는 장소 */}
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 소개 페이지 마지막 사용자 가입 유도 섹터 */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-peach">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              우리 아이의 난독증 극복 여정,
              <br />
              꼬마선장 에코와 함께라면 가능합니다
            </p>
            {/* 링크 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xl font-bold px-10 py-5 rounded-full shadow-xl transition-all duration-300"
              >
                지금 시작하기
                <ArrowRight className="w-6 h-6 transition-transform" />
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 bg-white text-blue-600 text-xl font-bold px-10 py-5 rounded-full shadow-lg transition-all duration-300 border-2 border-blue-600"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <BeforeFooter />
    </div>
  );
};

export default Introduction;