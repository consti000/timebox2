# 데이터베이스 설정 가이드

## 1. .env 파일 설정

`server/.env` 파일을 열고 PostgreSQL 비밀번호를 설정하세요:

```env
DB_PASSWORD=여기에_비밀번호_입력
```

**중요**: PostgreSQL 설치 시 설정한 `postgres` 사용자의 비밀번호를 입력하세요.

비밀번호를 모르는 경우:
- PostgreSQL 설치 시 설정한 비밀번호를 확인
- 또는 pgAdmin을 통해 비밀번호를 재설정

## 2. 데이터베이스 생성 및 초기화

다음 명령을 실행하세요:

```powershell
cd server
npm run setup-db
```

이 명령은 다음을 수행합니다:
1. `timebox` 데이터베이스 생성 (없는 경우)
2. 테이블 및 스키마 생성
3. 기본 사용자 생성

## 3. 연결 확인

서버를 실행하여 연결을 확인하세요:

```powershell
npm start
```

또는 개발 모드:

```powershell
npm run dev
```

브라우저에서 `http://localhost:3000/api/health`를 열어 데이터베이스 연결 상태를 확인할 수 있습니다.

## 문제 해결

### 비밀번호 오류
- `.env` 파일의 `DB_PASSWORD`가 올바른지 확인
- PostgreSQL 서비스가 실행 중인지 확인

### 데이터베이스 생성 권한 오류
- `postgres` 사용자로 로그인할 수 있는지 확인
- 또는 다른 관리자 사용자로 `.env`의 `DB_USER`를 변경

### 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인:
  ```powershell
  Get-Service postgresql*
  ```
- 서비스 시작:
  ```powershell
  Start-Service postgresql-x64-14  # 버전에 따라 다를 수 있음
  ```
