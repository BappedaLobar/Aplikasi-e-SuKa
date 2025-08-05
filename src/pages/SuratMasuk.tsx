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
import { MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AddSuratMasukDialog from "@/components/AddSuratMasukDialog";
import EditSuratMasukDialog from "@/components/EditSuratMasukDialog";
import ArchiveDialog from "@/components/ArchiveDialog";
import CreateDisposisiDialog from "@/components/CreateDisposisiDialog";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type SuratMasuk = {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  pengirim: string;
  perihal: string;
  sifat: string | null;
  file_url: string | null;
  disposisi: { id: string }[];
};

export default function SuratMasuk() {
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuratMasuk = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surat_masuk")
      .select("*, disposisi(id)")
      .eq('is_archived', false)
      .order("tanggal_diterima", { ascending: false });

    if (error) {
      showError("Gagal memuat data surat masuk.");
      console.error(error);
    } else {
      setSuratList(data as SuratMasuk[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuratMasuk();
  }, [fetchSuratMasuk]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surat Masuk</h1>
          <p className="text-muted-foreground">
            Daftar semua surat yang diterima.
          </p>
        </div>
        <AddSuratMasukDialog onSuratAdded={fetchSuratMasuk} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Surat Masuk</CardTitle>
          <CardDescription>
            Berikut adalah daftar surat yang telah tercatat dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>Pengirim</TableHead>
                <TableHead>Sifat</TableHead>
                <TableHead>Tgl. Diterima</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[70px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : suratList.length > 0 ? (
                suratList.map((surat) => (
                  <TableRow key={surat.id}>
                    <TableCell className="font-medium">{surat.nomor_surat}</TableCell>
                    <TableCell>{surat.perihal}</TableCell>
                    <TableCell>{surat.pengirim}</TableCell>
                    <TableCell>
                      {surat.sifat && (
                        <Badge variant={surat.sifat === 'Rahasia' || surat.sifat === 'Penting' ? 'destructive' : 'secondary'}>
                          {surat.sifat}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {surat.tanggal_diterima ? new Date(surat.tanggal_diterima).toLocaleDateString("id-ID", {
                        day: '2-digit', month: 'long', year: 'numeric'
                      }) : ''}
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
                          <DropdownMenuItem
                            onClick={() => surat.file_url && window.open(surat.file_url, "_blank")}
                            disabled={!surat.file_url}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Surat
                          </DropdownMenuItem>
                          <EditSuratMasukDialog surat={surat} onSuratUpdated={fetchSuratMasuk} />
                          <DropdownMenuSeparator />
                          {surat.disposisi.length === 0 ? (
                            <CreateDisposisiDialog surat={surat} onDisposisiCreated={fetchSuratMasuk} />
                          ) : (
                            <DropdownMenuItem disabled>Sudah Didisposisi</DropdownMenuItem>
                          )}
                          <ArchiveDialog surat={surat} tableName="surat_masuk" onArchived={fetchSuratMasuk} />
                          <DropdownMenuItem className="text-red-600">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada surat masuk.
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