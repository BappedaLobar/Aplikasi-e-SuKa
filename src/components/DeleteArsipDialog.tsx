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
import { Trash2 } from "lucide-react";

type DeleteArsipDialogProps = {
  surat: { id: string; nomor_surat: string };
  tableName: 'surat_masuk' | 'surat_keluar';
  onDeleted: () => void;
};

export default function DeleteArsipDialog({ surat, tableName, onDeleted }: DeleteArsipDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", surat.id);

    if (error) {
      showError(`Gagal menghapus arsip: ${error.message}`);
      setLoading(false);
      return;
    }

    showSuccess("Arsip berhasil dihapus permanen.");
    onDeleted();
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus Permanen
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus arsip surat dengan nomor <span className="font-semibold">{surat.nomor_surat}</span> secara permanen dari database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
            {loading ? "Menghapus..." : "Ya, Hapus Permanen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}