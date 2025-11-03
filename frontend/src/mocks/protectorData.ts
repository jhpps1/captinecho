// Mock 데이터: 보호자 대시보드

export interface Student {
  id: number;
  lastName: string;
  fullName: string;
  level: number;
  streak: number;
  profileImage?: string;
  grade: string;
}

export interface JamoStat {
  jamo: string;
  progress: number; // 0-100
}

export interface WeeklyActivity {
  date: string;
  studyTime: number; // 분 단위
  completed: boolean;
}

export interface StudyGoal {
  type: 'daily' | 'weekly';
  target: number;
  current: number;
  unit: string;
}

// 학생 목록
export const mockStudents: Student[] = [
  {
    id: 1,
    lastName: '존',
    fullName: '존 손제',
    level: 2,
    streak: 3,
    grade: '1학년'
  },
  {
    id: 2,
    lastName: '콘',
    fullName: '콘 은콘',
    level: 2,
    streak: 3,
    grade: '1학년'
  },
  {
    id: 3,
    lastName: '김',
    fullName: '김 규미',
    level: 1,
    streak: 0,
    grade: '미취학'
  },
  {
    id: 4,
    lastName: '팍',
    fullName: '팍 준형',
    level: 1,
    streak: 0,
    grade: '미취학'
  }
];

// 자모별 학습 통계
export const mockJamoStats: JamoStat[] = [
  { jamo: 'ㄱ', progress: 85 },
  { jamo: 'ㄴ', progress: 90 },
  { jamo: 'ㄷ', progress: 75 },
  { jamo: 'ㄹ', progress: 80 },
  { jamo: 'ㅁ', progress: 95 },
  { jamo: 'ㅂ', progress: 70 },
  { jamo: 'ㅅ', progress: 88 },
  { jamo: 'ㅇ', progress: 92 },
  { jamo: 'ㅈ', progress: 78 },
  { jamo: 'ㅊ', progress: 65 },
  { jamo: 'ㅋ', progress: 82 },
  { jamo: 'ㅌ', progress: 77 },
  { jamo: 'ㅍ', progress: 73 },
  { jamo: 'ㅎ', progress: 85 }
];

// 주간 활동 (최근 7일)
export const mockWeeklyActivity: WeeklyActivity[] = [
  { date: '월', studyTime: 25, completed: true },
  { date: '화', studyTime: 30, completed: true },
  { date: '수', studyTime: 20, completed: true },
  { date: '목', studyTime: 0, completed: false },
  { date: '금', studyTime: 0, completed: false },
  { date: '토', studyTime: 0, completed: false },
  { date: '일', studyTime: 0, completed: false }
];

// 학습 목표
export const mockStudyGoals: StudyGoal[] = [
  {
    type: 'daily',
    target: 20,
    current: 15,
    unit: '분'
  },
  {
    type: 'weekly',
    target: 100,
    current: 75,
    unit: '분'
  }
];

// 주간 학습 시간 비교
export const mockWeeklyComparison = {
  lastWeek: [150, 180, 160, 200, 140, 190, 170],
  thisWeek: [180, 200, 175, 210, 160, 0, 0]
};

// AI Agent 로그
export const mockAILogs = [
  {
    id: 1,
    timestamp: '2025-10-31 10:30',
    type: 'curriculum',
    message: '커리큘럼 생성이 완료되었습니다.'
  },
  {
    id: 2,
    timestamp: '2025-10-31 10:25',
    message: '부모와 선택지 협의 중입니다.'
  }
];

// 관심사 카테고리 (대분류/소분류)
export const mockInterestCategories = {
  major: [
    {
      id: 1,
      name: '동물',
      sub: [
        { id: 11, name: '공룡' },
        { id: 12, name: '강아지' },
        { id: 13, name: '고양이' },
        { id: 14, name: '물고기' }
      ]
    },
    {
      id: 2,
      name: '과학',
      sub: [
        { id: 21, name: '우주' },
        { id: 22, name: '로봇' },
        { id: 23, name: '화학' },
        { id: 24, name: '실험' }
      ]
    },
    {
      id: 3,
      name: '스포츠',
      sub: [
        { id: 31, name: '축구' },
        { id: 32, name: '야구' },
        { id: 33, name: '농구' },
        { id: 34, name: '수영' }
      ]
    },
    {
      id: 4,
      name: '예술',
      sub: [
        { id: 41, name: '그림' },
        { id: 42, name: '음악' },
        { id: 43, name: '춤' },
        { id: 44, name: '공예' }
      ]
    }
  ]
};
