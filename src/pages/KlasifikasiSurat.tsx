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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { showError } from "@/utils/toast";
import AddKlasifikasiDialog from "@/components/AddKlasifikasiDialog";
import EditKlasifikasiDialog from "@/components/EditKlasifikasiDialog";
import DeleteKlasifikasiDialog from "@/components/DeleteKlasifikasiDialog";

type Klasifikasi = {
  id: string;
  kode: string;
  keterangan: string;
  created_at: string;
};

export default function KlasifikasiSurat() {
  const [klasifikasiList, setKlasifikasiList] = useState<Klasifikasi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKlasifikasi = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("klasifikasi_surat")
      .select("*")
      .order("kode", { ascending: true });

    if (error) {
      showError("Gagal memuat data klasifikasi.");
      console.error(error);
    } else {
      setKlasifikasiList(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKlasifikasi();
  }, [fetchKlasifikasi]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Klasifikasi Surat</h1>
          <p className="text-muted-foreground">
            Kelola data klasifikasi surat sesuai peraturan yang berlaku.
          </p>
        </div>
        <AddKlasifikasiDialog onAdded={fetchKlasifikasi} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Klasifikasi Surat</CardTitle>
          <CardDescription>
            Berikut adalah daftar kode klasifikasi yang digunakan dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Kode</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : klasifikasiList.length > 0 ? (
                klasifikasiList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.kode}</TableCell>
                    <TableCell>{item.keterangan}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <EditKlasifikasiDialog klasifikasi={item} onUpdated={fetchKlasifikasi} />
                          <DeleteKlasifikasiDialog klasifikasi={item} onDeleted={fetchKlasifikasi} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Belum ada data klasifikasi.
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