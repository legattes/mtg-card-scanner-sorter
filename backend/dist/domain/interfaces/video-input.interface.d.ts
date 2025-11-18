export interface IVideoInput {
    start(): Promise<void>;
    stop(): Promise<void>;
    captureFrame(): Promise<string>;
    isStreaming(): boolean;
    getDeviceInfo(): VideoDeviceInfo;
    onStreamStart?: () => void;
    onStreamStop?: () => void;
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
