# TimeBox Planner - 백엔드 서버

TimeBox Planner의 Express.js 기반 백엔드 서버입니다.

## 📋 요구사항

- Node.js (v14 이상 권장)
- npm 또는 yarn
- PostgreSQL (v12 이상 권장)

## 🚀 설치 및 실행

### 1. PostgreSQL 데이터베이스 설정

PostgreSQL에서 데이터베이스를 생성합니다:

```sql
-- PostgreSQL에 접속 후 실행
CREATE DATABASE timebox;
```

또는 psql 명령줄에서:
```bash
createdb timebox
```

### 2. 의존성 설치

```bash
cd server
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
# Windows PowerShell
Copy-Item .env.example .env

# 또는 직접 .env 파일 생성
```

`.env` 파일에 다음 내용을 추가하세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timebox
DB_USER=postgres
DB_PASSWORD=your_password_here

# 기본 사용자 설정 (초기화 시 생성됨)
DEFAULT_USERNAME=admin
DEFAULT_PASSWORD=password123
```

### 4. 데이터베이스 초기화

테이블 생성 및 기본 데이터 설정:

```bash
npm run init-db
```

이 명령은 다음을 수행합니다:
- 데이터베이스 테이블 생성 (users, user_data)
- 인덱스 및 트리거 생성
- 기본 사용자 생성 (선택사항)

### 5. 서버 실행

#### 개발 모드 (nodemon 사용 - 파일 변경 시 자동 재시작)
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm start
```

서버가 실행되면 기본적으로 `http://localhost:3000`에서 접근할 수 있습니다.

## 📁 프로젝트 구조

```
server/
├── server.js          # 메인 서버 파일
├── package.json       # 프로젝트 설정 및 의존성
├── .env              # 환경 변수 (Git에 포함되지 않음)
├── .env.example      # 환경 변수 예시
├── config/           # 설정 파일
│   └── database.js  # 데이터베이스 연결 설정
├── database/         # 데이터베이스 관련
│   ├── schema.sql   # 데이터베이스 스키마
│   └── init.js      # 데이터베이스 초기화 스크립트
├── routes/           # API 라우트
│   ├── auth.js      # 인증 관련 라우트
│   └── data.js      # 데이터 관련 라우트
└── README.md        # 이 파일
```

## 🔌 API 엔드포인트

### 기본
- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크

### 인증 (`/api/auth`)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/check` - 로그인 상태 확인

### 데이터 (`/api/data`)
- `POST /api/data/save` - 데이터 저장
  - Body: `{ userId, date, data }`
- `GET /api/data/load/:userId/:date?` - 데이터 조회
  - 특정 날짜: `/api/data/load/:userId/:date`
  - 전체 데이터: `/api/data/load/:userId`
- `DELETE /api/data/delete/:userId/:date` - 데이터 삭제

## 🔧 개발 팁

- `nodemon`을 사용하면 파일 변경 시 서버가 자동으로 재시작됩니다.
- 환경 변수는 `.env` 파일에서 관리합니다.
- CORS 설정은 `server.js`에서 프론트엔드 URL에 맞게 조정할 수 있습니다.

## 📝 다음 단계

- [ ] 데이터베이스 연동 (MongoDB, PostgreSQL 등)
- [ ] JWT 토큰 기반 인증 구현
- [ ] 세션 관리
- [ ] 데이터 검증 및 보안 강화
- [ ] 로깅 시스템 추가
- [ ] 테스트 코드 작성
