/**
 * Aplica pré-processamento de imagem para melhorar o OCR
 */

export interface ImageProcessingOptions {
  contrast?: number; // 0-2, padrão 1.2
  brightness?: number; // -100 a 100, padrão 10
  grayscale?: boolean; // padrão true
  threshold?: number; // 0-255, padrão 128 (binarização)
  sharpen?: boolean; // padrão true
}

/**
 * Aplica filtros de processamento de imagem no canvas
 */
export function processImageForOCR(
  canvas: HTMLCanvasElement,
  options: ImageProcessingOptions = {}
): HTMLCanvasElement {
  const {
    contrast = 1.2,
    brightness = 10,
    grayscale = true,
    threshold,
    sharpen = true,
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Aplicar filtros
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Ajustar brilho
    r = Math.min(255, Math.max(0, r + brightness));
    g = Math.min(255, Math.max(0, g + brightness));
    b = Math.min(255, Math.max(0, b + brightness));

    // Ajustar contraste
    r = Math.min(255, Math.max(0, (r - 128) * contrast + 128));
    g = Math.min(255, Math.max(0, (g - 128) * contrast + 128));
    b = Math.min(255, Math.max(0, (b - 128) * contrast + 128));

    // Converter para escala de cinza
    if (grayscale) {
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      r = g = b = gray;
    }

    // Aplicar threshold (binarização)
    if (threshold !== undefined) {
      const avg = (r + g + b) / 3;
      const value = avg > threshold ? 255 : 0;
      r = g = b = value;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  // Aplicar nitidez (sharpen)
  if (sharpen && !threshold) {
    const sharpenedData = applySharpen(imageData);
    ctx.putImageData(sharpenedData, 0, 0);
  } else {
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
}

/**
 * Aplica filtro de nitidez (sharpen) na imagem
 */
function applySharpen(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const newData = new Uint8ClampedArray(data);

  // Kernel de nitidez
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[idx] * kernel[ki];
            ki++;
          }
        }

        const idx = (y * width + x) * 4 + c;
        newData[idx] = Math.min(255, Math.max(0, sum));
      }
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Aumenta a resolução da imagem para melhorar o OCR
 */
export function upscaleImage(
  canvas: HTMLCanvasElement,
  scale: number = 2
): HTMLCanvasElement {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width * scale;
  newCanvas.height = canvas.height * scale;
  const ctx = newCanvas.getContext('2d');

  if (!ctx) return canvas;

  // Usar imageSmoothingEnabled para melhor qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);

  return newCanvas;
}

/**
 * Interface para área detectada
 */
export interface DetectedTextArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Detecta a área de texto (quadrado branco) na imagem da carta MTG
 */
export function detectTextArea(canvas: HTMLCanvasElement): DetectedTextArea | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Converter para escala de cinza e aplicar threshold para encontrar áreas brancas
  const grayData: number[] = [];
  const threshold = 200; // Limiar para considerar como "branco"

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    grayData.push(gray > threshold ? 255 : 0);
  }

  // Encontrar o maior retângulo branco (área de texto)
  let maxArea = 0;
  let bestRect: DetectedTextArea | null = null;

  // Usar técnica de "largest rectangle in histogram" adaptada
  // Primeiro, encontrar linhas horizontais de pixels brancos
  const whiteRows: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      row.push(grayData[idx] === 255);
    }
    whiteRows.push(row);
  }

  // Encontrar o maior retângulo branco contíguo
  // Usar uma abordagem mais simples: encontrar a maior área retangular branca
  for (let startY = 0; startY < height; startY++) {
    for (let startX = 0; startX < width; startX++) {
      if (!whiteRows[startY][startX]) continue;

      // Expandir para a direita
      let maxWidth = 0;
      for (let x = startX; x < width && whiteRows[startY][x]; x++) {
        maxWidth++;
      }

      // Expandir para baixo
      let maxHeight = 1;
      let currentWidth = maxWidth;

      for (let y = startY + 1; y < height; y++) {
        let rowWidth = 0;
        for (let x = startX; x < startX + currentWidth && x < width; x++) {
          if (whiteRows[y][x]) {
            rowWidth++;
          } else {
            break;
          }
        }

        if (rowWidth < currentWidth) {
          currentWidth = rowWidth;
        }

        if (currentWidth === 0) break;

        maxHeight++;
      }

      const area = currentWidth * maxHeight;
      if (area > maxArea && currentWidth > width * 0.2 && maxHeight > height * 0.1) {
        maxArea = area;
        bestRect = {
          x: startX,
          y: startY,
          width: currentWidth,
          height: maxHeight,
        };
      }
    }
  }

  // Se não encontrou, usar uma abordagem alternativa: detectar bordas
  if (!bestRect || maxArea < (width * height * 0.1)) {
    return detectTextAreaByEdges(canvas);
  }

  // Adicionar padding para garantir que pegamos todo o texto
  const padding = Math.min(width, height) * 0.05;
  return {
    x: Math.max(0, bestRect.x - padding),
    y: Math.max(0, bestRect.y - padding),
    width: Math.min(width - bestRect.x + padding, bestRect.width + padding * 2),
    height: Math.min(height - bestRect.y + padding, bestRect.height + padding * 2),
  };
}

/**
 * Detecta área de texto usando detecção de bordas (método alternativo)
 */
function detectTextAreaByEdges(canvas: HTMLCanvasElement): DetectedTextArea | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;

  // Aplicar threshold para encontrar áreas claras
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return null;

  tempCtx.drawImage(canvas, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Encontrar limites da área branca/clara
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  const threshold = 180;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      if (gray > threshold) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // Verificar se encontrou uma área válida
  if (maxX > minX && maxY > minY) {
    const areaWidth = maxX - minX;
    const areaHeight = maxY - minY;

    // Verificar se a área é grande o suficiente
    if (areaWidth > width * 0.2 && areaHeight > height * 0.1) {
      return {
        x: minX,
        y: minY,
        width: areaWidth,
        height: areaHeight,
      };
    }
  }

  return null;
}

/**
 * Extrai apenas a área de texto detectada da imagem
 */
export function extractTextArea(
  canvas: HTMLCanvasElement,
  textArea: DetectedTextArea
): HTMLCanvasElement {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = textArea.width;
  newCanvas.height = textArea.height;
  const ctx = newCanvas.getContext('2d');

  if (!ctx) return canvas;

  ctx.drawImage(
    canvas,
    textArea.x,
    textArea.y,
    textArea.width,
    textArea.height,
    0,
    0,
    textArea.width,
    textArea.height
  );

  return newCanvas;
}

