import { useState } from 'react';
import type { Problem } from '../../types/adventure';
import { MultiSyllableCard, type SyllableData } from './MultiSyllableCard';
import { ImageProblemCard } from './ImageProblemCard';
import { OptionsList } from './OptionsList';
import { FeedbackCharacter } from './FeedbackCharacter';
import { TutorialBubble } from './TutorialBubble';
import { submitSessionCorrect } from '../../api/adventureApi';

interface Adventure2Props {
  problem: Problem;
  onSubmit: (answer: unknown, attemptCount: number) => void;
  isTutorialMode: boolean;
  mode: 'daily' | 'supple';
  studentId: number;
}

/**
 * Adventure2 - 빈칸 채우기 문제 (단어)
 *
 * @description
 * - 여러 음절로 이루어진 단어에서 빈칸 찾기
 * - 이미지와 함께 제공
 * - API Problem 데이터를 SyllableData 배열로 변환
 *
 * @param problem - API에서 받은 문제 데이터
 * @param onSubmit - 정답 제출 콜백
 */
export const Adventure2 = ({ problem, onSubmit, isTutorialMode, mode, studentId }: Adventure2Props) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);

  // API Problem → SyllableData[] 변환
  // questionPhonemes: ["ㅋ","ㅏ","ㄷ","ㅡ"] → [{ initial: 'ㅋ', medial: 'ㅏ' }, { initial: 'ㄷ', medial: 'ㅡ' }]
  const convertToSyllables = (): SyllableData[] => {
    const syllables: SyllableData[] = [];
    const phonemes = problem.questionPhonemes;
    const correctAnswer = problem.correctAnswer[0]; // 단일 정답
    const blankPosition = problem.blankPosition as 'INITIAL' | 'MEDIAL' | 'FINAL' | null;

    // 자음 판별 함수 (초성 또는 종성)
    const CONSONANTS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    const VOWELS = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];

    const isConsonant = (char: string) => CONSONANTS.includes(char);
    const isVowel = (char: string) => VOWELS.includes(char);

    let phonemeIndex = 0;

    while (phonemeIndex < phonemes.length) {
      const initial = phonemes[phonemeIndex];
      const medial = phonemes[phonemeIndex + 1];
      const next = phonemes[phonemeIndex + 2];

      const syllableData: SyllableData = {
        initial: initial || '',
        medial: medial || '',
      };

      // 다음 음소가 자음이고 그 다음이 모음이면 종성 없음
      // 다음 음소가 자음이고 그 다음도 자음이거나 없으면 종성 있음
      if (next && isConsonant(next)) {
        const afterNext = phonemes[phonemeIndex + 3];
        if (!afterNext || isConsonant(afterNext)) {
          // 종성 있음
          syllableData.final = next;
          phonemeIndex += 3;
        } else {
          // 종성 없음, next는 다음 음절의 초성
          phonemeIndex += 2;
        }
      } else {
        // 다음이 모음이거나 없음 = 종성 없음
        phonemeIndex += 2;
      }

      // 빈칸 위치 확인: blankPhoneme이 이 음절에 있는지 확인
      // blankPosition이 null이 아닌 경우에만 할당
      if (blankPosition && (
        (blankPosition === 'INITIAL' && initial === correctAnswer) ||
        (blankPosition === 'MEDIAL' && medial === correctAnswer) ||
        (blankPosition === 'FINAL' && syllableData.final === correctAnswer)
      )) {
        syllableData.hiddenTarget = blankPosition; // blankPosition은 이미 null이 아님을 확인했으므로 안전
      }

      syllables.push(syllableData);
    }

    return syllables;
  };

  const syllables = convertToSyllables();
  const correctAnswer = problem.correctAnswer[0]; // 빈칸 채우기는 단일 정답

  // 선택지 클릭
  const handleOptionClick = (option: string) => {
    if (isAnswered || wrongAnswers.includes(option) || isAnimating) return;

    setSelectedAnswer(option);

    if (option === correctAnswer) {
      // 정답
      setIsAnswered(true);

      setTimeout(() => {
        onSubmit(option, attemptCount);
      }, 2000);
    } else {
      // 오답
      setIsAnimating(true);
      setWrongAnswers((prev) => [...prev, option]);

      // 오답 학습 데이터 수집
      const payload = {
        isCorrect: false,
        realJamo: correctAnswer,
        confusionJamo: option,  // 사용자가 선택한 오답 자모
        phonemePosition: problem.blankPosition || null,  // falsy → null 명시적 변환
        studyType: mode.toUpperCase() as 'DAILY' | 'SUPPLE', // 'daily' → 'DAILY'
        dayProblemId: problem.dayProblemId,  // 문제 ID
      };
      console.log('🔍 Adventure2 오답 API 전송 데이터:', payload);
      console.log('🔍 problem 객체:', problem);

      submitSessionCorrect(studentId, payload).catch(error => {
        console.error('❌ 오답 학습 데이터 수집 실패:', error);
        console.error('❌ 에러 응답:', error.response?.data);
        // 에러 발생해도 문제 진행은 계속
      });

      setAttemptCount((prev) => prev + 1);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
      }, 2000);
    }
  };

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-16 sm:pb-20">
      {/* 안내문 */}
      <div className="flex items-center justify-center mb-4 sm:mb-6" style={{ minHeight: '3rem' }}>
        {isTutorialMode && (
          <TutorialBubble
            text="그림을 보고 빈칸에 들어갈 글자를 선택하세요!"
            className="max-w-[90%] text-center"
          />
        )}
      </div>

      {/* 문제 영역: 이미지 카드 + 단어 카드 */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 mb-6 sm:mb-8 md:mb-10">
        <ImageProblemCard
          imageUrl={problem.imageUrl}
          alt={problem.questionText}
        />
        <MultiSyllableCard
          syllables={syllables}
          isAnswered={isAnswered}
        />
      </div>

      {/* 선택지 목록 */}
      <OptionsList
        options={problem.choices}
        correctAnswer={correctAnswer}
        selectedAnswer={selectedAnswer}
        wrongAnswers={wrongAnswers}
        isAnswered={isAnswered}
        isAnimating={isAnimating}
        isTutorialMode={isTutorialMode}
        onSelect={handleOptionClick}
        variant="square"
      />

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />
    </main>
  );
};
