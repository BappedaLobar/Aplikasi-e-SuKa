import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface FileViewerDialogProps {
  fileUrl: string;
  fileName: string;
  trigger: React.ReactNode;
}

export default function FileViewerDialog({ fileUrl, fileName, trigger }: FileViewerDialogProps) {
  const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(fileUrl);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pratinjau Dokumen</DialogTitle>
          <DialogDescription>{fileName}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 h-full w-full rounded-md overflow-hidden border">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="w-full h-full object-contain" />
          ) : (
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title={fileName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}