# ScrapFlow

스크린샷 기반 스크랩북 데스크톱 애플리케이션

## 📋 프로젝트 개요

**서비스명**: ScrapFlow  
**목적**: 아티클/뉴스레터 내용의 휘발성 방지를 위한 스크린샷 기반 스크랩북  
**플랫폼**: 데스크톱 앱 (Windows, macOS, Linux 지원)

## 🎯 MVP 핵심 기능

### 1. 스크린샷 + 즉시 코멘트
- 단축키로 스크린샷 캡처 (Ctrl+Shift+S)
- 캡처 즉시 코멘트 작성 팝업 표시
- 빠른 메모 입력 후 저장

### 2. 카테고리 분류 저장
- 저장 시 카테고리 선택
- 기존 카테고리 선택 또는 새 카테고리 생성
- 카테고리별 색상 지정

### 3. 스크랩 모아보기
- 카테고리별 필터링
- 날짜별 조회 (오늘/이번주/이번달/전체)
- 그리드 형태로 스크랩 목록 표시

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

### 프레임워크
- **Electron**: 메인 프레임워크
- **React**: UI 컴포넌트
- **Tailwind CSS**: 스타일링

### 핵심 라이브러리
- **electron-screenshot-desktop**: 스크린샷 캡처
- **SQLite**: 로컬 데이터베이스
- **react-hot-toast**: 알림 시스템

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

### 설치
```bash
npm install
```

### 개발
```bash
npm start
```

### 빌드
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

## 💾 데이터 모델

### 스크랩 테이블
```javascript
{
  id: number,           // 고유 ID
  image_path: string,   // 이미지 파일 경로
  comment: string,      // 사용자 코멘트
  category: string,     // 카테고리명
  created_at: datetime  // 생성일시
}
```

### 카테고리 테이블
```javascript
{
  name: string,    // 카테고리명 (Primary Key)
  color: string,   // 표시 색상 (#hex)
  count: number    // 스크랩 개수
}
```