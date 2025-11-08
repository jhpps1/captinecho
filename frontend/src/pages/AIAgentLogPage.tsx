import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import DashboardSidebar from '../components/dashboard/layout/DashboardSidebar';
import { getStudents } from '../api/protectorApi';
import { getDiscussion } from '../api/dashboardApi';

interface Student {
  id: number;
  lastName: string;
  fullName: string;
  level: number;
  streak: number;
  profileImage?: string;
  grade: string;
}

interface ParsedLog {
  timestamp: string;
  speaker: string;
  message: string;
}

// Discussion log 파싱 함수
const parseDiscussionLog = (log: string): ParsedLog[] => {
  if (!log) return [];

  const lines = log.split('\n');
  const parsed: ParsedLog[] = [];
  let currentTimestamp = '';
  let currentSpeaker = '';
  let currentMessage: string[] = [];

  for (const line of lines) {
    // 타임스탬프 감지
    if (line.startsWith('📅')) {
      currentTimestamp = line.replace('📅 ', '').trim();
      continue;
    }

    // 화자 감지
    if (line.startsWith('💬') || line.startsWith('✅')) {
      // 이전 메시지 저장
      if (currentSpeaker && currentMessage.length > 0) {
        parsed.push({
          timestamp: currentTimestamp,
          speaker: currentSpeaker,
          message: currentMessage.join('\n').trim()
        });
      }

      currentSpeaker = line.replace(/💬|✅/g, '').replace(':', '').trim();
      currentMessage = [];
      continue;
    }

    // 메시지 수집
    if (line.trim() && currentSpeaker) {
      currentMessage.push(line);
    }
  }

  // 마지막 메시지 저장
  if (currentSpeaker && currentMessage.length > 0) {
    parsed.push({
      timestamp: currentTimestamp,
      speaker: currentSpeaker,
      message: currentMessage.join('\n').trim()
    });
  }

  return parsed;
};

export default function AIAgentLogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [discussionLog, setDiscussionLog] = useState<string>('');
  const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(false);
  const [discussionError, setDiscussionError] = useState<string | null>(null);

  // location.state에서 전달된 학생 또는 첫 번째 학생 선택
  const stateStudent = (location.state as { selectedStudent?: Student })?.selectedStudent;
  const selectedStudent = stateStudent
    ? students.find(s => s.id === stateStudent.id) || students[0] || null
    : students[0] || null;

  // 학생 목록 조회
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await getStudents();
      const studentList: Student[] = response.students.map(s => ({
        id: s.studentId,
        lastName: s.name.charAt(0),
        fullName: s.name,
        level: s.level || 0,
        streak: 0,
        profileImage: s.profileImage,
        grade: s.grade || '미취학'
      }));
      setStudents(studentList);
    } catch (error: any) {
      console.error('❌ 학생 목록 로드 실패:', error);

      // 401 인증 에러인 경우 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        Cookies.remove('accessToken');
        navigate('/');
        return;
      }

      // 학생이 없는 경우는 에러가 아니므로 빈 배열로 처리
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // 컴포넌트 마운트 시 학생 목록 로드
  useEffect(() => {
    fetchStudents();
  }, []);

  // Discussion 로그 조회
  const fetchDiscussion = async () => {
    if (!selectedStudent) return;

    setIsLoadingDiscussion(true);
    setDiscussionError(null);
    try {
      const response = await getDiscussion(selectedStudent.id);
      setDiscussionLog(response.discussion || '');
    } catch (error: any) {
      console.error('❌ Discussion 로드 실패:', error);
      setDiscussionError('로그를 불러올 수 없습니다.');
    } finally {
      setIsLoadingDiscussion(false);
    }
  };

  // selectedStudent 변경 시 Discussion 로드
  useEffect(() => {
    fetchDiscussion();
  }, [selectedStudent]);

  return (
    <div className="flex min-h-screen bg-neutral-50 font-pretendard">
      {/* 사이드바 */}
      <DashboardSidebar
        title="AI Agent 로그"
        students={students}
        selectedStudentId={selectedStudent?.id}
        onStudentSelect={(studentId) => {
          const student = students.find(s => s.id === studentId);
          if (student) {
            navigate('/protector/ai-agent-log', { state: { selectedStudent: student } });
          }
        }}
        onLogout={() => {
          localStorage.removeItem('accessToken');
          sessionStorage.removeItem('accessToken');
          Cookies.remove('accessToken');
          navigate('/');
        }}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 lg:ml-0 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        {isLoadingStudents ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-500">학생 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : !selectedStudent ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg text-neutral-600 mb-2">등록된 학생이 없습니다</p>
              <p className="text-sm text-neutral-500">학생을 먼저 등록해주세요</p>
            </div>
          </div>
        ) : (
          <>
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">AI Agent 협의 로그</h1>
                <p className="text-neutral-600 mt-1">
                  {selectedStudent.fullName} 학생의 AI 협의 내용을 확인하세요
                </p>
              </div>
              <button
                onClick={() => navigate('/protector')}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300
                         rounded-lg hover:bg-neutral-50 transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>

            {/* AI Agent 로그 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              {/* 로그 내용 영역 */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 min-h-[400px]">
                {isLoadingDiscussion ? (
                  <div className="text-center py-12 text-neutral-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>로그를 불러오는 중...</p>
                  </div>
                ) : discussionError ? (
                  <div className="text-center py-12 text-error">
                    <p className="text-lg mb-2">⚠️</p>
                    <p>{discussionError}</p>
                  </div>
                ) : parseDiscussionLog(discussionLog).length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-lg font-semibold mb-2">아직 생성된 협의 로그가 없습니다</p>
                    <p className="text-sm">주간 리포트가 생성되면 여기에 표시됩니다</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parseDiscussionLog(discussionLog).map((log, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg transition-all ${
                          log.speaker === 'AI Agent'
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : log.speaker === '보호자'
                            ? 'bg-green-50 border-l-4 border-green-500'
                            : 'bg-amber-50 border-l-4 border-amber-500'
                        }`}
                      >
                        {log.timestamp && (
                          <div className="text-xs text-neutral-500 mb-2 font-medium">
                            {log.timestamp}
                          </div>
                        )}

                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-xl">
                            {log.speaker === 'AI Agent' ? '🤖' :
                             log.speaker === '보호자' ? '👤' : '✅'}
                          </span>
                          <span className="font-bold text-sm text-neutral-800">
                            {log.speaker}
                          </span>
                        </div>

                        <div className="text-sm text-neutral-700 whitespace-pre-wrap pl-10">
                          {log.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  );
}
