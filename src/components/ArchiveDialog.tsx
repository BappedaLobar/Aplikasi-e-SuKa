import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { showError, showSuccess } from "@/utils/toast";
import { Archive } from "lucide-react";

type ArchiveDialogProps = {
  surat: { id: string; nomor_surat: string };
  tableName: 'surat_masuk' | 'surat_keluar';
  onArchived: () => void;
};

export default function ArchiveDialog({ surat, tableName, onArchived }: ArchiveDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    const { error } = await supabase
      .from(tableName)
      .update({ is_archived: true })
      .eq("id", surat.id);

    if (error) {
      showError(`Gagal mengarsipkan surat: ${error.message}`);
    } else {
      showSuccess("Surat berhasil diarsipkan.");
      onArchived();
    }
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Archive className="mr-2 h-4 w-4" />
          Arsipkan
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arsipkan Surat?</AlertDialogTitle>
          <AlertDialogDescription>
            Surat dengan nomor <span className="font-semibold">{surat.nomor_surat}</span> akan dipindahkan ke galeri arsip. Anda dapat mengembalikannya nanti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={loading}>
            {loading ? "Mengarsipkan..." : "Ya, Arsipkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}