import React, { useState, type UIEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const NewUserTerms: React.FC = () => {
  const navigate = useNavigate();

  // 각 약관의 스크롤이 끝까지 도달했는지 여부
  const [isScrolledPrivacy, setIsScrolledPrivacy] = useState(false);
  const [isScrolledThirdParty, setIsScrolledThirdParty] = useState(false);

  // 각 약관에 동의했는지 여부
  const [isAgreedPrivacy, setIsAgreedPrivacy] = useState(false);
  const [isAgreedThirdParty, setIsAgreedThirdParty] = useState(false);

  /**
   * 스크롤 이벤트 핸들러 - 끝까지 스크롤했는지 확인
   */
  const handleScroll = (
    e: UIEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 1) {
      setter(true);
    }
  };

  // 확인 버튼 활성화 조건
  const isConfirmButtonEnabled = isAgreedPrivacy && isAgreedThirdParty;

  // 취소 버튼 클릭
  const handleCancel = () => {
    navigate('/');
  };

  // 확인 버튼 클릭
  const handleConfirm = async () => {
    if (!isConfirmButtonEnabled) {
      return;
    }

    try {
      const accessToken = Cookies.get('accessToken');
      console.log('🔑 AccessToken 확인:', accessToken ? '있음' : '없음');

      if (!accessToken) {
        console.error('❌ AccessToken이 없습니다. 로그인이 필요합니다.');
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        return;
      }

      console.log('📤 약관 동의 요청 전송...');
      const response = await axios.patch(
        '/api/protector/terms',
        { termsAgreed: true },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('✅ 약관 동의 완료:', response.data);
      navigate('/select-profile');
    } catch (error: any) {
      console.error('❌ 약관 동의 처리 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else {
        alert(`약관 동의 처리에 실패했습니다.\n에러: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4"
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white p-8 shadow-2xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-block rounded-full bg-blue-100 p-3">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            서비스 이용약관 동의
          </h1>
          <p className="text-gray-600">
            꼬마선장 에코 서비스 이용을 위해 약관을 확인하고 동의해주세요
          </p>
        </div>

        {/* 약관 동의 섹션 */}
        <div className="space-y-6">
          {/* 개인정보 수집 및 이용 동의 */}
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-6 transition-all hover:border-blue-300">
            <h2 className="mb-4 flex items-center text-xl font-bold text-gray-800">
              <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                1
              </span>
              개인정보 수집 및 이용 동의 (필수)
            </h2>
            <div
              className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 text-sm leading-relaxed text-gray-700 shadow-inner"
              onScroll={(e) => !isScrolledPrivacy && handleScroll(e, setIsScrolledPrivacy)}
            >
              <div className="space-y-4">
                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">1. 수집하는 개인정보 항목</h3>
                  <p className="mb-2">
                    꼬마선장 에코는 서비스 제공을 위해 다음의 개인정보를 수집합니다:
                  </p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li><strong>보호자 정보:</strong> 이름, 이메일 주소, Google 계정 정보</li>
                    <li><strong>학생 정보:</strong> 이름, 생년월일, 학년, 프로필 사진(선택)</li>
                    <li><strong>학습 데이터:</strong> 학습 진도, 정답률, 음성 녹음 파일, 오답 패턴</li>
                    <li><strong>서비스 이용 기록:</strong> 접속 로그, 쿠키, 서비스 이용 기록</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">2. 개인정보의 수집 및 이용 목적</h3>
                  <ul className="ml-5 list-disc space-y-1">
                    <li><strong>회원 관리:</strong> 회원 식별, 본인 확인, 부정 이용 방지</li>
                    <li><strong>서비스 제공:</strong> 맞춤형 학습 콘텐츠 제공, 학습 진도 관리</li>
                    <li><strong>AI 학습 분석:</strong> 난독증 개선을 위한 AI 기반 맞춤 학습 계획 수립</li>
                    <li><strong>보호자 대시보드:</strong> 자녀의 학습 현황 및 분석 리포트 제공</li>
                    <li><strong>서비스 개선:</strong> 통계 분석, 서비스 품질 향상</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">3. 개인정보의 보유 및 이용 기간</h3>
                  <p className="mb-2">
                    회원 탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우에는 해당 기간 동안 보관합니다:
                  </p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
                    <li>대금결제 및 재화 공급 기록: 5년 (전자상거래법)</li>
                    <li>소비자 불만 또는 분쟁처리 기록: 3년 (전자상거래법)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">4. 개인정보의 파기 절차 및 방법</h3>
                  <p className="mb-2">
                    회원 탈퇴 시 개인정보는 즉시 파기되며, 전자적 파일은 복구 불가능한 방법으로 영구 삭제하고,
                    종이 문서는 분쇄하거나 소각합니다.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">5. 개인정보 보호책임자</h3>
                  <p>
                    개인정보 관련 문의사항은 아래 연락처로 문의해주시기 바랍니다:
                  </p>
                  <ul className="ml-5 mt-2 space-y-1">
                    <li><strong>책임자:</strong> 개인정보보호팀</li>
                    <li><strong>이메일:</strong> privacy@captainecho.com</li>
                  </ul>
                </section>

                <section className="rounded-lg bg-blue-50 p-3">
                  <p className="font-bold text-blue-900">
                    ※ 귀하는 위와 같은 개인정보 수집 및 이용에 동의하지 않을 권리가 있으나,
                    동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.
                  </p>
                </section>
              </div>
            </div>
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="mr-3 h-6 w-6 rounded border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                checked={isAgreedPrivacy}
                onChange={(e) => setIsAgreedPrivacy(e.target.checked)}
                disabled={!isScrolledPrivacy}
              />
              <span
                className={`text-base font-medium ${
                  isScrolledPrivacy ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                개인정보 수집 및 이용에 동의합니다
                {!isScrolledPrivacy && (
                  <span className="ml-2 text-sm text-orange-600">
                    (약관을 끝까지 읽어주세요)
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* 제3자 정보 제공 동의 */}
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-6 transition-all hover:border-blue-300">
            <h2 className="mb-4 flex items-center text-xl font-bold text-gray-800">
              <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                2
              </span>
              제3자 정보 제공 동의 (필수)
            </h2>
            <div
              className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 text-sm leading-relaxed text-gray-700 shadow-inner"
              onScroll={(e) => !isScrolledThirdParty && handleScroll(e, setIsScrolledThirdParty)}
            >
              <div className="space-y-4">
                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">1. 제공받는 자</h3>
                  <ul className="ml-5 list-disc space-y-1">
                    <li><strong>OpenAI (ChatGPT API 제공사):</strong> AI 기반 학습 분석 및 콘텐츠 생성</li>
                    <li><strong>Google Cloud Platform:</strong> 음성 인식(STT) 및 음성 합성(TTS) 서비스</li>
                    <li><strong>AWS (Amazon Web Services):</strong> 데이터 저장 및 서버 호스팅</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">2. 제공하는 개인정보 항목</h3>
                  <ul className="ml-5 list-disc space-y-1">
                    <li><strong>OpenAI:</strong> 학습 데이터, 오답 패턴, 학습 이력 (개인 식별 정보 제외)</li>
                    <li><strong>Google Cloud:</strong> 음성 녹음 파일 (학습용)</li>
                    <li><strong>AWS:</strong> 회원 정보, 학습 데이터, 파일 저장</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">3. 제공 목적</h3>
                  <ul className="ml-5 list-disc space-y-1">
                    <li><strong>AI 분석:</strong> 난독증 개선을 위한 맞춤형 학습 계획 수립</li>
                    <li><strong>음성 처리:</strong> 발음 분석 및 피드백 제공</li>
                    <li><strong>서비스 운영:</strong> 안정적인 서비스 제공 및 데이터 백업</li>
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">4. 보유 및 이용 기간</h3>
                  <p>
                    제공 목적 달성 시까지 또는 회원 탈퇴 시까지 보유하며,
                    목적 달성 후 또는 탈퇴 시 즉시 파기합니다.
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 font-semibold text-gray-900">5. 개인정보 보호 조치</h3>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>모든 데이터 전송 시 암호화(SSL/TLS) 적용</li>
                    <li>개인 식별 정보는 최소화하여 전송</li>
                    <li>제3자는 GDPR, CCPA 등 국제 개인정보보호 기준 준수</li>
                  </ul>
                </section>

                <section className="rounded-lg bg-blue-50 p-3">
                  <p className="font-bold text-blue-900">
                    ※ 귀하는 위와 같은 제3자 정보 제공에 동의하지 않을 권리가 있으나,
                    동의하지 않을 경우 AI 기반 학습 서비스 이용이 제한될 수 있습니다.
                  </p>
                </section>
              </div>
            </div>
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="mr-3 h-6 w-6 rounded border-gray-400 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                checked={isAgreedThirdParty}
                onChange={(e) => setIsAgreedThirdParty(e.target.checked)}
                disabled={!isScrolledThirdParty}
              />
              <span
                className={`text-base font-medium ${
                  isScrolledThirdParty ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                제3자 정보 제공에 동의합니다
                {!isScrolledThirdParty && (
                  <span className="ml-2 text-sm text-orange-600">
                    (약관을 끝까지 읽어주세요)
                  </span>
                )}
              </span>
            </label>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleCancel}
            className="rounded-lg bg-gray-200 px-12 py-3 font-semibold text-gray-800 transition hover:bg-gray-300 hover:shadow-md"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmButtonEnabled}
            className={`rounded-lg px-12 py-3 font-semibold text-white transition ${
              isConfirmButtonEnabled
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                : 'cursor-not-allowed bg-gray-300'
            }`}
          >
            동의하고 계속하기
          </button>
        </div>

        {/* 안내 메시지 */}
        {!isConfirmButtonEnabled && (
          <p className="mt-4 text-center text-sm text-gray-500">
            모든 약관을 끝까지 읽고 동의해주세요
          </p>
        )}
      </div>
    </div>
  );
};

export default NewUserTerms;
