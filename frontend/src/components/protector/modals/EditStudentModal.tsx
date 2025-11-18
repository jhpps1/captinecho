import { useState, useEffect, useMemo } from 'react';

// 수정할 학생의 기본 정보 타입
interface StudentData {
    name: string;
    gender: 'male' | 'female';
    birthDate: string; // 'yyyy-MM-dd' 또는 '생년월일 미등록'
    grade: string; // '미취학', '초등학교 1학년' 등
}

// 부모 컴포넌트(ManageStudentsPage)에서 받을 props
interface EditStudentModalProps {
    student: StudentData;
    onClose: () => void;
    onSubmit: (updatedData: {
        name: string;
        gender: 'male' | 'female';
        birthDate: string; // yyyy-MM-dd
        grade: string;
    }) => void;
    isLoading?: boolean;
}

export default function EditStudentModal({
    student,
    onClose,
    onSubmit,
    isLoading = false
}: EditStudentModalProps) {
    // 폼 상태를 학생의 현재 정보로 초기화
    const [name, setName] = useState(student.name);
    const [gender, setGender] = useState<'male' | 'female'>(student.gender);
    const [birthDate, setBirthDate] = useState('');
    const [grade, setGrade] = useState(student.grade);

    const gradeOptions = [
        '미취학',
        '초등학교 1학년',
        '초등학교 2학년',
        '초등학교 3학년',
        '초등학교 4학년',
        '초등학교 5학년',
        '초등학교 6학년'
    ];

    // birthDate가 'yyyy-MM-dd' 형식이 아니면(예: '생년월일 미등록') input을 비워줌
    useEffect(() => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(student.birthDate)) {
            setBirthDate(student.birthDate);
        } else {
            setBirthDate(''); // 유효하지 않은 형식이면 비움
        }
    }, [student.birthDate]);

    const handleSubmit = () => {
        if (!name || !birthDate || !grade) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        onSubmit({
            name,
            gender,
            birthDate, // type="date" input은 'yyyy-MM-dd' 형식을 보장
            grade,
        });
    };

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    학생 정보 수정
                </h2>

                <div className="space-y-6">
                    {/* 학생 이름 */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            학생 이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    {/* 성별 */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            성별
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={gender === 'male'}
                                    onChange={(e) => setGender(e.target.value as 'male')}
                                    className="w-5 h-5 mr-2"
                                />
                                <span className="text-gray-700">남성</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={gender === 'female'}
                                    onChange={(e) => setGender(e.target.value as 'female')}
                                    className="w-5 h-5 mr-2"
                                />
                                <span className="text-gray-700">여성</span>
                            </label>
                        </div>
                    </div>

                    {/* 생년월일과 학년 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                생년월일
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                min="1900-01-01"
                                max={today}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                학년
                            </label>
                            <select
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white"
                            >
                                {gradeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                    >
                        {isLoading ? '수정 중...' : '수정 완료'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className={`flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold ${isLoading
                            ? 'bg-gray-100 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50'
                            }`}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}