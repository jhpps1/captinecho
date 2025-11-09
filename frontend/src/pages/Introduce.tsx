import { Link } from 'react-router-dom';
import BeforeNavbar from '../components/BeforeLoginNavbar.tsx';
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
  Shield,
  Clock
} from 'lucide-react';
import { useState } from 'react';

const Introduction = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const adventures = [
    {
      id: 1,
      name: '음소 분절',
      description: '소리를 나누는 탐험! 단어를 자음과 모음으로 분리해보세요.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      example: '예: "강아지" → "ㄱ-ㅏ-ㅇ-ㅏ-ㅈ-ㅣ"'
    },
    {
      id: 2,
      name: '음소 합성',
      description: '소리를 모으는 탐험! 자음과 모음을 합쳐 단어를 만들어보세요.',
      icon: LinkIcon,
      color: 'from-blue-500 to-cyan-500',
      example: '예: "ㄱ-ㅏ" → "가"'
    },
    {
      id: 3,
      name: '단어 읽기',
      description: '단어를 읽는 탐험! 다양한 단어를 정확하게 읽어보세요.',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      example: '예: "강아지"를 정확하게 읽기'
    },
    {
      id: 4,
      name: '문장 읽기',
      description: '문장을 읽는 탐험! 긴 문장을 유창하게 읽어보세요.',
      icon: BookOpen,
      color: 'from-orange-500 to-red-500',
      example: '예: "귀여운 강아지가 뛰어놀아요"'
    }
  ];

  const learningFlow = [
    { step: 'TTS 문제 제시', icon: Mic, description: 'AI 음성으로 문제 들려주기' },
    { step: '음성 녹음', icon: Mic, description: '아이가 답변 말하기' },
    { step: 'STT 인식', icon: Brain, description: 'AI가 음성을 텍스트로 변환' },
    { step: '정답 검증', icon: CheckCircle, description: '자동으로 정답 확인' },
    { step: '피드백', icon: Star, description: '성공/실패 애니메이션' },
    { step: '진행도 저장', icon: BarChart3, description: '학습 데이터 자동 저장' }
  ];

  const dashboardFeatures = [
    {
      title: '자녀별 학습 진도',
      icon: TrendingUp,
      description: '모험별 완료율과 성취도를 한눈에 확인하세요'
    },
    {
      title: '약점 영역 시각화',
      icon: BarChart3,
      description: '차트로 보는 우리 아이의 강점과 약점 분석'
    },
    {
      title: '세션별 분석',
      icon: Calendar,
      description: '정답률, 소요 시간 등 상세한 학습 기록'
    },
    {
      title: 'AI 주간 리포트',
      icon: FileText,
      description: 'AI가 생성하는 맞춤형 학습 분석 보고서'
    }
  ];

  const faqs = [
    {
      question: '난독증이 무엇인가요?',
      answer: '난독증은 지능이나 시력에 문제가 없음에도 불구하고 글자를 읽거나 쓰는 데 어려움을 겪는 학습 장애입니다. Captain Echo는 음소 인식 훈련을 통해 난독증 아동의 읽기 능력 향상을 돕습니다.'
    },
    {
      question: '하루에 얼마나 학습하면 되나요?',
      answer: 'AI 에이전트가 아이의 상태, 학습 진도, 부모님의 목표를 종합하여 매일 최적의 학습 계획을 제안합니다. 일반적으로 하루 15-30분 정도가 권장됩니다.'
    },
    {
      question: 'A2A 시스템이란 무엇인가요?',
      answer: '3개의 AI 에이전트(학업, 정서, 부모)가 서로 협의하여 아이에게 가장 적합한 학습 계획을 만드는 시스템입니다. 마치 여러 전문가가 상담하는 것처럼 균형 잡힌 교육을 제공합니다.'
    },
    {
      question: '학습 데이터는 안전한가요?',
      answer: '모든 학습 데이터는 암호화되어 안전하게 저장되며, 부모님만 접근할 수 있습니다. 개인정보 보호를 최우선으로 합니다.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-cyan-500">
      <BeforeNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 font-peach drop-shadow-lg">
            Captain Echo 서비스 둘러보기
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            게임처럼 즐겁게, AI가 맞춤형으로 설계하는<br />
            우리 아이만의 난독증 극복 여정
          </p>

          {/* Trust Badges */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">전문가 검증</span>
            </div>
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">하루 15분</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Adventures Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-peach">
              4가지 모험으로 배우는 읽기
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              각 모험은 난독증 극복에 필수적인 음소 인식 능력을 단계별로 향상시킵니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {adventures.map((adventure) => {
              const Icon = adventure.icon;
              return (
                <div
                  key={adventure.id}
                  className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${adventure.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-3 font-peach">
                    모험 {adventure.id}: {adventure.name}
                  </h3>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {adventure.description}
                  </p>

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

      {/* Learning Flow Section */}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningFlow.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-blue-600 mb-1">STEP {index + 1}</div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{item.step}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Parent Dashboard Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-peach">
              부모 대시보드
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              우리 아이의 학습 과정을 투명하게 확인하고<br />
              데이터 기반으로 성장을 지켜보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {dashboardFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 font-peach">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dashboard Preview Image Placeholder */}
          <div className="mt-12 bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-semibold">대시보드 화면 미리보기</p>
                <p className="text-gray-400 text-sm mt-2">실시간 학습 데이터 시각화</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between hover:bg-blue-50 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-800 text-left pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

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

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/95 backdrop-blur-sm p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-peach">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              우리 아이의 난독증 극복 여정,<br />
              Captain Echo와 함께라면 가능합니다
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xl font-bold px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                지금 시작하기
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 bg-white text-blue-600 text-xl font-bold px-10 py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-blue-600"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
};

export default Introduction;
