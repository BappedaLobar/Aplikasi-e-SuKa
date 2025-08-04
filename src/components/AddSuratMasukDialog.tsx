import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  klasifikasi_kode: z.string().min(1, "Klasifikasi surat harus dipilih."),
  bidang_kode: z.string().min(1, "Bidang harus dipilih."),
  sifat: z.string().min(1, "Jenis surat harus dipilih."),
  nomor_surat: z.string().min(1, "Nomor surat tidak boleh kosong."),
  tanggal_surat: z.date({ required_error: "Tanggal surat harus diisi." }),
  pengirim: z.string().min(1, "Pengirim tidak boleh kosong."),
  perihal: z.string().min(1, "Perihal tidak boleh kosong."),
});

type FormValues = z.infer<typeof formSchema>;
type Klasifikasi = { kode: string; keterangan: string };
type Bidang = { kode: string; nama: string };

const romanNumerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export default function AddSuratMasukDialog({ onSuratAdded }: { onSuratAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [klasifikasiList, setKlasifikasiList] = useState<Klasifikasi[]>([]);
  const [bidangList, setBidangList] = useState<Bidang[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      klasifikasi_kode: "",
      bidang_kode: "",
      sifat: "",
      nomor_surat: "",
      pengirim: "",
      perihal: "",
    },
  });

  const selectedKlasifikasi = form.watch("klasifikasi_kode");
  const selectedBidang = form.watch("bidang_kode");

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: klasifikasiData, error: klasifikasiError } = await supabase.from("klasifikasi_surat").select("kode, keterangan");
      if (klasifikasiError) showError("Gagal memuat data klasifikasi.");
      else setKlasifikasiList(klasifikasiData);

      const { data: bidangData, error: bidangError } = await supabase.from("bidang").select("kode, nama");
      if (bidangError) showError("Gagal memuat data bidang.");
      else setBidangList(bidangData);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const generateNomorSurat = async () => {
      if (!selectedKlasifikasi || !selectedBidang) return;

      setIsGenerating(true);
      try {
        const { count: countMasuk } = await supabase.from("surat_masuk").select("*", { count: "exact", head: true });
        const { count: countKeluar } = await supabase.from("surat_keluar").select("*", { count: "exact", head: true });

        const nextNumber = (countMasuk || 0) + (countKeluar || 0) + 1;
        const formattedNumber = String(nextNumber).padStart(3, '0');
        
        const now = new Date();
        const month = romanNumerals[now.getMonth() + 1];
        const year = now.getFullYear();

        const newNomorSurat = `${selectedKlasifikasi}/${formattedNumber}/${selectedBidang}-BAPPEDA/${month}/${year}`;
        form.setValue("nomor_surat", newNomorSurat);
      } catch (error) {
        showError("Gagal membuat nomor surat otomatis.");
      } finally {
        setIsGenerating(false);
      }
    };

    generateNomorSurat();
  }, [selectedKlasifikasi, selectedBidang, form]);

  const onSubmit = async (values: FormValues) => {
    const { klasifikasi_kode, bidang_kode, ...rest } = values;
    const { error } = await supabase.from("surat_masuk").insert([
      {
        ...rest,
        tanggal_surat: format(values.tanggal_surat, "yyyy-MM-dd"),
      },
    ]);

    if (error) {
      showError(`Gagal menambahkan surat: ${error.message}`);
    } else {
      showSuccess("Surat masuk berhasil ditambahkan.");
      form.reset();
      onSuratAdded();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Surat Masuk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Surat Masuk Baru</DialogTitle>
          <DialogDescription>
            Isi detail surat masuk. Nomor surat akan dibuat secara otomatis.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] w-full pr-4">
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="sifat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Surat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis surat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Biasa">Biasa</SelectItem>
                          <SelectItem value="Penting">Penting</SelectItem>
                          <SelectItem value="Segera">Segera</SelectItem>
                          <SelectItem value="Rahasia">Rahasia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bidang_kode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bidang</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bidang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bidangList.map((b) => (
                            <SelectItem key={b.kode} value={b.kode}>
                              {b.kode} - {b.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="klasifikasi_kode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Klasifikasi Surat</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih klasifikasi untuk membuat nomor surat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {klasifikasiList.map((k) => (
                            <SelectItem key={k.kode} value={k.kode}>
                              {k.kode} - {k.keterangan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nomor_surat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Surat</FormLabel>
                      <FormControl>
                        <Input placeholder="Pilih bidang dan klasifikasi untuk membuat nomor..." {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tanggal_surat"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Surat</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pengirim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pengirim</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Dinas Pendidikan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perihal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perihal</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Undangan Rapat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting || isGenerating}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}