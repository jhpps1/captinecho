import React, { useState, type UIEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

// 스크롤을 생성하기 위한 임시 Lorem Ipsum 텍스트
const loremIpsum = (
  <>
    <p className="mb-2">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vulputate
      mattis eros eu dignissim. Sed tempus tristique nunc, commodo vehicula est
      accumsan et. Curabitur ac purus quis leo accumsan maximus ac sed ligula.
      Maecenas quis lorem est. Suspendisse potenti. Nam ac purus et nisi
      venenatis iaculis. Etiam bibendum vestibulum condimentum.
    </p>
    <p className="mb-2">
      Nulla nisl est, pretium vitae porta eget, ultrices at orci. Cras rhoncus
      mi efficitur, porttitor dui nec, eleifend neque. Interdum et malesuada
      fames ac ante ipsum primis in faucibus. Fusce blandit lacus eu est
      tristique, ac condimentum lorem dapibus. Quisque tristique libero nec
      ullamcorper commodo. Nunc ac sapien ut turpis posuere mattis a vel leo.
    </p>
    <p className="mb-2">
      Suspendisse semper tellus ac libero ornare tincidunt. Nullam commodo sit
      amet ante eu auctor. Pellentesque habitant morbi tristique senectus et
      netus et malesuada fames ac turpis egestas. Vivamus in sem quis elit
      porttitor consequat.
    </p>
    <p className="mb-2">
      Donec non urna ac dui finibus finibus. Integer nec lacinia justo. Proin
      id elit ac orci maximus laoreet. Aliquam erat volutpat. Sed interdum,
      nisi eu varius consectetur, quam magna pretium orci, non luctus dui
      massa vitae risus.
    </p>
    <p className="font-bold">
      [약관의 마지막 부분입니다. 여기까지 읽으셔야 동의가 가능합니다.]
    </p>
  </>
);

const GuardianConsent: React.FC = () => {
  const navigate = useNavigate();

  // 1. 각 약관의 스크롤이 끝까지 도달했는지 여부
  const [isScrolledLeft, setIsScrolledLeft] = useState(false);
  const [isScrolledRight, setIsScrolledRight] = useState(false);

  // 2. 각 약관에 동의했는지 여부
  const [isAgreedLeft, setIsAgreedLeft] = useState(false);
  const [isAgreedRight, setIsAgreedRight] = useState(false);

  /**
   * 스크롤 이벤트를 처리하는 핸들러.
   * 스크롤이 거의 끝에 도달했는지 확인합니다. (소수점 오차 감안)
   */
  const handleScroll = (
    e: UIEvent<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // scrollHeight - scrollTop - clientHeight가 1 미만이면 끝에 도달한 것으로 간주
    if (scrollHeight - scrollTop - clientHeight < 1) {
      setter(true);
    }
  };

  // '확인' 버튼 활성화 조건
  const isConfirmButtonEnabled = isAgreedLeft && isAgreedRight;

  // '취소' 버튼 클릭 시
  const handleCancel = () => {
    navigate('/');
  };

  // '확인' 버튼 클릭 시
  const handleConfirm = async () => {
    if (!isConfirmButtonEnabled) {
      return;
    }

    try {
      // 백엔드 API 호출 (약관 동의 상태 업데이트)
      const accessToken = Cookies.get('accessToken');

      if (!accessToken) {
        console.error('❌ AccessToken이 없습니다. 로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      await axios.patch(
        '/api/protector/terms',
        { termsAgreed: true },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log('✅ 약관 동의 완료');
      navigate('/select-profile');
    } catch (error) {
      console.error('❌ 약관 동의 처리 실패:', error);
      alert('약관 동의 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/introduce/background.png')" }}
    >
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-2xl m-4">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
          보호자가 확인해주세요!
        </h1>

        {/* 약관 동의 섹션 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 왼쪽: 개인정보 수집 및 활용 동의서 */}
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              개인정보 수집 및 활용 동의서
            </h2>
            <div
              className="h-64 overflow-y-auto rounded border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700"
              onScroll={(e) => !isScrolledLeft && handleScroll(e, setIsScrolledLeft)}
            >
              {loremIpsum}
            </div>
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={isAgreedLeft}
                  onChange={(e) => setIsAgreedLeft(e.target.checked)}
                  disabled={!isScrolledLeft} // 스크롤이 끝나야 활성화
                />
                <span
                  className={
                    isScrolledLeft ? 'text-gray-900' : 'text-gray-400'
                  }
                >
                  위 내용에 동의합니다.
                </span>
              </label>
            </div>
          </div>

          {/* 오른쪽: 제 3자 데이터 제공에 대한 약관 */}
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              제 3자 데이터 제공에 대한 약관
            </h2>
            <div
              className="h-64 overflow-y-auto rounded border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700"
              onScroll={(e) => !isScrolledRight && handleScroll(e, setIsScrolledRight)}
            >
              {loremIpsum}
            </div>
            <div className="mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 h-5 w-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={isAgreedRight}
                  onChange={(e) => setIsAgreedRight(e.target.checked)}
                  disabled={!isScrolledRight} // 스크롤이 끝나야 활성화
                />
                <span
                  className={
                    isScrolledRight ? 'text-gray-900' : 'text-gray-400'
                  }
                >
                  위 내용에 동의합니다.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleCancel}
            className="rounded-md bg-gray-200 px-10 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmButtonEnabled}
            className="rounded-md bg-blue-600 px-10 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuardianConsent;