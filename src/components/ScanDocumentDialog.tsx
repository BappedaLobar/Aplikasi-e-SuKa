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
import { Camera, RefreshCw, Loader2 } from 'lucide-react';
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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async (deviceId?: string) => {
    stopStream();
    setError(null);
    setLoading(true);

    const constraints: MediaStreamConstraints = {
      video: deviceId 
        ? { deviceId: { exact: deviceId } } 
        : { facingMode: { ideal: 'environment' } },
      audio: false,
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(playError => {
            console.error("Video play failed:", playError);
            setError("Gagal memulai pemutaran video. Coba lagi.");
          });
        };
      }
      
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);

      const currentTrack = newStream.getVideoTracks()[0];
      const currentDeviceId = currentTrack.getSettings().deviceId;
      if (currentDeviceId && !selectedDeviceId) {
        setSelectedDeviceId(currentDeviceId);
      }
    } catch (err: any) {
      console.error("Error starting stream:", err.name, err.message);
      setError("Gagal mengakses kamera. Pastikan izin telah diberikan dan tidak ada aplikasi lain yang menggunakannya.");
    } finally {
      setLoading(false);
    }
  }, [stopStream, selectedDeviceId]);

  useEffect(() => {
    if (open) {
      startStream(selectedDeviceId || undefined);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && selectedDeviceId) {
        const currentTrack = streamRef.current?.getVideoTracks()[0];
        if (currentTrack?.getSettings().deviceId !== selectedDeviceId) {
            startStream(selectedDeviceId);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId, open]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-2">Menyalakan kamera...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-destructive text-center p-4">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => startStream(selectedDeviceId || undefined)} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      );
    }
    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    );
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
        <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
          {renderContent()}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            {devices.length > 1 && (
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={loading || !!error}>
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
            <Button onClick={handleCapture} disabled={loading || !streamRef.current || !!error} className="w-full sm:w-auto">
                <Camera className="mr-2 h-4 w-4" />
                Ambil Gambar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}