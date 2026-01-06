# TimeBox Planner

미니멀한 타임박스 플래너 웹앱입니다.

## 기능

- **Top Priorities**: 오늘의 중요한 할 일 3가지 관리
- **Brain Dump**: 자유롭게 할 일을 나열하는 체크리스트
- **타임라인**: 06:00~24:00 시간대별 할 일 배치 (30분 단위)
- **메모**: 간단한 노트 작성
- **구글 캘린더 연동**: 타임라인의 할 일을 구글 캘린더에 자동 추가

## 구글 캘린더 연동 설정

구글 캘린더 연동 기능을 사용하려면 다음 단계를 따라주세요:

### 1. Google Cloud Console에서 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2. Google Calendar API 활성화

1. "API 및 서비스" > "라이브러리"로 이동
2. "Google Calendar API" 검색 후 활성화

### 3. OAuth 2.0 클라이언트 ID 생성

1. "API 및 서비스" > "사용자 인증 정보"로 이동
2. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
3. 애플리케이션 유형: "웹 애플리케이션" 선택
4. 승인된 JavaScript 원본에 `http://localhost` 또는 실제 도메인 추가
5. 승인된 리디렉션 URI에 `http://localhost` 추가
6. 생성된 클라이언트 ID 복사

### 4. API 키 생성

1. "API 및 서비스" > "사용자 인증 정보"로 이동
2. "사용자 인증 정보 만들기" > "API 키" 선택
3. 생성된 API 키 복사

### 5. 코드에 설정 적용

`script.js` 파일의 다음 부분을 수정하세요:

```javascript
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // 여기에 클라이언트 ID 입력
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // 여기에 API 키 입력
```

## 사용 방법

1. 브라우저에서 `index.html` 파일 열기
2. 날짜 입력 (예: `20240115` 또는 `2024-01-15`)
3. Top Priorities와 Brain Dump에 할 일 추가
4. 타임라인에 할 일 배치
5. "구글 캘린더 연동" 버튼 클릭하여 인증
6. 인증 후 "캘린더에 추가" 버튼으로 일정 동기화

## 데이터 저장

모든 데이터는 브라우저의 Local Storage에 저장되며, 새로고침해도 유지됩니다.

## 브라우저 호환성

최신 버전의 Chrome, Firefox, Safari, Edge에서 동작합니다.

