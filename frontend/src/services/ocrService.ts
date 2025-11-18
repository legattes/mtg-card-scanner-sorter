interface OcrRequest {
  image: string;
  expectedText?: string;
  saveForCalibration?: boolean;
}

interface OcrResponse {
  success: boolean;
  text: string;
  confidence: number;
  title?: string;
  message?: string;
  calibrationId?: string;
}

export const processImageWithOcr = async (
  imageBase64: string,
  expectedText?: string,
  saveForCalibration: boolean = false,
): Promise<OcrResponse> => {
  try {
    // Sempre salvar se expectedText estiver preenchido
    const hasExpectedText = expectedText && expectedText.trim().length > 0;
    const shouldSave = saveForCalibration || hasExpectedText;
    
    console.log('Enviando requisição OCR:', {
      hasExpectedText,
      expectedText: expectedText?.substring(0, 50),
      shouldSave,
    });

    const response = await fetch('/api/ocr/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        expectedText: expectedText?.trim() || undefined,
        saveForCalibration: shouldSave,
      } as OcrRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao processar OCR');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao processar OCR:', error);
    throw error;
  }
};

export const getCalibrationStats = async () => {
  try {
    const response = await fetch('/api/ocr/calibration/stats');
    if (!response.ok) throw new Error('Erro ao obter estatísticas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
};

export const updateCalibrationFeedback = async (
  id: string,
  feedback: { 
    feedbackType?: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect';
    isCorrect?: boolean;
    isAlmostCorrect?: boolean;
    containsText?: boolean;
    expectedText?: string; 
    corrections?: string;
  },
) => {
  try {
    const response = await fetch(`/api/ocr/calibration/${id}/feedback`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    if (!response.ok) throw new Error('Erro ao atualizar feedback');
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar feedback:', error);
    throw error;
  }
};

export const getStatsByExpectedText = async () => {
  try {
    const response = await fetch('/api/ocr/calibration/stats/by-text');
    if (!response.ok) throw new Error('Erro ao obter estatísticas por texto');
    return await response.json();
  } catch (error) {
    console.error('Erro ao obter estatísticas por texto:', error);
    throw error;
  }
};

