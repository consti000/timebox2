# 테스트 가이드

## 사전 준비

### 1. PostgreSQL 데이터베이스 설정
```bash
# PostgreSQL에 접속하여 데이터베이스 생성
createdb -U postgres timebox

# 또는 psql에서
psql -U postgres
CREATE DATABASE timebox;
\q
```

### 2. 환경 변수 설정
`server/.env` 파일을 생성하고 다음 내용을 추가:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timebox
DB_USER=postgres
DB_PASSWORD=your_password_here
DEFAULT_USERNAME=admin
DEFAULT_PASSWORD=password123
SESSION_SECRET=your-secret-key
```

### 3. 데이터베이스 초기화
```bash
cd server
npm install
npm run init-db
```

## 테스트 실행

### 1. 백엔드 서버 시작
```bash
cd server
npm run dev
```

서버가 정상적으로 시작되면:
- `http://localhost:3000`에서 API 서버 접근 가능
- 콘솔에 "✅ 데이터베이스 연결 확인 완료" 메시지 표시

### 2. 프론트엔드 서버 시작
새 터미널에서:
```bash
# 프로젝트 루트에서
python -m http.server 8000
```

또는:
```bash
# Node.js가 설치되어 있다면
npx http-server -p 8000
```

### 3. 브라우저에서 테스트
1. `http://localhost:8000` 접속
2. 자동으로 `http://localhost:8000/server/login.html`로 리다이렉트됨
3. 로그인 정보 입력:
   - 아이디: `admin`
   - 비밀번호: `password123`
4. 로그인 성공 시 메인 페이지로 이동
5. 데이터 입력 및 저장 테스트

## 테스트 시나리오

### 1. 로그인 테스트
- ✅ 올바른 아이디/비밀번호로 로그인
- ✅ 잘못된 아이디/비밀번호 입력 시 에러 메시지 표시
- ✅ 로그인 후 세션 유지 확인

### 2. 데이터 저장/로드 테스트
- ✅ Priority 항목 입력 및 저장
- ✅ Brain Dump 항목 추가 및 저장
- ✅ Timeline 블록 추가 및 저장
- ✅ 메모 작성 및 저장
- ✅ 페이지 새로고침 후 데이터 유지 확인

### 3. API 테스트
브라우저 개발자 도구 콘솔에서:
```javascript
// Health check
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log);

// 데이터 조회 (userId는 로그인 후 sessionStorage에서 확인)
const userId = sessionStorage.getItem('timeboxUserId');
fetch(`http://localhost:3000/api/data/load/${userId}/20240115`)
  .then(r => r.json())
  .then(console.log);
```

## 문제 해결

### 데이터베이스 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- `.env` 파일의 데이터베이스 설정 확인
- 데이터베이스가 생성되었는지 확인

### CORS 오류
- `server/server.js`의 `FRONTEND_URL` 설정 확인
- 브라우저 콘솔에서 CORS 에러 메시지 확인

### API 호출 실패
- 백엔드 서버가 실행 중인지 확인 (`http://localhost:3000/api/health`)
- 브라우저 개발자 도구 Network 탭에서 요청 확인
- 서버 콘솔에서 에러 로그 확인

## 개선 사항

### 완료된 개선 사항
1. ✅ 로그인 페이지가 백엔드 API 사용
2. ✅ 프론트엔드에서 백엔드 API 호출
3. ✅ 사용자 ID 관리 (sessionStorage)
4. ✅ 데이터 저장/로드 시 백엔드 API 사용
5. ✅ 로컬 스토리지 폴백 기능
6. ✅ 에러 처리 개선

### 향후 개선 사항
- [ ] JWT 토큰 기반 인증
- [ ] 비밀번호 해시화 (bcrypt)
- [ ] 세션 관리
- [ ] 데이터 동기화 개선
- [ ] 오프라인 모드 지원
- [ ] 자동 저장 기능
