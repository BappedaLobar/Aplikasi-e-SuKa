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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";
import { ArrowRightCircle } from "lucide-react";
import { JABATAN_OPTIONS } from "@/lib/constants";

const formSchema = z.object({
  tujuan_jabatan: z.string().min(1, "Tujuan jabatan harus dipilih."),
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type Disposisi = { id: string; riwayat: any[]; surat_masuk: { nomor_surat: string } };
type UserProfile = { id: string; full_name: string | null; jabatan: string | null };

export default function ForwardDisposisiDialog({ disposisi, onDisposisiForwarded }: { disposisi: Disposisi; onDisposisiForwarded: () => void }) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { tujuan_jabatan: "", catatan: "" },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setCurrentUser(profile);
      }
    };
    fetchUser();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      showError("Gagal mendapatkan data pengguna saat ini.");
      return;
    }

    const newHistoryEntry = {
      from: currentUser.full_name || 'System',
      from_jabatan: currentUser.jabatan || 'N/A',
      to_jabatan: values.tujuan_jabatan,
      catatan: values.catatan || 'Diteruskan.',
      timestamp: new Date().toISOString(),
    };

    const updatedRiwayat = [...(disposisi.riwayat || []), newHistoryEntry];

    const { error } = await supabase
      .from("disposisi")
      .update({
        tujuan_jabatan: values.tujuan_jabatan,
        status: "Diteruskan",
        catatan: values.catatan,
        riwayat: updatedRiwayat,
      })
      .eq("id", disposisi.id);

    if (error) {
      showError(`Gagal meneruskan disposisi: ${error.message}`);
    } else {
      showSuccess(`Disposisi berhasil diteruskan ke ${values.tujuan_jabatan}.`);
      onDisposisiForwarded();
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <ArrowRightCircle className="mr-2 h-4 w-4" />
          Teruskan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Teruskan Disposisi</DialogTitle>
          <DialogDescription>
            Teruskan disposisi untuk surat nomor <span className="font-semibold">{disposisi.surat_masuk.nomor_surat}</span> ke tujuan berikutnya.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tujuan_jabatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan Jabatan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tujuan disposisi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {JABATAN_OPTIONS.map(jabatan => (
                        <SelectItem key={jabatan} value={jabatan}>{jabatan}</SelectItem>
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
                  <FormLabel>Catatan / Instruksi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tambahkan catatan atau instruksi..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Memproses..." : "Teruskan Disposisi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}