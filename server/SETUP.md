# PostgreSQL 데이터베이스 설정 가이드

## 1. PostgreSQL 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성합니다.

### 방법 1: psql 명령줄 사용

```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE timebox;

# 종료
\q
```

### 방법 2: createdb 명령 사용

```bash
createdb -U postgres timebox
```

## 2. 환경 변수 설정

`server/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 서버 포트
PORT=3000

# 환경 설정
NODE_ENV=development

# 프론트엔드 URL
FRONTEND_URL=http://localhost:8000

# PostgreSQL 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timebox
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# 기본 사용자 설정 (초기화 시 생성됨)
DEFAULT_USERNAME=admin
DEFAULT_PASSWORD=password123

# 세션 시크릿 키
SESSION_SECRET=timebox-planner-secret-key-change-in-production
```

**중요**: `DB_PASSWORD`를 실제 PostgreSQL 비밀번호로 변경하세요!

## 3. 데이터베이스 초기화

다음 명령을 실행하여 테이블을 생성합니다:

```bash
cd server
npm run init-db
```

이 명령은 다음을 수행합니다:
- `users` 테이블 생성
- `user_data` 테이블 생성
- 인덱스 및 트리거 생성
- 기본 사용자 생성 (선택사항)

## 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 5. 연결 확인

서버가 실행되면 다음 엔드포인트로 데이터베이스 연결을 확인할 수 있습니다:

```
GET http://localhost:3000/api/health
```

응답에 `"database": "connected"`가 포함되어 있으면 정상적으로 연결된 것입니다.

## 문제 해결

### 연결 오류가 발생하는 경우

1. PostgreSQL 서비스가 실행 중인지 확인
2. 데이터베이스가 생성되었는지 확인
3. `.env` 파일의 데이터베이스 설정이 올바른지 확인
4. PostgreSQL의 `pg_hba.conf` 파일에서 로컬 연결이 허용되어 있는지 확인

### Windows에서 PostgreSQL 확인

```powershell
# PostgreSQL 서비스 상태 확인
Get-Service postgresql*

# PostgreSQL 서비스 시작
Start-Service postgresql-x64-14  # 버전에 따라 다를 수 있음
```
