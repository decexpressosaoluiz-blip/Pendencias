import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface CameraModalProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Câmera não suportada neste navegador.");
      return;
    }

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (e) {
        console.warn("Environment camera not found, trying default.", e);
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError("Permissão da câmera negada. Por favor, permita o acesso.");
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError("Nenhuma câmera encontrada no dispositivo.");
      } else {
        setError("Não foi possível acessar a câmera.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    if (!stream) {
        startCamera();
    } else if (videoRef.current) {
        videoRef.current.srcObject = stream;
    }
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
        stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] border border-slate-700">
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-surface">
          <h3 className="font-semibold text-gray-900 dark:text-white">Capturar Imagem</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
          {error ? (
            <div className="text-center p-6 text-white max-w-xs">
                <AlertTriangle className="mx-auto mb-2 text-yellow-400" size={48} />
                <p className="font-medium mb-4">{error}</p>
                <Button onClick={startCamera} variant="ghost" className="text-white hover:bg-white/20 border border-white/20">
                    Tentar Novamente
                </Button>
            </div>
          ) : !capturedImage ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 flex justify-around bg-gray-50 dark:bg-black/40">
          {error ? (
            <Button onClick={onClose} variant="secondary">Fechar</Button>
          ) : !capturedImage ? (
            <Button onClick={capture} variant="primary" size="lg" className="rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
              <Camera size={32} />
            </Button>
          ) : (
            <>
              <Button onClick={retake} variant="secondary">
                <RefreshCw size={20} className="mr-2" /> Tentar Novamente
              </Button>
              <Button onClick={confirm} variant="primary">
                <Check size={20} className="mr-2" /> Salvar Foto
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};