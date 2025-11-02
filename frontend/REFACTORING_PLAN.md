# AdventurePage1 컴포넌트 분리 계획

## ✅ 완료된 작업 (Phase 1)

### 1. utils/hangulUtils.ts
- [x] `splitVowelForLayout()` - 복합 모음 분해
- [x] `getVowelLayoutType()` - 모음 타입 판별
- [x] `getTopBlockClass()` - 레이아웃 클래스 생성
- [x] `bottomMostLineClass` - 받침 줄 클래스
- [x] `getCorrectAnswerForProblem()` - 정답 추출

### 2. hooks/useTutorialVoice.ts
- [x] `isSpeaking` - 음성 재생 중 상태
- [x] `currentVoiceType` - 현재 음성 타입
- [x] `playVoice()` - 음성 재생 함수
- [x] `stopVoice()` - 음성 중지 함수

### 3. types/problem.ts
- [x] `ProblemData` 타입 정의

---

## 🔄 남은 작업

### Phase 2: 핵심 UI 컴포넌트 분리

#### 4. components/OptionButton.tsx
**역할**: 개별 선택지 버튼

**Props**:
```tsx
type OptionButtonProps = {
  option: string;                  // 선택지 글자 (예: 'ㅏ')
  isCorrectNow: boolean;           // 현재 정답 선택 여부
  wasTriedAndWrong: boolean;       // 이미 오답으로 시도한 선택지
  disabled: boolean;               // 버튼 비활성화 여부
  onClick: () => void;             // 클릭 핸들러
};
```

**기존 코드 위치**: `adventurepage1.tsx` 432-469줄

**내부 구성**:
```tsx
import AnswerFeedback from './AnswerFeedback';

export const OptionButton = ({ option, isCorrectNow, wasTriedAndWrong, disabled, onClick }: OptionButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40
        bg-white rounded-2xl md:rounded-3xl shadow-xl
        border-4 sm:border-5 border-gray-800
        flex items-center justify-center
        text-5xl sm:text-6xl md:text-7xl font-bold text-gray-800
        transition-all duration-200 relative
        ${!disabled ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default pointer-events-none'}
      `}
    >
      <span className={isCorrectNow || wasTriedAndWrong ? 'opacity-20' : ''}>
        {option}
      </span>
      {isCorrectNow && <AnswerFeedback isCorrect={true} />}
      {wasTriedAndWrong && <AnswerFeedback isCorrect={false} />}
    </button>
  );
};
```

---

#### 5. components/OptionsList.tsx
**역할**: 선택지 그리드 래퍼 (OptionButton 여러 개를 관리)

**Props**:
```tsx
type OptionsListProps = {
  options: string[];               // 선택지 배열
  correctAnswer: string;           // 정답
  selectedAnswer: string | null;   // 현재 선택된 답
  wrongAnswers: string[];          // 오답 목록
  isAnswered: boolean;             // 정답 맞춤 여부
  isAnimating: boolean;            // 오답 애니메이션 중
  isTutorialMode: boolean;         // 튜토리얼 모드
  onSelect: (option: string) => void; // 선택 핸들러
};
```

**기존 코드 위치**: `adventurepage1.tsx` 425-471줄

**내부 구성**:
```tsx
import { OptionButton } from './OptionButton';

export const OptionsList = ({
  options,
  correctAnswer,
  selectedAnswer,
  wrongAnswers,
  isAnswered,
  isAnimating,
  isTutorialMode,
  onSelect
}: OptionsListProps) => {
  return (
    <div className="flex gap-4 sm:gap-6 md:gap-8">
      {options.map((option, index) => {
        const isCorrectNow = selectedAnswer === option && option === correctAnswer;
        const wasTriedAndWrong = wrongAnswers.includes(option);
        const disabled = isAnswered || wasTriedAndWrong || isAnimating || isTutorialMode;

        return (
          <OptionButton
            key={index}
            option={option}
            isCorrectNow={isCorrectNow}
            wasTriedAndWrong={wasTriedAndWrong}
            disabled={disabled}
            onClick={() => onSelect(option)}
          />
        );
      })}
    </div>
  );
};
```

---

#### 6. components/ProblemCard.tsx
**역할**: 현재 문제(초성/중성/종성) 카드

**Props**:
```tsx
import { ProblemData } from '../types/problem';

type ProblemCardProps = {
  problem: ProblemData;
  vowelLayoutType: string;
  vowelParts: { type: string; top: string; bottom: string | null };
  getColorClassForPart: (part: 'initial' | 'medialTop' | 'medialBottom' | 'final') => string;
};
```

**기존 코드 위치**: `adventurepage1.tsx` 325-401줄

**내부 구성**:
```tsx
import { bottomMostLineClass, getTopBlockClass } from '../utils/hangulUtils';

