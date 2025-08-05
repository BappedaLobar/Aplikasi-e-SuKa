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
import { showError, showSuccess } from "@/utils/toast";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Send } from "lucide-react";

const formSchema = z.object({
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type SuratMasuk = { id: string; nomor_surat: string };
type UserProfile = { id: string; full_name: string | null; jabatan: string | null };

export default function CreateDisposisiDialog({ surat, onDisposisiCreated }: { surat: SuratMasuk; onDisposisiCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { catatan: "" },
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

    const initialHistory = [{
      from: currentUser.full_name || 'System',
      from_jabatan: currentUser.jabatan || 'N/A',
      to_jabatan: 'Sekretaris Badan',
      catatan: values.catatan || 'Disposisi awal dibuat.',
      timestamp: new Date().toISOString(),
    }];

    const { error } = await supabase.from("disposisi").insert([
      {
        surat_masuk_id: surat.id,
        tujuan_jabatan: "Sekretaris Badan",
        status: "Baru",
        catatan: values.catatan,
        riwayat: initialHistory,
      },
    ]);

    if (error) {
      showError(`Gagal membuat disposisi: ${error.message}`);
    } else {
      showSuccess(`Disposisi untuk surat ${surat.nomor_surat} berhasil dibuat dan ditujukan ke Sekretaris Badan.`);
      onDisposisiCreated();
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Send className="mr-2 h-4 w-4" />
          Disposisi
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Disposisi Surat</DialogTitle>
          <DialogDescription>
            Anda akan membuat disposisi untuk surat nomor <span className="font-semibold">{surat.nomor_surat}</span>. Surat akan diteruskan ke <span className="font-semibold">Sekretaris Badan</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="catatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tambahkan catatan atau instruksi awal..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Memproses..." : "Kirim Disposisi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}