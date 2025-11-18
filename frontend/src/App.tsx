import { useState, useEffect } from 'react';
import { WebcamViewer } from './components/WebcamViewer';
import {
  processImageWithOcr,
  getCalibrationStats,
  updateCalibrationFeedback,
  getStatsByExpectedText,
} from './services/ocrService';
import './App.css';

interface OcrResult {
  text: string;
  confidence: number;
  title?: string;
  calibrationId?: string;
}

function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedText, setExpectedText] = useState('');
  const [calibrationStats, setCalibrationStats] = useState<any>(null);
  const [statsByText, setStatsByText] = useState<any[]>([]);
  const [showCalibration, setShowCalibration] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null);

  const loadCalibrationStats = async () => {
    try {
      const [stats, byText] = await Promise.all([
        getCalibrationStats(),
        getStatsByExpectedText(),
      ]);
      setCalibrationStats(stats);
      setStatsByText(byText);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    loadCalibrationStats();
  }, []);

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setOcrResult(null);
    setError(null);
    setFeedbackSubmitted(null);
    setIsProcessing(true);

    try {
      console.log('Processando imagem com OCR...');
      const result = await processImageWithOcr(
        imageData,
        expectedText || undefined,
        !!expectedText
      );
      
      if (result.success) {
        setOcrResult({
          text: result.text,
          confidence: result.confidence,
          title: result.title,
          calibrationId: result.calibrationId,
        });
        console.log('OCR concluído:', result);
        
        // Recarregar estatísticas se salvou para calibração
        if (result.calibrationId) {
          await loadCalibrationStats();
        }
      } else {
        setError('Falha ao processar OCR');
      }
    } catch (err: any) {
      console.error('Erro ao processar OCR:', err);
      setError(err.message || 'Erro ao processar imagem com OCR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedback = async (feedbackType: 'correct' | 'almostCorrect' | 'containsText' | 'incorrect') => {
    if (!ocrResult?.calibrationId) return;

    try {
      await updateCalibrationFeedback(ocrResult.calibrationId, {
        feedbackType,
        expectedText: expectedText || undefined,
      });
      setFeedbackSubmitted(ocrResult.calibrationId);
      await loadCalibrationStats();
    } catch (err) {
      console.error('Erro ao salvar feedback:', err);
      setError('Erro ao salvar feedback. Tente novamente.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MTG Card Scanner Sorter</h1>
      </header>

      <main className="app-main">
        <div className="calibration-controls">
          <button
            onClick={() => setShowCalibration(!showCalibration)}
            className="btn-calibration-toggle"
          >
            {showCalibration ? 'Ocultar' : 'Mostrar'} Calibração
          </button>
          
          {showCalibration && (
            <div className="calibration-panel">
              <div className="calibration-input">
                <label>
                  Texto Esperado (para calibração):
                  <input
                    type="text"
                    value={expectedText}
                    onChange={(e) => setExpectedText(e.target.value)}
                    placeholder="Ex: Profundezas do Desejo"
                    className="calibration-input-field"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </label>
                <p className="calibration-hint">
                  Digite o texto esperado para salvar o resultado e melhorar o OCR
                </p>
              </div>
              
              {calibrationStats && (
                <div className="calibration-stats">
                  <h3>Estatísticas Gerais</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total:</span>
                      <span className="stat-value">{calibrationStats.total}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Corretos:</span>
                      <span className="stat-value stat-correct">
                        {calibrationStats.correct}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Quase Corretos:</span>
                      <span className="stat-value stat-almost">
                        {calibrationStats.almostCorrect || 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Contém Texto:</span>
                      <span className="stat-value stat-contains">
                        {calibrationStats.containsText || 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Incorretos:</span>
                      <span className="stat-value stat-incorrect">
                        {calibrationStats.incorrect}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Precisão:</span>
                      <span className="stat-value">
                        {calibrationStats.accuracy}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Taxa Quase Correto:</span>
                      <span className="stat-value">
                        {calibrationStats.almostCorrectRate || 0}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Taxa Contém Texto:</span>
                      <span className="stat-value">
                        {calibrationStats.containsTextRate || 0}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Confiança Média:</span>
                      <span className="stat-value">
                        {calibrationStats.averageConfidence}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {statsByText.length > 0 && (
                <div className="calibration-stats-by-text">
                  <h3>Estatísticas por Texto Esperado</h3>
                  <div className="stats-by-text-list">
                    {statsByText.map((stat, index) => (
                      <div key={index} className="stat-by-text-item">
                        <div className="stat-by-text-header">
                          <h4>{stat.expectedText}</h4>
                          <span className="stat-by-text-total">
                            {stat.total} {stat.total === 1 ? 'vez' : 'vezes'}
                          </span>
                        </div>
                        <div className="stat-by-text-details">
                          <div className="stat-by-text-bar">
                            <div
                              className="stat-bar-segment stat-bar-correct"
                              style={{ width: `${(stat.correct / stat.total) * 100}%` }}
                              title={`Corretos: ${stat.correct}`}
                            ></div>
                            <div
                              className="stat-bar-segment stat-bar-almost"
                              style={{ width: `${(stat.almostCorrect / stat.total) * 100}%` }}
                              title={`Quase Corretos: ${stat.almostCorrect}`}
                            ></div>
                            <div
                              className="stat-bar-segment stat-bar-contains"
                              style={{ width: `${(stat.containsText / stat.total) * 100}%` }}
                              title={`Contém Texto: ${stat.containsText}`}
                            ></div>
                            <div
                              className="stat-bar-segment stat-bar-incorrect"
                              style={{ width: `${(stat.incorrect / stat.total) * 100}%` }}
                              title={`Incorretos: ${stat.incorrect}`}
                            ></div>
                          </div>
                          <div className="stat-by-text-numbers">
                            <span className="stat-number stat-correct">
                              ✓ {stat.correct}
                            </span>
                            <span className="stat-number stat-almost">
                              ~ {stat.almostCorrect}
                            </span>
                            <span className="stat-number stat-contains">
                              ⊃ {stat.containsText || 0}
                            </span>
                            <span className="stat-number stat-incorrect">
                              ✗ {stat.incorrect}
                            </span>
                            <span className="stat-number">
                              {stat.accuracy}% precisão
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <WebcamViewer onCapture={handleCapture} />

        {isProcessing && (
          <div className="processing-container">
            <div className="processing-spinner"></div>
            <p>Processando imagem com OCR...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>❌ {error}</p>
          </div>
        )}

        {capturedImage && (
          <div className="captured-image-container">
            <h2>Imagem Capturada</h2>
            <img
              src={capturedImage}
              alt="Nota médica capturada"
              className="captured-image"
            />
          </div>
        )}

        {ocrResult && (
          <div className="ocr-result-container">
            <h2>Resultado do OCR</h2>
            <div className="ocr-confidence">
              <span>Confiança: {ocrResult.confidence}%</span>
            </div>
            
            {ocrResult.title && (
              <div className="ocr-title">
                <h3>📄 Título Identificado:</h3>
                <p className="title-text">{ocrResult.title}</p>
              </div>
            )}

            <div className="ocr-text">
              <h3>Texto Completo:</h3>
              <div className="text-content">
                {ocrResult.text || 'Nenhum texto identificado'}
              </div>
            </div>

            {ocrResult.calibrationId && !feedbackSubmitted && (
              <div className="ocr-feedback">
                <h3>Feedback de Calibração</h3>
                <div className="feedback-buttons">
                  <button
                    onClick={() => handleFeedback('correct')}
                    className="btn-feedback btn-feedback-correct"
                  >
                    ✓ Correto
                  </button>
                  <button
                    onClick={() => handleFeedback('almostCorrect')}
                    className="btn-feedback btn-feedback-almost"
                  >
                    ~ Quase Correto (&gt;90%)
                  </button>
                  <button
                    onClick={() => handleFeedback('containsText')}
                    className="btn-feedback btn-feedback-contains"
                  >
                    ⊃ Contém o Texto
                  </button>
                  <button
                    onClick={() => handleFeedback('incorrect')}
                    className="btn-feedback btn-feedback-incorrect"
                  >
                    ✗ Incorreto
                  </button>
                </div>
                <p className="feedback-note">
                  Ajude a melhorar o OCR marcando a qualidade do resultado
                </p>
              </div>
            )}

            {ocrResult.calibrationId && feedbackSubmitted === ocrResult.calibrationId && (
              <div className="ocr-feedback-success">
                <div className="feedback-success-icon">✓</div>
                <p className="feedback-success-message">Feedback salvo com sucesso!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
