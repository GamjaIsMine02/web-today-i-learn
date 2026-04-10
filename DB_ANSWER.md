# 1. 실습 문제 정답

## 문제 1: 테이블 생성하기 (CREATE TABLE)

- 중복 데이터가 쌓이는 컬럼: nickname

- 크루 정보 추출 쿼리:

```SQL
SELECT DISTINCT crew_id, nickname FROM attendance;
```

- 최종 crew 테이블 생성:

```SQL
CREATE TABLE crew (
crew_id INT NOT NULL AUTO_INCREMENT,
nickname VARCHAR(50) NOT NULL,
PRIMARY KEY (crew_id)
);
```

- crew 테이블에 데이터 삽입:

```SQL
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT crew_id, nickname FROM attendance;
```

## 문제 2: 테이블 컬럼 삭제하기 (ALTER TABLE)

- 불필요해지는 컬럼: nickname

- 컬럼 삭제 쿼리:

```SQL
ALTER TABLE attendance DROP COLUMN nickname;
```

## 문제 3: 외래키 설정하기

- 존재하지 않는 크루의 출석 기록을 방지하기 위한 외래키 설정:

```SQL
ALTER TABLE attendance
ADD CONSTRAINT fk_crew_id
FOREIGN KEY (crew_id) REFERENCES crew(crew_id);
```

## 문제 4: 유니크 키 설정

- 닉네임 중복 방지 제약조건:

```SQL
ALTER TABLE crew ADD UNIQUE (nickname);
[DML(CRUD) 실습] (참고: 아래 문제부터는 attendance 테이블에 nickname이 없다고 가정하고 서브쿼리나 JOIN을 활용합니다.)
```

## 문제 5: 크루 닉네임 검색하기 (LIKE)

```SQL
SELECT \* FROM crew WHERE nickname LIKE '디%';
```

## 문제 6: 출석 기록 확인하기 (SELECT + WHERE)

```SQL
SELECT \* FROM attendance
WHERE attendance_date = '2025-03-06'
AND crew_id = (SELECT crew_id FROM crew WHERE nickname = '어셔');
```

## 문제 7: 누락된 출석 기록 추가 (INSERT)

```SQL
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (
(SELECT crew_id FROM crew WHERE nickname = '어셔'),
'2025-03-06', '09:31', '18:01'
);
```

## 문제 8: 잘못된 출석 기록 수정 (UPDATE)

```SQL
UPDATE attendance
SET start_time = '10:00'
WHERE attendance_date = '2025-03-12'
AND crew_id = (SELECT crew_id FROM crew WHERE nickname = '주니');
```

## 문제 9: 허위 출석 기록 삭제 (DELETE)

```SQL
DELETE FROM attendance
WHERE attendance_date = '2025-03-12'
AND crew_id = (SELECT crew_id FROM crew WHERE nickname = '아론');
```

## 문제 10: 출석 정보 조회하기 (JOIN)

```SQL
SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM attendance AS a
JOIN crew AS c ON a.crew_id = c.crew_id
WHERE c.nickname = '검프';
```

## 문제 11: nickname으로 쿼리 처리하기 (서브 쿼리)

```SQL
SELECT \* FROM attendance
WHERE crew_id = (SELECT crew_id FROM crew WHERE nickname = '검프');
```

## 문제 12: 가장 늦게 하교한 크루 찾기

