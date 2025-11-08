# Adventure API 개발 요구사항 문서

## 📋 목차
1. [현재 문제점 분석](#1-현재-문제점-분석)
2. [필요한 API 목록](#2-필요한-api-목록)
3. [API 상세 명세](#3-api-상세-명세)
4. [데이터베이스 수정사항](#4-데이터베이스-수정사항)
5. [구현 우선순위](#5-구현-우선순위)
6. [예상 코드 구조](#6-예상-코드-구조)

---

## 1. 현재 문제점 분석

### 🚨 심각한 문제

#### 1.1 문제 완료 API 누락
**문제**: `POST /api/student/{studentId}/adventure/result` 엔드포인트가 구현되지 않음

**영향**:
- 프론트엔드가 문제를 풀어도 백엔드에 완료 상태가 저장되지 않음
- `day_problem` 테이블의 `is_completed` 필드가 항상 `false`
- 진행도 추적 불가능
- 재진입 시 이미 푼 문제를 다시 풀어야 함

**현재 상황**:
```typescript
// 프론트엔드 (adventureApi.ts:83-104)
export const submitProblemResults = async (
  studentId: number,
  results: AnswerResult[]
): Promise<void> => {
  await axiosInstance.post(`/student/${studentId}/adventure/result`, requestBody);
  // ❌ 404 에러 발생 - 백엔드에 해당 엔드포인트 없음
};
```

#### 1.2 DayProblem 엔티티의 isCompleted 업데이트 불가
**문제**: `DayProblem.java`에 `@Setter`가 없어서 `isCompleted` 필드를 수정할 수 없음

**현재 코드**:
```java
// DayProblem.java
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DayProblem {
    @Column(name = "is_completed", nullable = false)
    @ColumnDefault("false")
    private Boolean isCompleted = false;

    // ❌ setter 메서드 없음
}
```

**필요한 수정**:
```java
// isCompleted를 업데이트할 수 있는 메서드 추가
public void markAsCompleted() {
    this.isCompleted = true;
}
```

#### 1.3 세션 완료 여부 확인 불가
**문제**: 일일학습을 완료했는지 여부를 확인하는 API가 없음

**영향**:
- 학생 대시보드에서 "오늘 이미 완료했는지" 확인 불가능
- 완료 후 재진입 시 새로운 세션이 생성됨
- 같은 날짜에 여러 세션이 생성될 수 있음

---

## 2. 필요한 API 목록

### 2.1 문제 완료 제출 API (최우선)
```
POST /api/student/{studentId}/adventure/result
```
**목적**: 문제를 풀었을 때 완료 상태를 DB에 저장

### 2.2 일일학습 상태 확인 API (중요)
```
GET /api/student/{studentId}/adventure/daily/status
```
**목적**: 오늘의 일일학습 완료 여부 및 진행 상태 확인

### 2.3 추가학습 상태 확인 API (선택)
```
GET /api/student/{studentId}/adventure/supple/status
```
**목적**: 추가학습 완료 여부 및 진행 상태 확인

---

## 3. API 상세 명세

### 3.1 문제 완료 제출 API

#### Endpoint
```
POST /api/student/{studentId}/adventure/result
```

#### Request
**Path Variable**:
- `studentId`: Long (학생 ID)

**Request Body**:
```json
{
  "results": [
    {
      "dayProblemId": 123,
      "studentId": 1,
      "isCorrect": true,
      "attemptCount": 2,
      "submittedAt": "2024-01-09T15:30:00"
    }
  ]
}
```

**Request DTO**:
```java
public record SubmitAnswerRequest(
    List<AnswerResult> results
) {}

public record AnswerResult(
    Long dayProblemId,
    Long studentId,
    Boolean isCorrect,
    Integer attemptCount,
    String submittedAt
) {}
```

#### Response
```
204 No Content (성공)
400 Bad Request (잘못된 요청)
404 Not Found (문제를 찾을 수 없음)
```

#### 구현 로직
1. `dayProblemId`로 `DayProblem` 엔티티 조회
2. `isCorrect`가 `true`이면 `isCompleted = true`로 업데이트
3. `attemptCount`는 통계 테이블에 저장 (기존 로직 활용)
4. 트랜잭션으로 처리하여 데이터 일관성 보장

---

### 3.2 일일학습 상태 확인 API

#### Endpoint
```
GET /api/student/{studentId}/adventure/daily/status
```

#### Request
**Path Variable**:
- `studentId`: Long (학생 ID)

#### Response
```json
{
  "status": "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
  "sessionId": 123,
  "completedProblems": 7,
  "totalProblems": 10,
  "completedAt": "2024-01-09T15:30:00"
}
```

**Response DTO**:
```java
public record DailyStatusResponse(
    String status,           // NOT_STARTED, IN_PROGRESS, COMPLETED
    Long sessionId,          // 세션 ID (없으면 null)
    Integer completedProblems,  // 완료한 문제 수
    Integer totalProblems,      // 전체 문제 수
    LocalDateTime completedAt   // 완료 시간 (완료 시에만)
) {}
```

#### 상태 결정 로직

```java
public DailyStatusResponse getDailyStatus(Long studentId) {
    LocalDate today = LocalDate.now();

    // 1. 오늘 날짜의 세션 조회
    Optional<LearningSession> sessionOpt = learningSessionRepository
        .findByStudent_StudentIdAndStudyTypeAndStartTimeBetween(
            studentId,
            StudyType.DAILY,
            today.atStartOfDay(),
            today.plusDays(1).atStartOfDay()
        );

    // 2. 세션이 없으면 → NOT_STARTED
    if (sessionOpt.isEmpty()) {
        return new DailyStatusResponse(
            "NOT_STARTED", null, 0, 10, null
        );
    }

    LearningSession session = sessionOpt.get();

    // 3. 세션이 있고 endTime이 있으면 → COMPLETED
    if (session.getEndTime() != null) {
        return new DailyStatusResponse(
            "COMPLETED",
            session.getSessionId(),
            10,
            10,
            session.getEndTime()
        );
    }

    // 4. 세션이 있고 endTime이 없으면 → IN_PROGRESS
    int completedCount = dayProblemRepository
        .countByStudent_StudentIdAndAssignedDateAndIsCompleted(
            studentId,
            today,
            true  // isCompleted = true인 것만 카운트
        );

    return new DailyStatusResponse(
        "IN_PROGRESS",
        session.getSessionId(),
        completedCount,
        10,
        null
    );
}
```

#### 왜 이 API가 필요한가?

**1. 학생 대시보드 진입 제어**
```
[학생 대시보드]
    ↓
status API 호출
    ↓
┌─────────────────────────────────────┐
│ status: "NOT_STARTED"               │
│ → "탐험 시작하기" 버튼 활성화       │
├─────────────────────────────────────┤
│ status: "IN_PROGRESS"               │
│ → "이어서 하기" 버튼 표시           │
├─────────────────────────────────────┤
│ status: "COMPLETED"                 │
│ → "오늘의 문제는 다 풀었어요!" 표시  │
│ → 버튼 비활성화                     │
└─────────────────────────────────────┘
```

**2. 진행률 시각화**
```javascript
const { completedProblems, totalProblems } = await getDailyStatus(studentId);

<ProgressBar value={completedProblems} max={totalProblems} />
// "7/10 문제 완료"
```

**3. 중복 세션 방지**
- 이미 완료한 날짜에 새 세션 생성 방지
- 데이터 무결성 보장

**4. 여러 기기 동기화**
- 집 컴퓨터에서 시작 → 학교 컴퓨터에서 이어하기
- localStorage가 아닌 서버 상태 기반

---

### 3.3 추가학습 상태 확인 API (선택)

#### Endpoint
```
GET /api/student/{studentId}/adventure/supple/status
```

#### 일일학습과 차이점
- `StudyType.SUPPLE`로 세션 조회
- 추가학습은 날짜 제한 없이 여러 번 가능
- 완료 여부보다는 진행 중인 세션 확인에 초점

---

## 4. 데이터베이스 수정사항

### 4.1 DayProblem 엔티티 수정

**파일**: `backend/.../domain/DayProblem.java`

**추가할 메서드**:
```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DayProblem {
    // ... 기존 필드들

    @Column(name = "is_completed", nullable = false)
    @ColumnDefault("false")
    private Boolean isCompleted = false;

    // 👇 추가
    /**
     * 문제를 완료 상태로 표시
     */
    public void markAsCompleted() {
        this.isCompleted = true;
    }

    /**
     * 문제가 완료되었는지 확인
     */
    public boolean isCompleted() {
        return this.isCompleted != null && this.isCompleted;
    }
}
```

### 4.2 Repository 메서드 추가

**파일**: `backend/.../repository/DayProblemRepository.java`

**추가할 쿼리 메서드**:
```java
public interface DayProblemRepository extends JpaRepository<DayProblem, Long> {
    // 기존 메서드들...

    /**
     * 특정 날짜의 완료된 문제 수 조회
     */
    @Query("SELECT COUNT(dp) FROM DayProblem dp " +
           "WHERE dp.student.studentId = :studentId " +
           "AND dp.assignedDate = :date " +
           "AND dp.isCompleted = :isCompleted")
    int countByStudent_StudentIdAndAssignedDateAndIsCompleted(
        @Param("studentId") Long studentId,
        @Param("date") LocalDate date,
        @Param("isCompleted") Boolean isCompleted
    );
}
```

**파일**: `backend/.../repository/LearningSessionRepository.java`

**추가할 쿼리 메서드**:
```java
public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    // 기존 메서드들...

    /**
     * 특정 날짜 범위의 세션 조회
     */
    @Query("SELECT ls FROM LearningSession ls " +
           "WHERE ls.student.studentId = :studentId " +
           "AND ls.studyType = :studyType " +
           "AND ls.startTime >= :startTime " +
           "AND ls.startTime < :endTime")
    Optional<LearningSession> findByStudent_StudentIdAndStudyTypeAndStartTimeBetween(
        @Param("studentId") Long studentId,
        @Param("studyType") StudyType studyType,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
```

---

## 5. 구현 우선순위

### 🔴 최우선 (즉시 구현 필요)

1. **DayProblem.markAsCompleted() 메서드 추가**
   - 작업량: 5분
   - 영향도: 높음 (다른 기능의 전제조건)

2. **POST /api/student/{studentId}/adventure/result API 구현**
   - 작업량: 30분
   - 영향도: 높음 (문제 완료 처리 핵심 기능)

### 🟡 중요 (1주일 내 구현 권장)

3. **GET /api/student/{studentId}/adventure/daily/status API 구현**
   - 작업량: 1시간
   - 영향도: 중간 (UX 개선, 중복 방지)

4. **Repository 쿼리 메서드 추가**
   - 작업량: 20분
   - 영향도: 중간 (상태 조회를 위한 기반)

### 🟢 선택 (여유 있을 때)

5. **GET /api/student/{studentId}/adventure/supple/status API 구현**
   - 작업량: 30분
   - 영향도: 낮음 (추가학습 기능 향상)

---

## 6. 예상 코드 구조

### 6.1 Controller

**파일**: `backend/.../controller/AdventureController.java`

```java
@RestController
@RequestMapping("/api/student/{studentId}")
@RequiredArgsConstructor
public class AdventureController {

    private final AdventureService adventureService;

    // 기존 API들...

    /**
     * 문제 완료 결과 제출
     */
    @PostMapping("/adventure/result")
    public ResponseEntity<Void> submitProblemResults(
        @PathVariable Long studentId,
        @RequestBody @Valid SubmitAnswerRequest request
    ) {
        adventureService.submitProblemResults(studentId, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * 일일학습 상태 조회
     */
    @GetMapping("/adventure/daily/status")
    public ResponseEntity<DailyStatusResponse> getDailyStatus(
        @PathVariable Long studentId
    ) {
        DailyStatusResponse status = adventureService.getDailyStatus(studentId);
        return ResponseEntity.ok(status);
    }
}
```

### 6.2 Service

**파일**: `backend/.../service/AdventureService.java`

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdventureService {

    private final DayProblemRepository dayProblemRepository;
    private final LearningSessionRepository learningSessionRepository;

    /**
     * 문제 완료 결과 제출 처리
     */
    @Transactional
    public void submitProblemResults(Long studentId, SubmitAnswerRequest request) {
        for (AnswerResult result : request.results()) {
            // 1. 문제 조회
            DayProblem problem = dayProblemRepository
                .findById(result.dayProblemId())
                .orElseThrow(() -> new EchoException(AdventureErrorCode.PROBLEM_NOT_FOUND));

            // 2. 학생 ID 검증
            if (!problem.getStudent().getStudentId().equals(studentId)) {
                throw new EchoException(AdventureErrorCode.UNAUTHORIZED_ACCESS);
            }

            // 3. 정답인 경우 완료 표시
            if (result.isCorrect()) {
                problem.markAsCompleted();
            }

            // 4. 통계 기록 (기존 로직 활용)
            // sessionStatisticsService.recordAnswer(result);
        }

        // 5. 변경사항 저장 (트랜잭션 커밋 시 자동 저장)
    }

    /**
     * 일일학습 상태 조회
     */
    public DailyStatusResponse getDailyStatus(Long studentId) {
        LocalDate today = LocalDate.now();

        // 1. 오늘 날짜의 세션 조회
        Optional<LearningSession> sessionOpt = learningSessionRepository
            .findByStudent_StudentIdAndStudyTypeAndStartTimeBetween(
                studentId,
                StudyType.DAILY,
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
            );

        // 2. 세션이 없으면 NOT_STARTED
        if (sessionOpt.isEmpty()) {
            return new DailyStatusResponse(
                "NOT_STARTED", null, 0, 10, null
            );
        }

        LearningSession session = sessionOpt.get();

        // 3. 세션이 종료되었으면 COMPLETED
        if (session.getEndTime() != null) {
            return new DailyStatusResponse(
                "COMPLETED",
                session.getSessionId(),
                10,
                10,
                session.getEndTime()
            );
        }

        // 4. 진행 중이면 완료된 문제 수 조회
        int completedCount = dayProblemRepository
            .countByStudent_StudentIdAndAssignedDateAndIsCompleted(
                studentId,
                today,
                true
            );

        return new DailyStatusResponse(
            "IN_PROGRESS",
            session.getSessionId(),
            completedCount,
            10,
            null
        );
    }
}
```

### 6.3 Request/Response DTO

**파일**: `backend/.../presentation/request/SubmitAnswerRequest.java`

```java
public record SubmitAnswerRequest(
    @NotNull(message = "결과 목록은 필수입니다")
    List<AnswerResult> results
) {}
```

**파일**: `backend/.../presentation/request/AnswerResult.java`

```java
public record AnswerResult(
    @NotNull(message = "문제 ID는 필수입니다")
    Long dayProblemId,

    @NotNull(message = "학생 ID는 필수입니다")
    Long studentId,

    @NotNull(message = "정답 여부는 필수입니다")
    Boolean isCorrect,

    @NotNull(message = "시도 횟수는 필수입니다")
    @Min(value = 1, message = "시도 횟수는 1 이상이어야 합니다")
    Integer attemptCount,

    @NotNull(message = "제출 시간은 필수입니다")
    String submittedAt
) {}
```

**파일**: `backend/.../presentation/response/DailyStatusResponse.java`

```java
public record DailyStatusResponse(
    @NotNull
    String status,  // NOT_STARTED, IN_PROGRESS, COMPLETED

    Long sessionId,  // nullable

    @NotNull
    Integer completedProblems,

    @NotNull
    Integer totalProblems,

    LocalDateTime completedAt  // nullable
) {}
```

### 6.4 Error Code

**파일**: `backend/.../exception/AdventureErrorCode.java`

```java
public enum AdventureErrorCode implements ErrorCode {
    // 기존 에러 코드들...

    PROBLEM_NOT_FOUND("AT40006", "문제를 찾을 수 없습니다"),
    UNAUTHORIZED_ACCESS("AT40007", "해당 문제에 접근할 권한이 없습니다");

    private final String code;
    private final String message;

    // ... 생성자 및 메서드
}
```

---

## 7. 프론트엔드 수정 필요사항

### 7.1 임시 localStorage 코드 제거

백엔드 API 구현 후 다음 파일에서 `TODO: API 개발되면 수정 예정` 주석이 있는 부분을 수정:

**파일**: `frontend/src/components/adventure/DailyRunner.tsx`
- localStorage 기반 완료 여부 관리 → API 호출로 변경
- `getDailyStatus()` API 호출 로직 추가

**파일**: `frontend/src/components/adventure/ProblemRunner.tsx`
- 문제 제출 API 404 에러 처리 제거
- 정상적인 API 응답 처리 로직 추가

### 7.2 API 함수 추가

**파일**: `frontend/src/api/adventureApi.ts`

```typescript
// 일일학습 상태 조회
export const getDailyStatus = async (
  studentId: number
): Promise<DailyStatusResponse> => {
  const response = await axiosInstance.get(
    `/student/${studentId}/adventure/daily/status`
  );
  return response.data;
};

interface DailyStatusResponse {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  sessionId: number | null;
  completedProblems: number;
  totalProblems: number;
  completedAt: string | null;
}
```

---

## 8. 테스트 시나리오

### 8.1 문제 완료 API 테스트

```bash
# 정상 케이스
curl -X POST http://localhost:8080/api/student/1/adventure/result \
  -H "Content-Type: application/json" \
  -d '{
    "results": [{
      "dayProblemId": 123,
      "studentId": 1,
      "isCorrect": true,
      "attemptCount": 2,
      "submittedAt": "2024-01-09T15:30:00"
    }]
  }'

# 예상 응답: 204 No Content

# DB 확인
SELECT is_completed FROM day_problem WHERE day_problem_id = 123;
-- 예상 결과: true
```

### 8.2 일일학습 상태 API 테스트

```bash
# 시나리오 1: 아직 시작 안 함
curl http://localhost:8080/api/student/1/adventure/daily/status

# 예상 응답:
{
  "status": "NOT_STARTED",
  "sessionId": null,
  "completedProblems": 0,
  "totalProblems": 10,
  "completedAt": null
}

# 시나리오 2: 진행 중 (7문제 완료)
{
  "status": "IN_PROGRESS",
  "sessionId": 123,
  "completedProblems": 7,
  "totalProblems": 10,
  "completedAt": null
}

# 시나리오 3: 완료
{
  "status": "COMPLETED",
  "sessionId": 123,
  "completedProblems": 10,
  "totalProblems": 10,
  "completedAt": "2024-01-09T15:30:00"
}
```

---

## 9. 마이그레이션 가이드

### 9.1 백엔드 구현 순서

1. ✅ **DayProblem 엔티티 수정** (5분)
   - `markAsCompleted()` 메서드 추가

2. ✅ **Repository 쿼리 메서드 추가** (10분)
   - `countByStudent_StudentIdAndAssignedDateAndIsCompleted()`
   - `findByStudent_StudentIdAndStudyTypeAndStartTimeBetween()`

3. ✅ **DTO 클래스 생성** (15분)
   - `SubmitAnswerRequest`
   - `AnswerResult`
   - `DailyStatusResponse`

4. ✅ **Service 로직 구현** (30분)
   - `submitProblemResults()`
   - `getDailyStatus()`

5. ✅ **Controller 엔드포인트 추가** (15분)
   - `POST /adventure/result`
   - `GET /adventure/daily/status`

6. ✅ **테스트 작성 및 검증** (30분)

### 9.2 프론트엔드 수정 순서

1. ✅ **API 함수 추가** (10분)
   - `getDailyStatus()` 함수 구현

2. ✅ **DailyRunner 수정** (20분)
   - localStorage 로직 제거
   - API 호출 로직 추가

3. ✅ **에러 처리 개선** (10분)
   - 404 에러 처리 제거
   - 정상 응답 처리

4. ✅ **테스트 및 검증** (20분)

---

## 10. 예상 효과

### ✅ 구현 후 기대 효과

1. **정확한 진행도 추적**
   - 문제를 풀었을 때 DB에 정확히 기록
   - 재진입 시 이미 푼 문제 건너뛰기

2. **UX 개선**
   - 완료 여부를 명확히 표시
   - "오늘의 문제는 이미 완료했어요!" 메시지

3. **데이터 무결성**
   - 중복 세션 방지
   - 같은 날짜에 한 번만 일일학습 가능

4. **여러 기기 동기화**
   - localStorage 대신 서버 상태 기반
   - 어디서나 동일한 진행 상태

5. **학습 분석 가능**
   - 문제별 완료 상태 추적
   - 학습 진행률 시각화
   - 통계 데이터 수집

---

## 11. 참고 자료

- 기존 코드 분석 결과: [분석 문서 위치]
- API 설계 원칙: RESTful API 디자인
- 트랜잭션 관리: Spring @Transactional
- JPA 쿼리 메서드: Spring Data JPA Query Methods

---

**작성일**: 2024-01-09
**최종 수정**: 2024-01-09
**작성자**: Claude (AI Assistant)
**검토 필요**: 백엔드 개발자, 프론트엔드 개발자
