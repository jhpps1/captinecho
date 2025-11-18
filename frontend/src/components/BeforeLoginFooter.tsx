import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-blue-200 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* 로고 및 설명 */}
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

          {/* 서비스 링크 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">서비스</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/introduction"
                  className="hover:text-white transition-colors"
                >
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  시작하기
                </Link>
              </li>
            </ul>
          </div>

          {/* 기술 설명 */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">기술</h4>
            <p className="text-blue-300 text-sm leading-relaxed">
              CrewAI Multi-Agent System으로 아이만을 위한 학습 계획을 만듭니다
            </p>
          </div>
        </div>

        {/* 카피라이트 */}
        <div className="border-t border-blue-800 pt-8 text-center">
          <p className="text-sm text-blue-300">
            © 2025 Captain Echo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;