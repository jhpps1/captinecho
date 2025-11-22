import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import LoadingScreen from '../components/LoadingScreen';

// 왼쪽 게임 선택창에 들어가는 데이터
const woodenButtons = [
    { id: 1, label: '자모맞추기', typeId: 1 },
    { id: 2, label: '빈음소찾기', typeId: 2 },
    { id: 3, label: '그림맞히기', typeId: 3 },
    { id: 4, label: '단어읽기', typeId: 4 },
];

// 학생 프로필 정보를 받아와서 저장하는 것을 담당하는 인터페이스 1.
interface StudentProfile {
    name: string;
    imageUrl: string;
}

// 학생 정보 관련 API 정보를 받아와 저장하는 것을 담당하는 인터페이스 2.
interface ApiStudent {
    studentId: number;
    name: string;
    profileImage: string;
    level: string | null; // 초기진단 완료 시 레벨, 미완료 시 null
}

// 햑생 정보를 검증하기 위해 존재하는 인터페이스
interface ApiResponse {
    students: ApiStudent[];
}

// 일일 탐험 문제수 카운트 응답 관련 인터페이스
interface DailyCountResponse {
    completedCount: number;
}

interface DailyStreakApiResponse { // 새 인터페이스
    weeklyAttendance: boolean[];
}


// 로그아웃 버튼
const ExitIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-6-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
);

// 소리 켬 아이콘
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-12">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);

// 음소거 아이콘
const SpeakerXMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-12">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>

);

