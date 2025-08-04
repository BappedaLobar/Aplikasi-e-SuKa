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
import { ArchiveRestore } from "lucide-react";

type UnarchiveDialogProps = {
  surat: { id: string; nomor_surat: string };
  tableName: 'surat_masuk' | 'surat_keluar';
  onUnarchived: () => void;
};

export default function UnarchiveDialog({ surat, tableName, onUnarchived }: UnarchiveDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleUnarchive = async () => {
    setLoading(true);
    const { error } = await supabase
      .from(tableName)
      .update({ is_archived: false })
      .eq("id", surat.id);

    if (error) {
      showError(`Gagal mengembalikan surat: ${error.message}`);
    } else {
      showSuccess("Surat berhasil dikembalikan dari arsip.");
      onUnarchived();
    }
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ArchiveRestore className="mr-2 h-4 w-4" />
          Keluarkan dari Arsip
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluarkan dari Arsip?</AlertDialogTitle>
          <AlertDialogDescription>
            Surat dengan nomor <span className="font-semibold">{surat.nomor_surat}</span> akan dikembalikan ke daftar surat aktif.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnarchive} disabled={loading}>
            {loading ? "Mengembalikan..." : "Ya, Kembalikan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}