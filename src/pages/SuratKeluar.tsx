import { useEffect, useState } from "react";
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
import AddSuratKeluarDialog from "@/components/AddSuratKeluarDialog";
import EditSuratKeluarDialog from "@/components/EditSuratKeluarDialog";
import DeleteSuratKeluarDialog from "@/components/DeleteSuratKeluarDialog";
import ArchiveDialog from "@/components/ArchiveDialog";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type SuratKeluar = {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tujuan: string;
  perihal: string;
  sifat: string | null;
  file_url: string | null;
};

export default function SuratKeluar() {
  const [suratList, setSuratList] = useState<SuratKeluar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuratKeluar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surat_keluar")
      .select("*")
      .eq('is_archived', false)
      .order("created_at", { ascending: false });

    if (error) {
      showError("Gagal memuat data surat keluar.");
      console.error(error);
    } else {
      setSuratList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuratKeluar();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surat Keluar</h1>
          <p className="text-muted-foreground">
            Daftar semua surat yang dikirim.
          </p>
        </div>
        <AddSuratKeluarDialog onSuratAdded={fetchSuratKeluar} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Surat Keluar</CardTitle>
          <CardDescription>
            Berikut adalah daftar surat yang telah dikirim dan tercatat dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Sifat</TableHead>
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
                    <TableCell>{surat.tujuan}</TableCell>
                    <TableCell>
                      {surat.sifat && (
                        <Badge variant={surat.sifat === 'Rahasia' || surat.sifat === 'Penting' ? 'destructive' : 'secondary'}>
                          {surat.sifat}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {surat.tanggal_surat ? new Date(surat.tanggal_surat).toLocaleDateString("id-ID", {
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
                          <EditSuratKeluarDialog surat={surat} onSuratUpdated={fetchSuratKeluar} />
                          <DeleteSuratKeluarDialog surat={surat} onSuratDeleted={fetchSuratKeluar} />
                          <DropdownMenuSeparator />
                          <ArchiveDialog surat={surat} tableName="surat_keluar" onArchived={fetchSuratKeluar} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada surat keluar.
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