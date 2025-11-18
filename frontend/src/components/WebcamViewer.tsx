import { useRef, useEffect, useState } from 'react';
import {
  processImageForOCR,
  upscaleImage,
  // detectTextArea,
  // extractTextArea,
} from '../utils/imageProcessing';
import './WebcamViewer.css';

interface WebcamViewerProps {
  onCapture?: (imageData: string) => void;
}

export const WebcamViewer = ({ onCapture }: WebcamViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      setError(null);
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
    } catch (err) {
      console.error('Erro ao acessar a webcam:', err);
      setError(
        'Não foi possível acessar a webcam. Verifique as permissões do navegador.'
      );
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
      
      // Inverter horizontalmente a imagem capturada para corrigir o texto
      tempCtx.translate(videoWidth, 0);
      tempCtx.scale(-1, 1);
      tempCtx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
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
      
      // TODO: Detecção de área de texto desabilitada temporariamente para testes
      // const textArea = detectTextArea(upscaledCanvas);
      // if (textArea) {
      //   processedCanvas = extractTextArea(upscaledCanvas, textArea);
      // }
      
      // Aplicar pré-processamento de imagem para melhorar OCR
      processImageForOCR(upscaledCanvas, {
        contrast: 1.3, // Aumentar contraste
        brightness: 15, // Aumentar brilho levemente
        grayscale: true, // Converter para escala de cinza
        sharpen: true, // Aplicar nitidez
        // threshold: undefined, // Não usar binarização por enquanto
      });
      
      // Usar PNG para melhor qualidade (sem compressão)
      const imageData = upscaledCanvas.toDataURL('image/png');
      onCapture?.(imageData);
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="webcam-container">
      <div className="webcam-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`webcam-video ${isStreaming ? 'active' : ''}`}
        />
        {isStreaming && (
          <div className="grid-overlay">
            <div className="grid-line grid-line-vertical grid-line-left"></div>
            <div className="grid-line grid-line-vertical grid-line-right"></div>
            <div className="grid-line grid-line-horizontal grid-line-top"></div>
            <div className="grid-line grid-line-horizontal grid-line-bottom"></div>
            <div className="center-quadrant">
              <div className="quadrant-label">Área de OCR</div>
            </div>
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
              <p>Webcam não iniciada</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="webcam-error">
          <p>{error}</p>
        </div>
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
            Iniciar Webcam
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
              Parar Webcam
            </button>
          </>
        )}
      </div>
    </div>
  );
};

