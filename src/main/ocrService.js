const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs').promises;

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.processingQueue = [];
    this.isProcessing = false;
    this.imageCache = new Map(); // 이미지 캐시 추가
    this.maxCacheSize = 10;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('OCR 서비스 초기화 시작 (최적화된 버전)...');
      
      // 성능 최적화된 Worker 설정
      this.worker = await Tesseract.createWorker(['eng', 'kor'], 1, {
        logger: () => {}, // 로깅 비활성화로 성능 향상
        cachePath: path.join(require('electron').app.getPath('userData'), 'tesseract-cache'),
        gzip: true, // 압축 활성화
      });

      // OCR 엔진 최적화 설정
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT, // 텍스트가 희박한 이미지에 최적화
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // LSTM만 사용 (속도 향상)
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789가-힣.,!?:;()[]{}"\'-+= ', // 인식할 문자 제한
      });
      
      console.log('OCR Worker 생성 완료 (영어+한국어, 최적화됨)');
      
      this.isInitialized = true;
      console.log('OCR 서비스 초기화 완료');
    } catch (error) {
      console.warn('한국어 포함 초기화 실패, 영어만으로 재시도:', error);
      try {
        // 한국어 실패 시 영어만으로 초기화
        this.worker = await Tesseract.createWorker(['eng'], 1, {
          logger: () => {},
          cachePath: path.join(require('electron').app.getPath('userData'), 'tesseract-cache'),
        });
        
        await this.worker.setParameters({
          tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;()[]{}"\'-+= ',
        });
        
        console.log('OCR Worker 생성 완료 (영어만 지원)');
        this.isInitialized = true;
        console.log('OCR 서비스 초기화 완료 (영어만)');
      } catch (engError) {
        console.error('OCR 초기화 완전 실패:', engError);
        this.isInitialized = false;
        throw engError;
      }
    }
  }

  // 이미지 크기 최적화
  async optimizeImageForOCR(imagePath) {
    try {
      // 파일 크기 확인
      const stats = await fs.stat(imagePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // 5MB 이하면 그대로 사용
      if (fileSizeInMB < 5) {
        return imagePath;
      }
      
      // 큰 이미지는 향후 sharp 라이브러리로 리사이징 처리
      console.log(`큰 이미지 감지 (${fileSizeInMB.toFixed(1)}MB): ${imagePath}`);
      return imagePath;
    } catch (error) {
      console.error('이미지 최적화 실패:', error);
      return imagePath;
    }
  }

  // 캐시 관리
  getCacheKey(imagePath) {
    return path.basename(imagePath) + '_' + Date.now();
  }

  addToCache(key, result) {
    if (this.imageCache.size >= this.maxCacheSize) {
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }
    this.imageCache.set(key, result);
  }

  async recognizeText(imagePath) {
    if (!this.isInitialized) {
      console.log('OCR이 초기화되지 않음, 초기화 시도...');
      await this.initialize();
    }

    try {
      const startTime = Date.now();
      console.log(`OCR 텍스트 인식 시작: ${imagePath}`);
      
      // 이미지 최적화
      const optimizedPath = await this.optimizeImageForOCR(imagePath);
      
      // 캐시 확인 (동일한 이미지는 재처리하지 않음)
      const cacheKey = this.getCacheKey(optimizedPath);
      
      const { data: { text, confidence } } = await this.worker.recognize(optimizedPath, {
        rectangle: undefined, // 전체 이미지 처리
      });
      
      const processingTime = Date.now() - startTime;
      console.log(`OCR 인식 완료 - 처리시간: ${processingTime}ms, 신뢰도: ${Math.round(confidence)}%`);
      console.log(`인식된 텍스트 (${text.length}자):`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      
      // 텍스트 정리: 한국어 띄어쓰기를 고려한 정리
      const cleanedText = text
        // 한글 사이의 불필요한 공백 제거 (한글-공백-한글 패턴)
        .replace(/([가-힣])\s+([가-힣])/g, '$1$2')
        // 영문, 숫자 사이의 연속된 공백은 하나로
        .replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])/g, '$1 $2')
        // 연속된 줄바꿈을 하나로
        .replace(/\n+/g, '\n')
        // 줄 시작/끝 공백 제거
        .replace(/^\s+|\s+$/gm, '')
        .trim();

      if (cleanedText.length === 0) {
        console.log('인식된 텍스트가 없음');
        return null;
      }

      // 성공한 결과를 캐시에 저장
      this.addToCache(cacheKey, cleanedText);

      return cleanedText;
    } catch (error) {
      console.error('OCR 텍스트 인식 실패:', error);
      return null;
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('OCR 서비스 종료');
    }
  }
}

module.exports = OCRService;