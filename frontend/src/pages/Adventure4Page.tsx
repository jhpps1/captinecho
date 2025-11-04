import { useState, useEffect } from 'react';

// TODO: 실제 타입/데이터 구조는 이후에 연결
// 여기선 화면에 표시할 "단어"만 있다고 가정
interface SpeakProblem {
  id: number;
  word: string; // 예: "단 어"
  audioUrl: string;
}

// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';

// Components
import { TutorialOverlay } from '../components/adventure/TutorialOverlay';
import { TopActionsBar } from '../components/adventure/TopActionsBar';
import { TutorialBubble } from '../components/adventure/TutorialBubble';
import { FeedbackCharacter } from '../components/adventure/FeedbackCharacter';
import { WordCard } from '../components/adventure/WordCard';
import { MicrophoneButton } from '../components/adventure/MicrophoneButton';
import { DevTestButtons } from '../components/adventure/DevTestButtons'; // ⚠️ 개발용 - 이후 삭제 예정

const Adventure4Page = () => {
  // -------- 완료 상태 관리 --------
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // ---- 더미 문제 데이터 (말하기/따라 말하기 유형) ----
  const problems: SpeakProblem[] = [
    {
      id: 1,
      word: '테스트',
      audioUrl: '/audio/sample1.mp3',
    },
    {
      id: 2,
      word: '가 방',
      audioUrl: '/audio/sample2.mp3',
    },
  ];

  // 현재 문제 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];

  // 튜토리얼 상태
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // 녹음 중인지 상태 (마이크 버튼 UI용)
  const [isRecording, setIsRecording] = useState(false);

  // 시도 횟수 관리
  const [attemptCount, setAttemptCount] = useState(0);

  // 스피커 버튼 표시 여부 (3회 시도 후 힌트)
  const [showSpeakerButton, setShowSpeakerButton] = useState(false);

  // 백엔드 분석 중 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 발음 유사도 OK → 카드에 웨이브 이펙트
  // (아직은 가짜 상태: 정답이라고 판단되면 true로 set)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 피드백 표시 상태
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // 음성 helper (튜토리얼 음성 안내)
  const { playVoice, stopVoice } = useTutorialVoice();

  // 문제 전환 시 상태 초기화
  useEffect(() => {
    setAttemptCount(0);
    setShowSpeakerButton(false);
    setIsSpeaking(false);
  }, [currentIndex]);

  // ESC 누르면 튜토리얼 끄기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTutorialMode) {
        setIsTutorialMode(false);
        stopVoice();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialMode, stopVoice]);

  // 상단 물음표 버튼 눌렀을 때
  const handleTutorialClick = () => {
    const goingToTutorial = !isTutorialMode;
    setIsTutorialMode(goingToTutorial);

    if (goingToTutorial) {
      playVoice(
        'tutorial',
        '단어를 보고 똑같이 말해보세요!'
      );
    } else {
      stopVoice();
    }
  };

  // 🏆 다음 문제로 이동
  const moveToNextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 모든 문제 완료 (10개 기준)
      setIsAllCompleted(true);
    }
  };

  // ✅ 정답/오답 처리 함수
  const handleAnswer = (isCorrect: boolean, similarity?: number) => {
    console.log(`답변 처리: ${isCorrect ? '정답' : '오답'}, 유사도: ${similarity}%`);

    if (isCorrect) {
      // 정답 처리
      setIsSpeaking(true);
      setShowFeedback(true);
      setIsCorrectAnswer(true);

      setTimeout(() => {
        setShowFeedback(false);
        setIsSpeaking(false);
        moveToNextProblem();
      }, 2000);
    } else {
      // 오답 처리
      setShowFeedback(true);
      setIsCorrectAnswer(false);

      setAttemptCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) setShowSpeakerButton(true);
        return newCount;
      });

      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  // 🔊 스피커 버튼 눌렀을 때: 단어 음성 재생
  const handlePlayWordAudio = () => {
    // TODO: 백엔드에서 오디오 파일 받아서 재생
    // const audioUrl = await fetchAudioFromBackend(currentProblem.id);
    const audio = new Audio(currentProblem.audioUrl);
    audio.play().catch(err => {
      console.error('오디오 재생 실패:', err);
    });
  };

  // 🎤 마이크 버튼 눌렀을 때: 녹음 시작 / 종료 토글
  const handleMicClick = async () => {
    if (isRecording) {
      // 녹음 종료
      setIsRecording(false);
      setIsAnalyzing(true);

      // TODO: 실제 녹음 중지 및 데이터 가져오기
      // const audioBlob = stopRecording();

      // TODO: 백엔드로 음성 전송 및 결과 받기
      // const result = await sendAudioToBackend(audioBlob, currentProblem.word);
      // setIsAnalyzing(false);
      // handleAnswer(result.isCorrect, result.similarity);

      // 임시: 2초 후 랜덤 결과
      setTimeout(() => {
        setIsAnalyzing(false);
        const randomCorrect = Math.random() > 0.5;
        handleAnswer(randomCorrect, randomCorrect ? 90 : 60);
      }, 2000);
    } else {
      // 녹음 시작
      setIsRecording(true);
      // TODO: 실제 녹음 시작
      // startRecording();
    }
  };

  return (
    <div
      className="flex flex-col h-screen relative"
      style={{
        backgroundImage: 'url(/adventurepage/adventure_4_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#4A5A2A',
      }}
    >
      {/* 화면 어둡게 하는 오버레이 (튜토리얼 모드일 때) */}
      <TutorialOverlay active={isTutorialMode} />

      {/* 상단 아이콘 바 (물음표 / 나가기) */}
      <TopActionsBar onTutorialClick={handleTutorialClick} isCompleted={isAllCompleted} />
      
      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-6 relative z-[2]">
        {/* 튜토리얼 말풍선 (양피지 위에 표시) */}
        {isTutorialMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <TutorialBubble
              text="단어를 보고 똑같이 말해보세요!"
              className="max-w-[90%] text-center"
            />
          </div>
        )}

  {/* (2) 양피지 컨테이너: 지도+콘텐츠 동일 스케일 */}
  <div
    className="relative"
    style={{
      backgroundImage: 'url(/adventurepage/map_background.png)', // map_background여도 OK
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 'clamp(800px, 96vw, 1400px)',
      aspectRatio: '16 / 9',      // 업로드한 이미지 비율 그대로
      padding: 'clamp(20px, 4vw, 56px) clamp(24px, 5vw, 72px)',
      overflow: 'hidden',
    }}
  >
    {/* (3) 세이프존: 테두리 안쪽 퍼센트 영역 */}
    <div
      className="absolute flex flex-col items-center justify-center gap-[6%]"
      style={{ inset: '10% 8%' }}   // 상하 10%, 좌우 8% 안쪽만 사용
    >
          {/* 단어 카드 + 스피커 버튼 */}
          <WordCard
            word={currentProblem.word}
            showSpeaker={showSpeakerButton}
            onSpeakerClick={handlePlayWordAudio}
            isSpeaking={isSpeaking}
          />

          {/* 마이크 버튼 */}
          <MicrophoneButton
            isRecording={isRecording}
            isAnalyzing={isAnalyzing}
            onClick={handleMicClick}
          />
        </div>
      </div>
      </main>

      {/* 우측 하단 캐릭터 (피드백 캐릭터) */}
      <FeedbackCharacter
        visible={showFeedback}
        isCorrect={isCorrectAnswer}
      />

      {/* ⚠️ 개발 테스트용 버튼 - 실제 기능 구현 후 삭제 예정 ⚠️ */}
      <DevTestButtons
        onCorrect={() => handleAnswer(true, 95)}
        onWrong={() => handleAnswer(false, 60)}
        onToggleSpeaker={() => setShowSpeakerButton(prev => !prev)}
        onToggleWave={() => setIsSpeaking(prev => !prev)}
      />
    </div>
  );
};

export default Adventure4Page;