```SQL
SELECT c.nickname, a.end_time
FROM attendance AS a
JOIN crew AS c ON a.crew_id = c.crew_id
WHERE a.attendance_date = '2025-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

## 문제 13: 크루별로 '기록된' 날짜 수 조회

```SQL
SELECT crew_id, COUNT(attendance_date) AS total_days
FROM attendance
GROUP BY crew_id;
```

## 문제 14: 크루별로 등교 기록이 있는 날짜 수 조회

```SQL
SELECT crew_id, COUNT(start_time) AS attended_days
FROM attendance
GROUP BY crew_id;
```

## 문제 15: 날짜별로 등교한 크루 수 조회

```SQL
SELECT attendance_date, COUNT(crew_id) AS crew_count
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY attendance_date;
```

## 문제 16: 크루별 가장 빠른 등교 시각과 가장 늦은 등교 시각

```SQL
SELECT crew_id, MIN(start_time) AS earliest_time, MAX(start_time) AS latest_time
FROM attendance
GROUP BY crew_id;
```

# 2. 생각해 보기

1. 기본키란 무엇이고 왜 필요한가?

- Primary Key는 테이블 내의 각 행을 식별할 수 있는 유일한 값이므로, 특정 데이터 수정, 삭제 시 기준점으로 사용된다. 기본키가 없다면 무결성 문제가 발생된다.

2. MySQL에서 사용되는 AUTO_INCREMENT는 왜 필요할까?

- 개발자가 데이터를 넣을 때마다 1씩 더해서 id값을 입력하는 것은 번거로운 일이기 때문이다. 개발의 편의성을 제공한다.

3. 학생이 등교는 했지만 하교 버튼을 누르지 않았을 때, end_time에 NULL이 저장된다. NULL 값을 처리할 때 주의할 점은?

- SQL에서 NULL은 아예 없다는 뜻이다. 그래서 NULL을 비교하는 것이 불가능해서 IS NULL과 같은 식으로 작성해야 한다.

4. crew와 attendance 테이블의 관계를 ER 다이어그램으로 시각화해보자. 이 관계를 일상 생활의 예시로 비유한다면 어떤 것이 있을까?

- 크루 한 명이 여러 번의 출석 기록을 가질 수 있기 때문에 두 테이블은 1:N 관계이다. 일상 생활의 예시로는 "TodoList 앱의 사용자 1명의 여러 개의 할 일"

5. 출석 시스템에서 동시에 100명이 등교 버튼을 누른다면 어떤 일이 일어날까? 이 문제를 2026 공통강의 - DB에서 배운 트랜잭션과 ACID 속성으로 설명해보자.

- 동시에 여러 요청이 발생할 때, ACID라는 속성을 적용해서 데이터의 간섭을 막고 에러 발생 시 데이터를 복구하는 과정을 거친다.

6. 출석 데이터가 파일(CSV)이 아닌 데이터베이스에 저장되는 이유는 무엇일까? 파일 시스템으로 출석을 관리했다면 어떤 문제가 생길까?

- 동시성 문제로 인해 동시에 2명이 출석기록을 남기면 데이터가 사라질 수 있다. 인덱싱이 없어 탐색이 느리다.

7. 출석 데이터를 관계형 DB가 아닌 NoSQL(예: MongoDB)로 저장한다면 테이블 구조가 어떻게 달라질까? 어떤 장단점이 있을까?

- NoSQL 구조에서는 테이블을 쪼개지 않고 배열로 묶을 수 있다. 따라서 자유로운 구조에 대해 편리하게 사용할 수 있다. 그러나 자유로운 만큼 엄격함이 사라진다는 단점이 존재한다.

🧐 더 생각해 보기 (심화) 해설

1. 왜 crew 테이블에서 nickname을 기본키로 하지 않은 걸까? attendance 테이블에 attendance_id가 존재하는 이유는 무엇일까?

- 닉네임은 언제나 변경될 수 있기 때문에 변하지 않는 불변값으로는 id가 적절하다.

2. 데이터베이스 제약 조건 중 RESTRICT, CASCADE는 무엇인가?

- 외래키 제약 조건 옵션이다. RESTRICT는 출석에 기록이 남아있으면 해당하는 크루를 삭제하지 못하도록 막고, CASCADE는 크루가 삭제될 때 그 크루 기록까지 모두 삭제한다.

3. 다음 두 쿼리는 동일한 결과를 반환하지만 성능에 차이가 있다. 어떤 차이가 있으며, 어떤 상황에서 각각 유리할까?

```SQL
-- 쿼리 1: 서브쿼리 사용
SELECT * FROM attendance WHERE crew_id IN (SELECT crew_id FROM crew WHERE nickname LIKE '네%');

-- 쿼리 2: JOIN 사용
SELECT a.* FROM attendance a JOIN crew c ON a.crew_id = c.crew_id WHERE c.nickname LIKE '네%';
```

- 일반적으로 JOIN이 유리하지만, 필터링 시에는 서브쿼리가 직관적이다.

4. attendance 테이블을 완전히 정규화하면 어떤 장점이 있을까? 반대로 일부 비정규화를 적용한다면 어떤 쿼리 성능 이점을 얻을 수 있을까?

- 정규화 시 테이블 분리가 되므로 일부 변경 시 수정사항이 적어진다..? 잘 모르겠다.

5. 출석 시스템이 수백 명의 사용자에 의해 동시에 접근된다면, 연결 풀링(connection pooling)은 무엇이고 왜 필요한가?

- 미리 일정 개수의 연결을 만들어 놓으므로 동시 접근하는 사용자가 많아져도 서버의 부하를 줄여준다.

6. 실습에서 수행한 INSERT, UPDATE, DELETE를 하나의 트랜잭션으로 묶는다면 어떻게 작성할 수 있을까? 만약 DELETE 도중 오류가 발생하면 앞서 수행한 INSERT와 UPDATE는 어떻게 되어야 할까?

- 원자성 보장

```SQL
START TRANSACTION;
INSERT INTO ...;
UPDATE ...;
DELETE ...;
ROLLBACK;
```
