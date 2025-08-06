import { useState, useRef, useEffect, useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Camera, RefreshCw } from 'lucide-react';
import { showError } from '@/utils/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScanDocumentDialogProps {
  setValue: UseFormSetValue<any>;
  onScanComplete: () => void;
  trigger: React.ReactNode;
}

export default function ScanDocumentDialog({ setValue, onScanComplete, trigger }: ScanDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setError(null);

    const constraints: MediaStreamConstraints = {
      video: deviceId 
        ? { deviceId: { exact: deviceId } } 
        : { facingMode: { ideal: 'environment' } },
      audio: false,
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);

      const currentTrack = newStream.getVideoTracks()[0];
      const currentDeviceId = currentTrack.getSettings().deviceId;
      if (currentDeviceId) {
        setSelectedDeviceId(currentDeviceId);
      }

    } catch (err: any) {
      console.error("Error starting stream:", err.name, err.message);
      if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError' || err.name === 'NotAllowedError') {
        try {
          console.log("Retrying with default camera...");
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
          setDevices(videoDevices);
          const currentTrack = fallbackStream.getVideoTracks()[0];
          const currentDeviceId = currentTrack.getSettings().deviceId;
          if (currentDeviceId) {
            setSelectedDeviceId(currentDeviceId);
          }
        } catch (fallbackErr: any) {
          setError("Gagal mengakses kamera. Pastikan izin telah diberikan dan tidak ada aplikasi lain yang menggunakannya.");
        }
      } else {
        setError("Gagal mengakses kamera. Pastikan izin telah diberikan.");
      }
    }
  }, [stopStream]);

  useEffect(() => {
    if (open) {
      startStream();
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [open, startStream, stopStream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          setValue('file', dataTransfer.files, { shouldValidate: true });
          onScanComplete();
          setOpen(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pindai Dokumen</DialogTitle>
          <DialogDescription>
            Posisikan dokumen di depan kamera dan klik "Ambil Gambar".
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          {error ? (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-muted rounded-md text-destructive text-center p-4">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={() => startStream()} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto rounded-md bg-muted"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            {devices.length > 1 && (
              <Select value={selectedDeviceId} onValueChange={(id) => startStream(id)} disabled={!!error}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Pilih Kamera" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device, index) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Kamera ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleCapture} disabled={!stream || !!error} className="w-full sm:w-auto">
                <Camera className="mr-2 h-4 w-4" />
                Ambil Gambar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}