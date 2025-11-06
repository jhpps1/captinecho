/**
 * 프론트엔드 ↔ 백엔드 학생 데이터 변환 유틸리티
 */

export type BackendGender = 'MALE' | 'FEMALE';
export type BackendGrade =
  | 'PRE_SCHOOL'
  | 'GRADE_1'
  | 'GRADE_2'
  | 'GRADE_3'
  | 'GRADE_4'
  | 'GRADE_5'
  | 'GRADE_6';

/**
 * 프론트엔드 성별을 백엔드 ENUM으로 변환
 * @param gender 'male' | 'female'
 * @returns 'MALE' | 'FEMALE'
 */
export const mapGenderToBackend = (gender: 'male' | 'female'): BackendGender => {
  return gender === 'male' ? 'MALE' : 'FEMALE';
};

/**
 * 프론트엔드 학년을 백엔드 ENUM으로 변환
 * @param grade '유치원', '초등 1학년', '초등 2학년', ...
 * @returns 'PRE_SCHOOL', 'GRADE_1', 'GRADE_2', ...
 */
export const mapGradeToBackend = (grade: string): BackendGrade => {
  const gradeMap: Record<string, BackendGrade> = {
    '유치원': 'PRE_SCHOOL',
    '초등 1학년': 'GRADE_1',
    '초등 2학년': 'GRADE_2',
    '초등 3학년': 'GRADE_3',
    '초등 4학년': 'GRADE_4',
    '초등 5학년': 'GRADE_5',
    '초등 6학년': 'GRADE_6',
  };

  const mappedGrade = gradeMap[grade];

  if (!mappedGrade) {
    console.warn(`Unknown grade: ${grade}, defaulting to GRADE_1`);
    return 'GRADE_1';
  }

  return mappedGrade;
};

/**
 * 백엔드 성별을 프론트엔드 형식으로 변환
 * @param gender 'MALE' | 'FEMALE'
 * @returns 'male' | 'female'
 */
export const mapGenderToFrontend = (gender: BackendGender): 'male' | 'female' => {
  return gender === 'MALE' ? 'male' : 'female';
};

/**
 * 백엔드 학년을 프론트엔드 형식으로 변환
 * @param grade 'PRE_SCHOOL' | 'GRADE_1' | ...
 * @returns '유치원' | '초등 1학년' | ...
 */
export const mapGradeToFrontend = (grade: BackendGrade): string => {
  const gradeMap: Record<BackendGrade, string> = {
    PRE_SCHOOL: '유치원',
    GRADE_1: '초등 1학년',
    GRADE_2: '초등 2학년',
    GRADE_3: '초등 3학년',
    GRADE_4: '초등 4학년',
    GRADE_5: '초등 5학년',
    GRADE_6: '초등 6학년',
  };

  return gradeMap[grade] || '초등 1학년';
};

/**
 * 날짜를 yyyy-MM-dd 형식으로 변환
 * @param date Date 객체 또는 날짜 문자열
 * @returns 'yyyy-MM-dd' 형식 문자열
 */
export const formatDateToBackend = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
