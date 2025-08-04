import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UnarchiveDialog from "@/components/UnarchiveDialog";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ArchivedMail = {
  id: string;
  nomor_surat: string;
  perihal: string;
  partner: string; // Pengirim atau Tujuan
  tanggal_surat: string;
  type: 'surat_masuk' | 'surat_keluar';
  created_at: string;
};

export default function GalleriArsip() {
  const [archivedList, setArchivedList] = useState<ArchivedMail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArchivedMail = useCallback(async () => {
    setLoading(true);
    try {
      const { data: suratMasuk, error: errorMasuk } = await supabase
        .from("surat_masuk")
        .select("id, nomor_surat, perihal, pengirim, tanggal_surat, created_at")
        .eq("is_archived", true);

      if (errorMasuk) throw errorMasuk;

      const { data: suratKeluar, error: errorKeluar } = await supabase
        .from("surat_keluar")
        .select("id, nomor_surat, perihal, tujuan, tanggal_surat, created_at")
        .eq("is_archived", true);

      if (errorKeluar) throw errorKeluar;

      const combined: ArchivedMail[] = [
        ...(suratMasuk || []).map(s => ({ ...s, partner: s.pengirim, type: 'surat_masuk' as const })),
        ...(suratKeluar || []).map(s => ({ ...s, partner: s.tujuan, type: 'surat_keluar' as const })),
      ];

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setArchivedList(combined);
    } catch (error: any) {
      showError("Gagal memuat data arsip.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedMail();
  }, [fetchArchivedMail]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Galeri Arsip</h1>
        <p className="text-muted-foreground">
          Daftar semua surat yang telah diarsipkan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Arsip Surat</CardTitle>
          <CardDescription>
            Berikut adalah daftar surat masuk dan keluar yang diarsipkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis</TableHead>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>Dari/Kepada</TableHead>
                <TableHead>Tgl. Surat</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : archivedList.length > 0 ? (
                archivedList.map((surat) => (
                  <TableRow key={surat.id}>
                    <TableCell>
                      <Badge variant={surat.type === 'surat_masuk' ? 'default' : 'outline'}>
                        {surat.type === 'surat_masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{surat.nomor_surat}</TableCell>
                    <TableCell>{surat.perihal}</TableCell>
                    <TableCell>{surat.partner}</TableCell>
                    <TableCell>
                      {new Date(surat.tanggal_surat).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <UnarchiveDialog surat={surat} tableName={surat.type} onUnarchived={fetchArchivedMail} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada surat yang diarsipkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}