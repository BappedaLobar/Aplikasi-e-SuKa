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
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/utils/toast";
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  tujuan_jabatan: z.string().min(1, "Tujuan disposisi harus dipilih."),
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Profile = { id: string; full_name: string | null; jabatan: string | null };
type Disposisi = {
  id: string;
  tujuan_jabatan: string;
  riwayat: any[];
  surat_masuk: { nomor_surat: string };
};

export default function ForwardDisposisiDialog({ disposisi, onForwarded }: { disposisi: Disposisi; onForwarded: () => void }) {
  const [open, setOpen] = useState(false);
  const [possibleDestinations, setPossibleDestinations] = useState<Profile[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const getDestinations = async () => {
      if (!open) return;

      let operator: string;
      let value: string;

      if (disposisi.tujuan_jabatan === "Sekretaris Badan") {
        operator = "eq";
        value = "Kepala Badan";
      } else if (disposisi.tujuan_jabatan === "Kepala Badan") {
        operator = "like";
        value = "Kepala Bidang%";
      } else {
        setPossibleDestinations([]);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, jabatan")
        .filter("jabatan", operator, value);

      if (error) {
        showError("Gagal memuat daftar tujuan disposisi.");
      } else {
        setPossibleDestinations(data as Profile[]);
      }
    };
    getDestinations();
  }, [open, disposisi.tujuan_jabatan]);

  const onSubmit = async (values: FormValues) => {
    const newHistoryEntry = {
      jabatan: values.tujuan_jabatan,
      status: `Diteruskan ke ${values.tujuan_jabatan}`,
      timestamp: new Date().toISOString(),
      catatan: values.catatan || "Diteruskan untuk ditindaklanjuti.",
    };

    const updatedRiwayat = [...(disposisi.riwayat || []), newHistoryEntry];

    const { error } = await supabase
      .from("disposisi")
      .update({
        tujuan_jabatan: values.tujuan_jabatan,
        status: `Disposisi ke ${values.tujuan_jabatan}`,
        riwayat: updatedRiwayat,
        catatan: values.catatan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", disposisi.id);

    if (error) {
      showError(`Gagal meneruskan disposisi: ${error.message}`);
    } else {
      showSuccess(`Disposisi berhasil diteruskan ke ${values.tujuan_jabatan}.`);
      onForwarded();
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <ArrowRight className="mr-2 h-4 w-4" />
          Teruskan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Teruskan Disposisi</DialogTitle>
          <DialogDescription>
            Surat No. {disposisi.surat_masuk.nomor_surat}.
            Pilih tujuan dan tambahkan catatan jika perlu.
          </DialogDescription>
        </DialogHeader>
        {possibleDestinations.length > 0 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tujuan_jabatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tujuan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tujuan disposisi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {possibleDestinations.map((dest) => (
                          <SelectItem key={dest.id} value={dest.jabatan!}>
                            {dest.jabatan} ({dest.full_name})
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
                name="catatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tambahkan instruksi atau catatan..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Meneruskan..." : "Teruskan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Tidak ada tujuan penerusan yang tersedia atau disposisi telah selesai.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}