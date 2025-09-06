const Tesseract = require('tesseract.js');
const path = require('path');

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('OCR 서비스 초기화 시작 (Tesseract.js 6.x)...');
      
      // Tesseract.js 6.x에서는 Worker가 이미 pre-loaded 상태
      this.worker = await Tesseract.createWorker(['eng', 'kor']);
      console.log('OCR Worker 생성 완료 (영어+한국어 지원)');
      
      this.isInitialized = true;
      console.log('OCR 서비스 초기화 완료');
    } catch (error) {
      console.warn('한국어 포함 초기화 실패, 영어만으로 재시도:', error);
      try {
        // 한국어 실패 시 영어만으로 초기화
        this.worker = await Tesseract.createWorker(['eng']);
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

  async recognizeText(imagePath) {
    if (!this.isInitialized) {
      console.log('OCR이 초기화되지 않음, 초기화 시도...');
      await this.initialize();
    }

    try {
      console.log(`OCR 텍스트 인식 시작: ${imagePath}`);
      
      const { data: { text, confidence } } = await this.worker.recognize(imagePath);
      
      console.log(`OCR 인식 완료 - 신뢰도: ${Math.round(confidence)}%`);
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