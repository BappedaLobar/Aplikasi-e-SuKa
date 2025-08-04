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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddSuratMasukDialog from "@/components/AddSuratMasukDialog";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

type SuratMasuk = {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  pengirim: string;
  perihal: string;
};

export default function SuratMasuk() {
  const [suratList, setSuratList] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuratMasuk = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("surat_masuk")
      .select("*")
      .order("tanggal_diterima", { ascending: false });

    if (error) {
      showError("Gagal memuat data surat masuk.");
      console.error(error);
    } else {
      setSuratList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuratMasuk();
  }, []);

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
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
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
                      {new Date(surat.tanggal_diterima).toLocaleDateString("id-ID", {
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
                          <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
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
                  <TableCell colSpan={5} className="h-24 text-center">
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