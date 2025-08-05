import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { FileCheck2 } from "lucide-react";

type SuratMasuk = { id: string; nomor_surat: string };

export default function CreateDisposisiDialog({ surat, onDisposisiCreated }: { surat: SuratMasuk; onDisposisiCreated: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCreateDisposisi = async () => {
    setLoading(true);
    const initialHistory = [{
      jabatan: "Sekretaris Badan",
      status: "Disposisi Baru",
      timestamp: new Date().toISOString(),
      catatan: "Surat baru diterima, mohon ditindaklanjuti."
    }];

    const { error } = await supabase.from("disposisi").insert({
      surat_masuk_id: surat.id,
      tujuan_jabatan: "Sekretaris Badan",
      status: "Disposisi ke Sekretaris Badan",
      riwayat: initialHistory,
    });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        showError("Surat ini sudah pernah didisposisikan.");
      } else {
        showError(`Gagal membuat disposisi: ${error.message}`);
      }
    } else {
      showSuccess("Surat berhasil didisposisikan ke Sekretaris Badan.");
      onDisposisiCreated();
    }
    setLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <FileCheck2 className="mr-2 h-4 w-4" />
          Disposisi
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disposisikan Surat?</AlertDialogTitle>
          <AlertDialogDescription>
            Surat dengan nomor <span className="font-semibold">{surat.nomor_surat}</span> akan didisposisikan ke <span className="font-semibold">Sekretaris Badan</span> untuk ditindaklanjuti. Lanjutkan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreateDisposisi} disabled={loading}>
            {loading ? "Memproses..." : "Ya, Disposisikan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}