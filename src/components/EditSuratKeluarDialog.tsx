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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { showSuccess, showError } from "@/utils/toast";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { JABATAN_OPTIONS } from "@/lib/constants";
import { ScrollArea } from "./ui/scroll-area";

const formSchema = z.object({
  nomor_surat: z.string().min(1, "Nomor surat tidak boleh kosong."),
  tanggal_surat: z.date({ required_error: "Tanggal surat harus diisi." }),
  penandatangan: z.string().min(1, "Nama pengirim harus dipilih."),
  tujuan: z.string().min(1, "Tujuan tidak boleh kosong."),
  perihal: z.string().min(1, "Perihal tidak boleh kosong."),
  sifat: z.string().min(1, "Jenis surat harus dipilih."),
});

type FormValues = z.infer<typeof formSchema>;

type SuratKeluar = {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  penandatangan: string | null;
  tujuan: string;
  perihal: string;
  sifat: string | null;
};

type UserProfile = { id: string; full_name: string | null };

export default function EditSuratKeluarDialog({ surat, onSuratUpdated }: { surat: SuratKeluar; onSuratUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: userData, error: userError } = await supabase.from("profiles").select("id, full_name");
      if (userError) showError("Gagal memuat data pengguna.");
      else setUserList(userData);
    };
    if (open) {
      fetchUsers();
      form.reset({
        nomor_surat: surat.nomor_surat,
        tanggal_surat: parseISO(surat.tanggal_surat),
        penandatangan: surat.penandatangan || "",
        tujuan: surat.tujuan,
        perihal: surat.perihal,
        sifat: surat.sifat || "",
      });
    }
  }, [open, surat, form]);

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase
      .from("surat_keluar")
      .update({
        ...values,
        tanggal_surat: format(values.tanggal_surat, "yyyy-MM-dd"),
      })
      .eq("id", surat.id);

    if (error) {
      showError(`Gagal memperbarui surat: ${error.message}`);
    } else {
      showSuccess("Surat keluar berhasil diperbarui.");
      onSuratUpdated();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Surat Keluar</DialogTitle>
          <DialogDescription>
            Ubah detail surat keluar. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomor_surat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Surat</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 005/123/BPD/IV/2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="sifat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Surat</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                            format(field.value, "dd MMMM yyyy", { locale: id })
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
              name="penandatangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengirim</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih nama pengirim" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {userList.map((user) => (
                          <SelectItem key={user.id} value={user.full_name || ''}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tujuan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tujuan surat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <ScrollArea className="h-[200px]">
                        {JABATAN_OPTIONS.map((jabatan) => (
                          <SelectItem key={jabatan} value={jabatan}>
                            {jabatan}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="Contoh: Undangan Rapat Koordinasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}