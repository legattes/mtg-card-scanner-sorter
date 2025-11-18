/**
 * Interface para diferentes fontes de entrada de vídeo
 * Permite flexibilidade para webcam, celular, arquivo, etc.
 */
export interface IVideoInput {
  /**
   * Inicia a captura de vídeo
   */
  start(): Promise<void>;

  /**
   * Para a captura de vídeo
   */
  stop(): Promise<void>;

  /**
   * Captura um frame atual como imagem
   */
  captureFrame(): Promise<string>; // Retorna base64

  /**
   * Verifica se está capturando
   */
  isStreaming(): boolean;

  /**
   * Obtém informações do dispositivo
   */
  getDeviceInfo(): VideoDeviceInfo;

  /**
   * Evento quando o stream inicia
   */
  onStreamStart?: () => void;

  /**
   * Evento quando o stream para
   */
  onStreamStop?: () => void;

  /**
   * Evento de erro
   */
  onError?: (error: Error) => void;
}

export interface VideoDeviceInfo {
  deviceId?: string;
  label?: string;
  type: 'webcam' | 'mobile' | 'file' | 'stream';
  capabilities?: {
    width?: number;
    height?: number;
    frameRate?: number;
  };
}

