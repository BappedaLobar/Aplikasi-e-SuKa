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
import { Camera } from 'lucide-react';
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

  const startStream = useCallback(async (deviceId: string) => {
    stopStream();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Gagal mengakses kamera. Pastikan Anda memberikan izin dan tidak ada aplikasi lain yang menggunakan kamera.");
      showError("Gagal mengakses kamera.");
    }
  }, [stopStream]);

  useEffect(() => {
    const getDevicesAndStart = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true }); // Request permission
        const availableDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = availableDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          const preferredDeviceId = videoDevices.find(d => d.label.toLowerCase().includes('back'))?.deviceId || videoDevices[0].deviceId;
          setSelectedDeviceId(preferredDeviceId);
          startStream(preferredDeviceId);
        } else {
          setError("Tidak ada kamera yang ditemukan.");
        }
      } catch (err) {
        setError("Izin kamera ditolak atau tidak ada kamera.");
        console.error("Error getting devices:", err);
      }
    };

    if (open) {
      getDevicesAndStart();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
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

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startStream(deviceId);
  }

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
            <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md text-destructive text-center p-4">
              {error}
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-md bg-muted"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            {devices.length > 1 && (
              <Select value={selectedDeviceId} onValueChange={handleDeviceChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Pilih Kamera" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Kamera ${devices.indexOf(device) + 1}`}
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