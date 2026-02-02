// Photo Copy JavaScript - OCR 기능 구현

let extractedTextData = '';

// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const extractedTextContainer = document.getElementById('extractedTextContainer');
const extractedText = document.getElementById('extractedText');
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const processingProgress = document.getElementById('processingProgress');
const copyBtn = document.getElementById('copyBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const actionButtonsContainer = document.getElementById('actionButtonsContainer');

// 이벤트 리스너 등록
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
copyBtn.addEventListener('click', copyToClipboard);
resetBtn.addEventListener('click', reset);
downloadBtn.addEventListener('click', downloadText);

// 파일 선택 처리
function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    processImage(files[0]);
  }
}

// 드래그 오버 처리
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
}

// 드래그 리브 처리
function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
}

// 드롭 처리
function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processImage(files[0]);
  }
}

// 이미지 처리 및 OCR 실행
async function processImage(file) {
  // 파일 유효성 검사
  if (!file.type.startsWith('image/')) {
    showError('이미지 파일만 업로드할 수 있습니다.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showError('파일 크기가 10MB를 초과합니다.');
    return;
  }

  // 이미지 미리보기 표시
  const reader = new FileReader();
  reader.onload = async (e) => {
    imagePreview.src = e.target.result;
    imagePreviewContainer.classList.remove('hidden');
    imagePreviewContainer.classList.add('fade-in');
    
    // OCR 처리 시작
    await performOCR(e.target.result);
  };
  reader.readAsDataURL(file);
}

// OCR 처리 함수
async function performOCR(imageSource) {
  hideError();
  loadingContainer.classList.remove('hidden');
  extractedTextContainer.classList.add('hidden');
  actionButtonsContainer.classList.add('hidden');

  try {
    // Tesseract 초기화 및 실행
    const result = await Tesseract.recognize(
      imageSource,
      'kor+eng',
      {
        logger: (m) => {
          // 진행도 업데이트
          if (m.status === 'recognizing') {
            const progress = Math.round(m.progress * 100);
            processingProgress.textContent = `진행 중: ${progress}%`;
          }
        }
      }
    );

    // 추출된 텍스트 표시
    extractedTextData = result.data.text;
    extractedText.textContent = extractedTextData;
    
    loadingContainer.classList.add('hidden');
    extractedTextContainer.classList.remove('hidden');
    extractedTextContainer.classList.add('fade-in');
    actionButtonsContainer.classList.remove('hidden');
    actionButtonsContainer.classList.add('fade-in');

  } catch (error) {
    console.error('OCR 처리 중 에러:', error);
    showError('텍스트 추출 중 오류가 발생했습니다. 다시 시도해주세요.');
    loadingContainer.classList.add('hidden');
  }
}

// 클립보드에 복사
function copyToClipboard() {
  if (!extractedTextData) return;

  navigator.clipboard.writeText(extractedTextData).then(() => {
    // 복사 완료 알림
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ 복사됨!';
    copyBtn.classList.add('bg-green-500');
    copyBtn.classList.remove('bg-orange-500');
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('bg-green-500');
      copyBtn.classList.add('bg-orange-500');
    }, 2000);
  }).catch(() => {
    showError('클립보드에 복사할 수 없습니다.');
  });
}

// 텍스트 다운로드
function downloadText() {
  if (!extractedTextData) return;

  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(extractedTextData));
  element.setAttribute('download', 'extracted_text.txt');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// 다시 시작
function reset() {
  fileInput.value = '';
  extractedTextData = '';
  imagePreviewContainer.classList.add('hidden');
  extractedTextContainer.classList.add('hidden');
  actionButtonsContainer.classList.add('hidden');
  loadingContainer.classList.add('hidden');
  hideError();
  extractedText.textContent = '';
}

// 에러 표시
function showError(message) {
  errorMessage.textContent = message;
  errorContainer.classList.remove('hidden');
  errorContainer.classList.add('fade-in');
}

// 에러 숨김
function hideError() {
  errorContainer.classList.add('hidden');
}

// 페이지 로드 시 안내 메시지
window.addEventListener('load', () => {
  console.log('Photo Copy 도구가 준비되었습니다.');
  console.log('Tesseract.js를 사용한 OCR 처리 중...');
});