export default function StudentDashboard() {
    // 라우팅 관련
    const navigate = useNavigate();

    // 학생 정보 관련 변수
    const [profile, setProfile] = useState<StudentProfile | null>(null);

    // 로딩 관련 변수
    const [isApiLoading, setIsApiLoading] = useState(true);
    
    // 비디오/이미지 리소스 로딩 상태
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    // 메뉴 토글 관련 변수
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 일일 탐험 미션 시작 관련 변수
    const [isStartingGame, setIsStartingGame] = useState(false);

    // 말풍선 토글 관련 변수
    const [isBubbleVisible, setIsBubbleVisible] = useState(false);

    // 오늘의 탐험 목표 저장
    const [solvedProblemCount, setSolvedProblemCount] = useState(0);

    // 주간 Streak 저장 배열
    const [weeklyStreak, setWeeklyStreak] = useState<boolean[]>([]);

    // 일일 탐험 완료 메시지 표시 변수
    const [isCompletionMessageVisible, setIsCompletionMessageVisible] = useState(false);

    // BGM 관련 State 및 Ref
    const [volume, setVolume] = useState(0.15); // 볼륨 상태 (0.0 ~ 1.0)
    const [lastVolume, setLastVolume] = useState(0.15); // 음소거 해제 시 복원할 볼륨
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // BGM 재생 로직
    useEffect(() => {
        audioRef.current = new Audio('/studentboard/backgroundmusic.mp3');
        audioRef.current.loop = true; // 반복 재생
        audioRef.current.volume = volume; // 초기 볼륨 적용
        audioRef.current.muted = false; // 초기 재생 상태 적용

        // 자동 재생 시도
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("BGM 자동 재생 실패. 사용자 상호작용이 필요합니다.", error);
            });
        }

        // 컴포넌트 언마운트 시 BGM 정리
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []); // [] 빈 배열: 컴포넌트 마운트 시 1회만 실행

    // volume 상태가 변경될 때마다 오디오 객체에 적용
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            if (volume > 0) {
                setLastVolume(volume); // 0보다 큰 마지막 볼륨 저장
                audioRef.current.muted = false; // 볼륨이 있으면 음소거 해제
            } else {
                audioRef.current.muted = true; // 볼륨이 0이면 음소거
            }
        }
    }, [volume]);

    // 음소거 토글 핸들러
    const toggleMute = () => {
        if (volume > 0) {
            setVolume(0); // 음소거 (볼륨 0)
        } else {
            // 음소거 해제 (이전 볼륨으로 복원, 0이었으면 0.5로)
            setVolume(lastVolume > 0 ? lastVolume : 0.15);
        }

        // 사용자가 음소거 버튼을 눌러 상호작용했으므로,
        // 만약 오디오가 멈춰있었다면(자동재생 실패시) 다시 재생 시도
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("음소거 해제 후 재생 시도 실패:", e));
        }
    };


    useEffect(() => {
        // 세션 스토리지에 저장된 학생ID를 가져오는 코드
        const studentIdFromSession = sessionStorage.getItem('studentId');

        // 만약 학생 정보가 세션 스토리지에 담기지 않은 상태거나 비정상적인 상태라면 작동.
        // 학생 선택창으로 날려보낸다.
        if (!studentIdFromSession) {
            alert('학생을 먼저 선택해주세요.');
            navigate('/select-profile');
            return;
        }

        // 백엔드 API 요청 관련 처리 코드
        const fetchData = async (id: string) => {
            const targetStudentId = parseInt(id, 10);
            try {
                // accessToken 정보를 쿠키에서 가져오는 코드
                const accessToken = Cookies.get('accessToken');

                // 만약 유효하지 않은 토큰 정보라면 로그인 화면으로 다시 날려버림.
                if (!accessToken) {
                    alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
                    navigate('/login');
                    return;
                }

                // 세 개의 API 요청을 병렬로 준비
                const headers = { 'Authorization': `Bearer ${accessToken}` };

                const profilePromise = fetch('/api/protector/students', { headers });

                const countPromise = fetch(`/api/student/${id}/dashboard/daily/count`, { headers });

                const streakPromise = fetch(`/api/student/${id}/dashboard/daily-streak`, { headers });

                console.log(streakPromise)

                // Promise.all로 프로필 요청, 푼 문제수 요청, 주간 streak 요청 이렇게 세 요청을 동시에 실행
                const [profileResponse, countResponse, streakResponse] = await Promise.all([
                    profilePromise,
                    countPromise,
                    streakPromise
                ]);

                // 인증 오류 처리 관련 코드
                if (profileResponse.status === 401 || countResponse.status === 401 || streakResponse.status === 401) {
                    alert('인증 정보가 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.'); // Authentication expired or invalid. Please log in again.
                    Cookies.remove('accessToken', { path: '/' });
                    sessionStorage.removeItem('studentId');
                    navigate('/');
                    return;
                }

                // 프로필 응답 관련 처리하는 코드
                if (!profileResponse.ok) {
                    throw new Error(`Profile API Error: ${profileResponse.status} ${profileResponse.statusText}`);
                }
                // 학생 정보를 검증
                const profileData: ApiResponse = await profileResponse.json();
                const foundStudent = profileData.students.find(
                    (student) => student.studentId === targetStudentId
                );

                // 초기진단 체크: level이 null이면 초기진단 페이지로 이동
                if (foundStudent && foundStudent.level === null) {
                    navigate("/initial-assessment");
                    return;
                }

                if (foundStudent) {
                    setProfile({
                        name: foundStudent.name,
                        imageUrl: foundStudent.profileImage,
                    });
                } else {
                    // 찾는데 실패할 경우 프로필 선택창으로 날려버린다.
                    alert('학생 정보를 찾는 데 실패했습니다. 다시 선택해주세요.');
                    navigate('/select-profile');
                    return;
                }

                // 푼 문제수 개수를 담당하는 응답 처리
                if (!countResponse.ok) {
                    // 에러가 발생할 경우
                    console.error(`푼 문제 수를 처리하는 API에 에러가 발생하였습니다.`);
                    setSolvedProblemCount(0); // 에러 발생 시 0으로 설정
                } else {
                    // 정상적으로 실행될 경우
                    const countData: DailyCountResponse = await countResponse.json();
                    setSolvedProblemCount(countData.completedCount);
                }

                // 주간 Streak(목표) 응답 처리
                if (!streakResponse.ok) {
                    // 에러가 발생할 경우
                    console.error(`주간 탐험 완료 체크를 하는 API에서 에러가 발생하였습니다.`);
                    setWeeklyStreak(Array(5).fill(false)); // 에러 발생 시 5개 빈 스탬프로 설정
                } else {
                    // 정상적으로 실행될 경우
                    const streakData: DailyStreakApiResponse = await streakResponse.json(); // 1. DailyStreakApiResponse로 변경
                    const paddedStreak = [...streakData.weeklyAttendance, ...Array(5).fill(false)].slice(0, 5);
                    setWeeklyStreak(paddedStreak);
                }
            } catch (error) {
                // 에러가 발생할 경우 에러 코드를 출력한 후 프로필 선택창으로 날린다.
                console.error('학생 대시보드 데이터 로드 실패:', error);
                alert('학생 정보를 불러오는 데 실패했습니다.');
                navigate('/select-profile');
            } finally {
                setIsApiLoading(false);
            }
        };

        fetchData(studentIdFromSession);
    }, [navigate]);

    // 아래 게임시작 타륜 버튼 클릭시 동작하는 코드
    const handleStartGame = () => {
        // 뱃고동 소리 재생
        try {
            const audio = new Audio('/studentboard/boathorn.mp3');
            audio.volume = 0.09;
            audio.play().catch(error => {
                console.warn("Audio play failed, possibly due to browser autoplay policy:", error);
            });
        } catch (e) {
            console.error("Error creating or playing audio:", e);
        }

        setIsStartingGame(true);
        setTimeout(() => {
            navigate(`/daily`);
        }, 1800); // 애니메이션 시간(1.8초) 후 이동
    };

    // 일일 탐험 완료 시 메시지 표시 핸들러
    const handleShowCompletionMessage = () => {
        if (isCompletionMessageVisible) return; // 이미 떠있으면 중복 실행 방지
        setIsCompletionMessageVisible(true);
        setTimeout(() => {
            setIsCompletionMessageVisible(false);
        }, 3000); // 3초 후 메시지 숨김
    };

    // 일일 탐험 완료 여부 변수
    const isDailyComplete = solvedProblemCount >= 10;


    // 배(캐릭터) 클릭 시 오늘 몇 문제 풀었는지 출력하게 도와주는 코드
    const handleShipClick = () => {
        if (isStartingGame || isBubbleVisible) return;
        setIsBubbleVisible(true);
        setTimeout(() => {
            setIsBubbleVisible(false);
        }, 3000);
    };

    // 로딩 중 화면
    const isLoading = isApiLoading || !profile || !isVideoLoaded;

    // 오늘의 탐험 목표 (최대 10개) 스탬프 배열 생성
    const dailyStamps = Array.from({ length: 10 }, (_, i) => i < solvedProblemCount);

    return (
        <>

            {isLoading && <LoadingScreen />}

            <div 
                className="w-full min-h-screen bg-black overflow-hidden relative font-sans"
            >
                {/* Background 비디오 */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    onLoadedData={() => {
                        console.log("배경 비디오 로딩 완료");
                        setIsVideoLoaded(true);
                    }}
                >
                    <source src="/studentboard/background.mp4" type="video/mp4" />
                    브라우저가 비디오 태그를 지원하지 않습니다.
                </video>

                {/* 오른쪽 하단 프로필 바 */}
                {profile && (
                    <div>
                            {/* 오른쪽 하단 프로필 바 */}
                            <header
                                className="absolute bottom-5 right-5 w-[400px] h-[80px] bg-contain bg-no-repeat z-20"
                                style={{ backgroundImage: `url('/studentboard/profilebar.png')` }}
                            >
                                {/* ... (내용 동일) ... */}
                                <div className="flex items-center h-full pl-2">
                                    <div className="w-[50px] h-[50px] ms-2.5 rounded-full overflow-hidden border-2 border-yellow-300/50 flex-shrink-0">
                                        {profile.imageUrl ? (
                                            <img src={profile.imageUrl} alt="프로필" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-white">{profile.name?.charAt(0) || 'N'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="ml-4 text-3xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
                                        {profile.name}
                                    </span>
                                </div>
                            </header>

                    {/* 오른쪽 상단 버튼 영역 */}
                    <div className="absolute top-5 right-5 z-20 flex items-center space-x-4">
                        {/* 음량 조절 슬라이더 */}
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-72 h-2 bg-white/50 rounded-full cursor-pointer appearance-none
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:h-5
                                    [&::-webkit-slider-thumb]:w-5
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-white
                                    [&::-moz-range-thumb]:h-5
                                    [&::-moz-range-thumb]:w-5
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-white
                                    [&::-moz-range-thumb]:border-none
                                    [&::-moz-range-track]:h-2
                                    [&::-moz-range-track]:bg-white/50
                                    [&::-moz-range-track]:rounded-full"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} // Fallback for moz
                        />

                        {/* 음소거 버튼 */}
                        <button
                            onClick={toggleMute}
                            className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center transition-all active:scale-95 hover:bg-gray-100"
                        >
                            {volume === 0 ? (
                                <SpeakerXMarkIcon className="w-12 h-12 text-gray-700" />
                            ) : (
                                <SpeakerWaveIcon className="w-12 h-12 text-gray-700" />
                            )}
                        </button>

                        {/* 나가기 버튼 */}
                        <button
                            onClick={() => navigate('/select-profile')}
                            className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all active:scale-95"
                        >
                            <ExitIcon className="w-12 h-12 text-gray-700" />
                        </button>
                    </div>

                    {/* 왼쪽 상단의 앵무새 상점 버튼 */}
                    <button
                        onClick={() => { navigate('/parrot-store') }}
                        className="absolute top-5 left-5 w-20 h-20 z-20 hover:scale-105 active:scale-95 transition-transform"
                    >
                        <img
                            src="/studentboard/parrot.png"
                            alt="앵무새"
                            className="w-full h-full object-contain"
                        />
                    </button>


                    {/* 중앙 아래쪽의 배(+캐릭터) 상호작용 관련 이미지 */}
                    <div
                        className={`absolute bottom-[-20px] left-1/2 w-[450px] h-[525px]
                                transition-transform duration-[2000ms] ease-in-out z-20`
                        }
                        style={{
                            transform: isStartingGame
                                ? 'translate(-50%, -110vh)'
                                : 'translate(-50%, 0)'
                        }}
                    >
                        {/* 말풍선 */}
                        <div
                            className={`absolute top-[60px] left-1/2 -translate-x-1/2 w-max max-w-xs
                            bg-white rounded-xl shadow-lg p-4 z-30
                            transition-all duration-300 ease-in-out
                            ${isBubbleVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                        >
                            <span className="text-gray-800 font-semibold text-lg">
                                지금 {solvedProblemCount}개의 문제를 해결했어!
                            </span>
                            {/* 말풍선 꼬리 */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 top-full 
                                w-0 h-0 border-[10px] border-solid
                                border-t-white border-l-transparent
                                border-r-transparent border-b-transparent"
                            ></div>
                        </div>

                        {/* 배와 캐릭터 사진 */}
                        <img
                            src="/studentboard/ship.png"
                            alt="배와 캐릭터"
                            className="absolute bottom-0 left-0 w-full z-0 cursor-pointer"
                            onClick={handleShipClick}
                        />

                        {/* 게임 시작 버튼 관련 */}
                        <button
                            onClick={isDailyComplete ? handleShowCompletionMessage : handleStartGame}
                            disabled={isStartingGame}
                            className={`absolute bottom-[30px] left-1/2 -translate-x-1/2 w-42 h-42 z-20
                            transition-all duration-500 ease-out
                            hover:scale-110 active:scale-100
                            ${isStartingGame ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
                        >
                            {/* 완료 여부에 따라 이미지 변경 */}
                            <img
                                src={isDailyComplete ? "/studentboard/completebutton.png" : "/studentboard/playbutton.png"}
                                alt={isDailyComplete ? "탐험 완료" : "시작하기"}
                            />
                        </button>
                    </div>

                    {/* 왼쪽 게임시작 관련 사이드 바 */}
                    <aside
                        className={`fixed top-1/2 -translate-y-1/2 left-0 flex items-center h-[450px] z-50
                                transition-transform duration-500 ease-in-out
                                ${isMenuOpen ? 'translate-x-0' : '-translate-x-48'}`}
                    >
                        {/* 메뉴 버튼 컨테이너 */}
                        <div
                            className="w-64 h-full flex flex-col justify-around items-center py-5"
                        >
                            {/* 버튼 관련 정보들 */}
                            {woodenButtons.map((button) => (
                                <button
                                    key={button.id}
                                    onClick={() => {
                                        navigate(`/adventure/${button.typeId}`);
                                    }}
                                    className="w-52 h-20 bg-contain bg-no-repeat bg-center text-xl font-bold text-white hover:scale-105 transition-transform"
                                    style={{
                                        backgroundImage: `url('/studentboard/button.png')`,
                                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                                    }}
                                >
                                    {/* 버튼의 이름들이 저장되는 공간 */}
                                    {button.label}
                                </button>
                            ))}
                        </div>

                        {/* 메뉴 토글 버튼 */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-20 h-24 flex items-center justify-center z-10 transition-transform duration-300 hover:scale-105 active:scale-95"
                        >
                            <img
                                src={isMenuOpen ? "/studentboard/closebutton.png" : "/studentboard/openbutton.png"}
                                alt={isMenuOpen ? "닫기" : "열기"}
                                className="w-full h-full object-contain"
                            />
                        </button>
                    </aside>

                    {/* 오른쪽 현황판 */}
                    <div
                        className="fixed top-1/2 -translate-y-1/2 right-0 h-[450px] z-50 me-10 w-72 bg-contain bg-no-repeat bg-center p-5"
                        // 이미지 정보
                        style={{ backgroundImage: `url('/studentboard/woodenstats.png')` }}
                    >
                        <h2
                            className="text-center text-3xl font-bold text-white pt-10"
                            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}
                        >
                            현황
                        </h2>

                        {/* 양피지 배경 정보 */}
                        <div
                            className="w-full h-[calc(100%-170px)] mt-3 bg-contain bg-no-repeat bg-center p-4"
                            style={{ backgroundImage: `url('/studentboard/statspaper.png')` }}
                        >
                            {/* 이번 주 탐험 완료 streak 관련 */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mt-1 mb-1">이번 주 목표 탐험 완료</h3>
                                <div className="flex justify-around items-center px-1">
                                    {weeklyStreak.map((isCompleted, index) => (
                                        <img
                                            key={`weeklyAttendance-${index}`}
                                            // 값이 True 라면 파랑색 스탬프, 값이 False라면 회색 스탬프
                                            // 배열의 True/False 값을 인식하여 판단한다.
                                            src={isCompleted ? "/studentboard/onstamp.png" : "/studentboard/offstamp.png"}
                                            alt={isCompleted ? "완료 스탬프" : "미완료 스탬프"}
                                            className="w-9 h-9"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* 오늘의 탐험 문제 풀이 수 관련 */}
                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">오늘의 탐험 목표</h3>
                                <div className="grid grid-cols-5 gap-y-1 justify-items-center px-1">
                                    {dailyStamps.map((isCompleted, index) => (
                                        <img
                                            key={`today-${index}`}
                                            // 풀이 문제 수 만큼 파랑 스탬프가 찍히게 한다. 위의 streak과 다르게 순서대로 찍힌다.
                                            src={isCompleted ? "/studentboard/onstamp.png" : "/studentboard/offstamp.png"}
                                            alt={isCompleted ? "완료 스탬프" : "미완료 스탬프"}
                                            className="w-9 h-9"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                bg-white/95 rounded-2xl shadow-xl p-8 max-w-sm w-11/12
                                text-center text-gray-800 text-2xl font-semibold z-[60]
                                transition-all duration-300 ease-in-out
                                ${isCompletionMessageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                    >
                        오늘 탐험은 완료했어요. <br />
                        더 탐험하고 싶으면 <br />
                        화면 왼쪽의 추가탐험을 해보는게 어때요?
                    </div>
                </div>
                )}
                {/* 게임 시작 시 페이드 아웃 오버레이 */}
                <div
                    className={`absolute inset-0 bg-sky-600 transition-opacity duration-1500 z-40
                    ${isStartingGame ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
            </div>
        </>
    );
}