export const ProblemCard = ({
  problem,
  vowelLayoutType,
  vowelParts,
  getColorClassForPart
}: ProblemCardProps) => {
  return (
    <div className="w-[85vw] max-w-2xl h-40 sm:h-48 md:h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 sm:border-6 border-gray-800">
      <div className="flex flex-col items-center justify-center m-0 p-0 gap-0 transition-all duration-300">
        {/* 줄 1: 초성 + 모음 top/single */}
        <div className={getTopBlockClass(vowelLayoutType)}>
          <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('initial')}`}>
            {problem.initial}
          </span>
          {vowelParts.top && (
            <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('medialTop')}`}>
              {vowelParts.top}
            </span>
          )}
        </div>

        {/* 줄 2: 복합 모음의 아래 파트 */}
        {vowelParts.bottom && (
          <div className="flex items-center justify-center m-0 p-0 gap-0 translate-y-0">
            <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('medialBottom')}`}>
              {vowelParts.bottom}
            </span>
          </div>
        )}

        {/* 줄 3: 받침(종성) */}
        {problem.final && (
          <div className={bottomMostLineClass}>
            <span className={`text-7xl sm:text-8xl md:text-9xl font-bold ${getColorClassForPart('final')}`}>
              {problem.final}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### Phase 3: 레이아웃 컴포넌트 분리

#### 7. components/TutorialBubble.tsx
**역할**: 튜토리얼 안내 말풍선

**Props**:
```tsx
type TutorialBubbleProps = {
  text: string;           // 안내 텍스트
  className?: string;     // 추가 스타일 (위치/여백 조정용)
};
```

**기존 코드 위치**:
- 상단: `adventurepage1.tsx` 313-322줄
- 하단: `adventurepage1.tsx` 404-422줄

**내부 구성**:
```tsx
export const TutorialBubble = ({ text, className = '' }: TutorialBubbleProps) => {
  return (
    <p className={`
      text-xl sm:text-2xl md:text-3xl font-bold text-gray-800
      text-center bg-white/80 rounded-xl px-4 sm:px-6 py-2
      border-2 border-gray-800 shadow-md
      whitespace-normal break-keep
      ${className}
    `}>
      {text}
    </p>
  );
};
```

**사용 예시**:
```tsx
{isTutorialMode && (
  <div className="flex items-center justify-center mb-4 sm:mb-6" style={{ minHeight: '3rem' }}>
    <TutorialBubble text="회색 칸에 들어갈 글자를 골라보세요!" className="max-w-[90%]" />
  </div>
)}

{isTutorialMode && (
  <div className="flex items-center justify-center mb-6 sm:mb-8" style={{ minHeight: '2.5rem' }}>
    <TutorialBubble
      text="아래 카드 중에서 하나를 골라요!"
      className="text-lg sm:text-xl md:text-2xl whitespace-nowrap max-w-none"
    />
  </div>
)}
```

---

#### 8. components/TopActionsBar.tsx
**역할**: 상단 우측 액션 버튼들 (튜토리얼 + 나가기)

**Props**:
```tsx
type TopActionsBarProps = {
  onTutorialClick: () => void;
};
```

**기존 코드 위치**: `adventurepage1.tsx` 292-308줄

**내부 구성**:
```tsx
import { Link } from 'react-router-dom';
import { HelpCircle, DoorOpen } from 'lucide-react';

export const TopActionsBar = ({ onTutorialClick }: TopActionsBarProps) => {
  return (
    <header className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 sm:gap-3 z-10">
      {/* 튜토리얼 버튼 */}
      <button
        className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        onClick={onTutorialClick}
      >
        <HelpCircle className="text-gray-700" size={24} />
      </button>

      {/* 나가기 */}
      <Link
        to="/"
        className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <DoorOpen className="text-gray-700" size={24} />
      </Link>
    </header>
  );
};
```

---

#### 9. components/FeedbackCharacter.tsx
**역할**: 우측 하단 피드백 캐릭터

**Props**:
```tsx
type FeedbackCharacterProps = {
  visible: boolean;       // 표시 여부
  isCorrect: boolean;     // 정답 여부
};
```

**기존 코드 위치**: `adventurepage1.tsx` 475-491줄

**내부 구성**:
```tsx
export const FeedbackCharacter = ({ visible, isCorrect }: FeedbackCharacterProps) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-10 animate-bounce-in">
      <img
        src={isCorrect ? '/adventurepage/happy_eco.png' : '/adventurepage/question_eco.png'}
        alt={isCorrect ? '정답 캐릭터' : '오답 캐릭터'}
        className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain"
      />
    </div>
  );
};
```

**애니메이션 CSS** (컴포넌트 내부 또는 globals.css):
```css
@keyframes bounce-in {
  0% { transform: scale(0) translateY(20px); opacity: 0; }
  50% { transform: scale(1.1) translateY(-10px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
```

---

#### 10. components/TutorialOverlay.tsx
**역할**: 튜토리얼 모드 시 화면 어둡게

**Props**:
```tsx
type TutorialOverlayProps = {
  active: boolean;
};
```

**기존 코드 위치**: `adventurepage1.tsx` 289줄

**내부 구성**:
```tsx
export const TutorialOverlay = ({ active }: TutorialOverlayProps) => {
  if (!active) return null;

  return <div className="absolute inset-0 bg-black/60 z-[1]" />;
};
```

---

## 📝 adventurepage1.tsx 최종 리팩토링

### Import 섹션
```tsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Types
import { ProblemData } from '../types/problem';

// Utils
import {
  splitVowelForLayout,
  getVowelLayoutType,
  getCorrectAnswerForProblem
} from '../utils/hangulUtils';

// Hooks
import { useTutorialVoice } from '../hooks/useTutorialVoice';

// Components
import { TutorialOverlay } from '../components/TutorialOverlay';
import { TopActionsBar } from '../components/TopActionsBar';
import { TutorialBubble } from '../components/TutorialBubble';
import { ProblemCard } from '../components/ProblemCard';
import { OptionsList } from '../components/OptionsList';
import { FeedbackCharacter } from '../components/FeedbackCharacter';
```

### 상태 관리 부분만 남김
```tsx
const AdventurePage = () => {
  // 문제 데이터
  const problems: ProblemData[] = [...];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProblem = problems[currentIndex];
  const correctAnswer = getCorrectAnswerForProblem(currentProblem);

  // 모음 레이아웃 정보
  const vowelLayoutType = getVowelLayoutType(currentProblem.medial);
  const vowelParts = splitVowelForLayout(currentProblem.medial);

  // 상태
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTutorialMode, setIsTutorialMode] = useState(false);

  // 음성 Hook
  const { playVoice, stopVoice } = useTutorialVoice();

  // 핸들러들
  const handleOptionClick = (option: string) => { ... };
  const handleTutorialClick = () => { ... };
  const getColorClassForPart = (...) => { ... };

  // ESC 키 핸들링
  useEffect(() => { ... }, [isTutorialMode]);

  return (
    <div className="..." style={{ backgroundImage: '...' }}>
      <TutorialOverlay active={isTutorialMode} />

      <TopActionsBar onTutorialClick={handleTutorialClick} />

      <main className="...">
        {/* 상단 안내문 */}
        {isTutorialMode && (
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <TutorialBubble
              text="회색 칸에 들어갈 글자를 골라보세요!"
              className="max-w-[90%]"
            />
          </div>
        )}

        {/* 문제 카드 */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <ProblemCard
            problem={currentProblem}
            vowelLayoutType={vowelLayoutType}
            vowelParts={vowelParts}
            getColorClassForPart={getColorClassForPart}
          />
        </div>

        {/* 하단 안내문 */}
        {isTutorialMode && (
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <TutorialBubble
              text="아래 카드 중에서 하나를 골라요!"
              className="text-lg sm:text-xl md:text-2xl whitespace-nowrap"
            />
          </div>
        )}

        {/* 선택지 */}
        <OptionsList
          options={currentProblem.options}
          correctAnswer={correctAnswer}
          selectedAnswer={selectedAnswer}
          wrongAnswers={wrongAnswers}
          isAnswered={isAnswered}
          isAnimating={isAnimating}
          isTutorialMode={isTutorialMode}
          onSelect={handleOptionClick}
        />
      </main>

      {/* 피드백 캐릭터 */}
      <FeedbackCharacter
        visible={Boolean(isAnswered || selectedAnswer)}
        isCorrect={isAnswered && selectedAnswer === correctAnswer}
      />
    </div>
  );
};
```

---

## 🎯 예상 효과

### Before (현재)
- `adventurepage1.tsx`: ~508줄
- 모든 로직/UI가 한 파일에 집중

### After (리팩토링 후)
- `adventurepage1.tsx`: ~150줄 (상태 관리 + 조합만)
- 재사용 가능한 컴포넌트 10개
- 유지보수성 ↑, 확장성 ↑, 테스트 용이성 ↑

---

## 📌 다음 단계

1. Phase 2 진행: OptionButton → OptionsList → ProblemCard
2. Phase 3 진행: TutorialBubble → TopActionsBar → FeedbackCharacter → TutorialOverlay
3. adventurepage1.tsx 리팩토링 (import 추가 + 기존 코드 제거)
4. 테스트 및 검증
