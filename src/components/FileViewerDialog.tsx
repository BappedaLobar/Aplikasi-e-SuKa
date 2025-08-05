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
  const getViewerUrl = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (!extension) return url; // Fallback if no extension

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    if (imageExtensions.includes(extension)) {
      return url; // Direct image display
    } else if (extension === 'pdf') {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    } else if (officeExtensions.includes(extension)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    } else {
      return url; // Fallback for other types
    }
  };

  const viewerUrl = getViewerUrl(fileUrl);
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
            <img src={viewerUrl} alt={fileName} className="w-full h-full object-contain" />
          ) : (
            <iframe
              src={viewerUrl}
              className="w-full h-full"
              title={fileName}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}