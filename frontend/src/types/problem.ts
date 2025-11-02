export type ProblemData = {
  id: number;
  initial: string;        // 초성 (예: 'ㅇ')
  medial: string;         // 중성 (예: 'ㅘ' or 'ㅏ' or 'ㅜ' 등) - 백엔드에서 그대로 줌
  final?: string;         // 종성 받침 (예: 'ㅇ'), 없을 수도 있음
  hiddenTarget: 'initial' | 'medial' | 'final'; // 어떤 부분이 빈칸인지
  options: string[];      // 보기 (정답 포함)
};
