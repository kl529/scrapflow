# 📚 ScrapFlow

> 스크린샷으로 생각을 기록하고 정리하는 스마트한 방법

ScrapFlow는 일상 속에서 마주치는 영감, 아이디어, 중요한 정보들을 스크린샷으로 쉽게 캡처하고 체계적으로 관리할 수 있도록 도와주는 크로스 플랫폼 데스크톱 애플리케이션입니다.

## 📋 프로젝트 개요

**서비스명**: ScrapFlow  
**목적**: 아티클/뉴스레터 내용의 휘발성 방지를 위한 스크린샷 기반 스크랩북  
**플랫폼**: 데스크톱 앱 (Windows, macOS, Linux 지원)

## ✨ 주요 기능

### 🚀 핵심 기능
- **빠른 스크린샷 캡처**: `Ctrl+Shift+S` (Windows/Linux) 또는 `Cmd+Shift+S` (Mac) 단축키
- **생각 정리**: 캡처한 스크린샷에 개인적인 코멘트와 메모 추가
- **카테고리 관리**: 개발, 디자인, 비즈니스 등 다양한 카테고리로 체계적인 분류
- **스마트 검색**: 코멘트와 OCR 텍스트에서 실시간 검색 (대소문자 구분 없음)

### 🤖 지능형 기능
- **자동 OCR 텍스트 추출**: Tesseract.js 6.x 기반 영어/한국어 텍스트 인식
- **실시간 업데이트**: 스크랩 추가/삭제 시 UI 즉시 반영
- **날짜별 필터링**: 오늘, 이번 주, 이번 달 기준 필터링
- **활동 통계**: GitHub 스타일 히트맵으로 활동 시각화

### 🎯 사용자 경험
- **스크랩 상세 보기**: 큰 화면에서 이미지와 OCR 텍스트 확인
- **직관적인 UI**: React + Tailwind CSS 기반 모던 인터페이스
- **크로스 플랫폼**: Windows, macOS, Linux 지원

## 🔄 사용자 워크플로우

1. 앱 실행 → 백그라운드 상주 (시스템 트레이)
2. 단축키 (Ctrl+Shift+S) → 스크린샷 모드 활성화
3. 드래그로 영역 선택 → 캡처
4. 팝업 창 즉시 표시:
   - 캡처된 이미지 미리보기
   - 코멘트 입력창 (자동 포커스)
   - [저장] [취소] 버튼
5. 저장 클릭 → 카테고리 선택 모달
   - 기존 카테고리 선택 or 새 카테고리 생성
   - [완료] 클릭하면 저장 완료
6. 메인 앱 창에서 스크랩 조회
   - 사이드바: 카테고리 목록
   - 메인: 선택된 카테고리의 스크랩들
   - 상단: 날짜 필터

## 🛠️ 기술 스택

### Frontend
- **React 18**: 컴포넌트 기반 UI 프레임워크
- **React Router 6**: 클라이언트 사이드 라우팅
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React Hot Toast**: 사용자 알림 시스템
- **date-fns**: 날짜/시간 처리

### Backend & Desktop
- **Electron 26**: 크로스 플랫폼 데스크톱 앱 프레임워크
- **Better SQLite3**: 로컬 데이터베이스
- **Tesseract.js 6.x**: OCR 텍스트 추출 엔진
- **screenshot-desktop**: 스크린샷 캡처

### Build & Development
- **Electron Builder**: 앱 패키징 및 배포
- **Concurrently**: 병렬 프로세스 실행
- **Wait-on**: 개발 서버 대기

## 🌍 플랫폼 지원

### 지원 플랫폼
- Windows 7/10/11 (x64, x86, arm64)
- macOS 10.11+ (Intel, Apple Silicon M1/M2)
- Linux (Ubuntu, Debian, Fedora 등)

### 플랫폼별 특징
- **Windows**: .exe 인스톨러, 시작프로그램 등록
- **macOS**: .dmg 패키지, 메뉴바 앱 형태 가능
- **공통**: 시스템 트레이 지원, 전역 단축키

## 🚀 시작하기

### 다운로드
[Releases 페이지](https://github.com/kl529/scrapflow/releases)에서 OS에 맞는 파일을 다운로드하세요:
- **macOS**: `.dmg` 파일
- **Windows**: `.exe` 파일  
- **Linux**: `.AppImage` 파일

### macOS 설치 시 주의사항
macOS에서 "Apple은 'ScrapFlow'에 악성 코드가 없음을 확인할 수 없습니다" 경고가 나타날 수 있습니다.

**해결 방법:**
1. **시스템 설정** → **개인정보 보호 및 보안** → **보안**
2. **"확인되지 않은 개발자의 ScrapFlow를 열겠습니까?"** 알림에서 **"열기"** 클릭

또는 터미널에서:
```bash
sudo xattr -rd com.apple.quarantine /Applications/ScrapFlow.app
```

### 개발자용

#### 설치
```bash
npm install
```

#### 개발
```bash
npm start
```

#### 빌드
```bash
# Windows
npm run build-win

# macOS
npm run build-mac

# 모든 플랫폼
npm run build-all
```

## 📁 프로젝트 구조

```
scrapflow/
├── src/
│   ├── main/           # Electron 메인 프로세스
│   ├── renderer/       # React 렌더러 프로세스
│   ├── shared/         # 공통 유틸리티
│   └── assets/         # 정적 자산
├── docs/               # 문서
├── build/              # 빌드 출력
└── dist/               # 배포 파일
```

## 💾 데이터 구조

### 데이터베이스 테이블

#### scraps 테이블
```sql
CREATE TABLE scraps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_path TEXT NOT NULL,
  comment TEXT,
  category TEXT NOT NULL,
  ocr_text TEXT,                      -- OCR 추출 텍스트
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### categories 테이블
```sql
CREATE TABLE categories (
  name TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
```

### 저장 위치
- **macOS**: `~/Library/Application Support/scrapflow/`
- **Windows**: `%APPDATA%/scrapflow/`
- **Linux**: `~/.config/scrapflow/`

### 파일 구조
- `scrapflow.db`: SQLite 데이터베이스 (메타데이터)
- `screenshots/`: 캡처된 이미지 파일들
- 기타 Electron 설정 파일들

## 🔧 주요 구현 사항

### 검색 시스템
- **실시간 검색**: 300ms 디바운싱으로 성능 최적화
- **대소문자 무시**: SQLite `COLLATE NOCASE` 활용
- **다중 필드 검색**: 코멘트 + OCR 텍스트 동시 검색
- **NULL 값 처리**: 명시적 NULL 체크로 정확한 검색 결과

### OCR 시스템
- **Tesseract.js 6.x 호환**: 최신 API 구조 대응
- **다국어 지원**: 영어 + 한국어 동시 인식
- **비동기 처리**: 메인 UI 블로킹 없는 백그라운드 처리
- **에러 처리**: 언어 모델 로딩 실패 시 영어만으로 폴백

### 실시간 업데이트
- **IPC 이벤트**: 스크랩 저장 시 메인 윈도우에 알림
- **Focus 이벤트**: 윈도우 포커스 시 자동 데이터 새로고침
- **상태 동기화**: 카테고리 개수와 스크랩 목록 실시간 반영

### 개발 참고사항
- **Tesseract.js DataCloneError**: Worker 생성 시 logger 함수 제거로 해결
- **검색 필터링 오류**: SQLite NULL 값 명시적 처리로 해결
- **빌드 파일 동기화**: `npm run copy-main`으로 소스-빌드 동기화
- **macOS 스크린샷 권한**: 화면 녹화 권한 필요