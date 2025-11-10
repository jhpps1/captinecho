-- 대분류 관심사 삽입
INSERT INTO major_interest (major_interest_name) VALUES
  ('스포츠'),
  ('예술'),
  ('학습'),
  ('음악'),
  ('게임');

-- 소분류 관심사 삽입
-- 스포츠
INSERT INTO sub_interest (major_interest_id, small_interest_name) VALUES
  (1, '축구'),
  (1, '농구'),
  (1, '야구'),
  (1, '배드민턴'),
  (1, '수영'),
  (1, '태권도'),
  (1, '탁구');

-- 예술
INSERT INTO sub_interest (major_interest_id, small_interest_name) VALUES
  (2, '그림 그리기'),
  (2, '만들기'),
  (2, '색칠하기'),
  (2, '점토 공예'),
  (2, '종이접기'),
  (2, '레고');

-- 학습
INSERT INTO sub_interest (major_interest_id, small_interest_name) VALUES
  (3, '독서'),
  (3, '수학'),
  (3, '과학'),
  (3, '영어'),
  (3, '한글'),
  (3, '역사');

-- 음악
INSERT INTO sub_interest (major_interest_id, small_interest_name) VALUES
  (4, '노래 부르기'),
  (4, '피아노'),
  (4, '바이올린'),
  (4, '드럼'),
  (4, '기타'),
  (4, '우쿨렐레');

-- 게임
INSERT INTO sub_interest (major_interest_id, small_interest_name) VALUES
  (5, '보드게임'),
  (5, '퍼즐'),
  (5, '숨바꼭질'),
  (5, '술래잡기'),
  (5, '블록 쌓기'),
  (5, '카드게임');
