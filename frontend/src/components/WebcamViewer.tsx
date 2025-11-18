import { useRef, useEffect, useState } from 'react';
import {
  processImageForOCR,
  upscaleImage,
  // detectTextArea,
  // extractTextArea,
} from '../utils/imageProcessing';
import type { ImageProcessingOptions } from '../utils/imageProcessing';
import { FilterControls } from './FilterControls';
import './WebcamViewer.css';

interface WebcamViewerProps {
  onCapture?: (imageData: string) => void;
}

export const WebcamViewer = ({ onCapture }: WebcamViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState<ImageProcessingOptions>({
    contrast: 1.6,
    brightness: 5,
    gamma: 0.8,
    grayscale: true,
    sharpen: true,
    enhanceContrast: true,
  });
  const streamRef = useRef<MediaStream | null>(null);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef<number>(1);

  const startWebcam = async () => {
    try {
      setError(null);
      
      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia não está disponível. Use HTTPS ou localhost.');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment', // Usa a câmera traseira em dispositivos móveis
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error('Erro ao acessar a webcam:', err);
      
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'A câmera está sendo usada por outro aplicativo.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'As configurações da câmera não são suportadas.';
      } else if (err.name === 'SecurityError' || err.name === 'NotSupportedError') {
        errorMessage = 'Acesso à câmera requer HTTPS. Use HTTPS ou localhost.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const refocusCamera = async () => {
    if (!streamRef.current || !videoRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (!videoTrack) return;

      const capabilities = videoTrack.getCapabilities() as any;
      
      // Verificar se a câmera suporta foco automático
      if (capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('auto')) {
        await videoTrack.applyConstraints({
          advanced: [{ focusMode: 'auto' } as any],
        });
        console.log('✅ Foco automático aplicado');
      } else if (capabilities.focusDistance) {
        // Tentar ajustar distância de foco (algumas câmeras)
        await videoTrack.applyConstraints({
          advanced: [{ focusDistance: 0.5 } as any], // Valor intermediário
        });
        console.log('✅ Distância de foco ajustada');
      } else {
        // Se não suporta foco programático, tentar reiniciar a câmera
        console.log('⚠️ Câmera não suporta foco automático programático, reiniciando...');
        const wasStreaming = isStreaming;
        stopWebcam();
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (wasStreaming) {
          await startWebcam();
        }
      }
    } catch (err) {
      console.error('Erro ao aplicar foco:', err);
      // Tentar reiniciar a câmera como fallback
      const wasStreaming = isStreaming;
      stopWebcam();
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (wasStreaming) {
        await startWebcam();
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && isStreaming) {
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      // Criar canvas temporário para a imagem completa
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return;
      
      // Aplicar zoom na captura: calcular área visível baseada no zoom
      // Quando zoom > 1, estamos "ampliando" a imagem, então capturamos uma área menor
      const zoomFactor = zoom;
      const sourceWidth = videoWidth / zoomFactor;
      const sourceHeight = videoHeight / zoomFactor;
      const sourceX = (videoWidth - sourceWidth) / 2;
      const sourceY = (videoHeight - sourceHeight) / 2;
      
      // Desenhar apenas a área visível (com zoom aplicado) no canvas completo
      tempCtx.drawImage(
        videoRef.current,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source: área menor do vídeo (zoom in)
        0, 0, videoWidth, videoHeight // Destination: canvas completo (preenche tudo)
      );
      
      // A orientação deve ser a mesma da visualização
      // Se o vídeo está invertido na tela (isFlipped), a captura já está correta
      // Se não está invertido na tela, inverter na captura para corresponder
      if (!isFlipped) {
        // Criar canvas invertido
        const invertedCanvas = document.createElement('canvas');
        invertedCanvas.width = videoWidth;
        invertedCanvas.height = videoHeight;
        const invertedCtx = invertedCanvas.getContext('2d');
        if (invertedCtx) {
          invertedCtx.translate(videoWidth, 0);
          invertedCtx.scale(-1, 1);
          invertedCtx.drawImage(tempCanvas, 0, 0);
          // Copiar de volta para tempCanvas
          tempCtx.clearRect(0, 0, videoWidth, videoHeight);
          tempCtx.drawImage(invertedCanvas, 0, 0);
        }
      }
      
      // Dividir em 3x3 e pegar apenas o quadrante central
      const thirdWidth = videoWidth / 3;
      const thirdHeight = videoHeight / 3;
      
      // Coordenadas do quadrante central (do meio)
      const centerX = thirdWidth;
      const centerY = thirdHeight;
      const centerWidth = thirdWidth;
      const centerHeight = thirdHeight;
      
      // Criar canvas final apenas com o quadrante central
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = centerWidth;
      finalCanvas.height = centerHeight;
      const finalCtx = finalCanvas.getContext('2d');
      
      if (!finalCtx) return;
      
      // Copiar apenas o quadrante central do canvas temporário
      finalCtx.drawImage(
        tempCanvas,
        centerX, centerY, centerWidth, centerHeight, // Source: quadrante central
        0, 0, centerWidth, centerHeight // Destination: canvas final
      );
      
      // Aumentar resolução para melhorar OCR (2x)
      const upscaledCanvas = upscaleImage(finalCanvas, 2);
      
      // Aplicar pré-processamento de imagem para melhorar OCR usando filtros configurados
      processImageForOCR(upscaledCanvas, filters);
      
      // Usar PNG para melhor qualidade (sem compressão)
      const imageData = upscaledCanvas.toDataURL('image/png');
      onCapture?.(imageData);
    }
  };

  // Handlers de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  // Handlers de pinch gesture
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartDistance.current = getDistance(e.touches[0], e.touches[1]);
      pinchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current !== null) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / pinchStartDistance.current;
      const newZoom = Math.max(1, Math.min(3, pinchStartZoom.current * scale));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistance.current = null;
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Detectar se é mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="webcam-container">
      <div 
        className={`webcam-wrapper ${isMobile ? 'mobile' : ''}`}
        ref={wrapperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`webcam-video ${isStreaming ? 'active' : ''} ${isFlipped ? 'flipped' : ''}`}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
        {isStreaming && (
          <div className="grid-overlay">
            <div className="grid-line grid-line-vertical grid-line-left"></div>
            <div className="grid-line grid-line-vertical grid-line-right"></div>
            <div className="grid-line grid-line-horizontal grid-line-top"></div>
            <div className="grid-line grid-line-horizontal grid-line-bottom"></div>
            <div className="center-quadrant"></div>
          </div>
        )}
        {!isStreaming && (
          <div className="webcam-placeholder">
            <div className="placeholder-content">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p>Câmera não iniciada</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="webcam-error">
          <p>{error}</p>
        </div>
      )}

      {isStreaming && (
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="btn btn-zoom" title="Diminuir zoom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="btn btn-zoom" title="Aumentar zoom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
          {zoom !== 1 && (
            <button onClick={handleZoomReset} className="btn btn-zoom-reset" title="Resetar zoom">
              Resetar
            </button>
          )}
        </div>
      )}

      {isStreaming && (
        <FilterControls filters={filters} onFiltersChange={setFilters} />
      )}

      <div className="webcam-controls">
        {!isStreaming ? (
          <button onClick={startWebcam} className="btn btn-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Iniciar Câmera
          </button>
        ) : (
          <>
            <button onClick={captureImage} className="btn btn-capture">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
              </svg>
              Capturar Imagem
            </button>
            <button 
              onClick={() => setIsFlipped(!isFlipped)} 
              className={`btn ${isFlipped ? 'btn-flipped' : 'btn-secondary'}`}
              title={isFlipped ? 'Desinverter imagem' : 'Inverter imagem horizontalmente'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
              {isFlipped ? 'Desinverter' : 'Inverter'}
            </button>
            <button 
              onClick={refocusCamera} 
              className="btn btn-secondary"
              title="Refocar a câmera"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Focar
            </button>
            <button onClick={stopWebcam} className="btn btn-secondary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Parar Câmera
            </button>
          </>
        )}
      </div>
    </div>
  );
};

