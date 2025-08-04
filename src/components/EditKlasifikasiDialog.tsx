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
import { Input } from "@/components/ui/input";
import { showError, showSuccess } from "@/utils/toast";
import { DropdownMenuItem } from "./ui/dropdown-menu";

const formSchema = z.object({
  kode: z.string().min(1, "Kode tidak boleh kosong."),
  keterangan: z.string().min(1, "Keterangan tidak boleh kosong."),
});

type FormValues = z.infer<typeof formSchema>;
type Klasifikasi = { id: string; kode: string; keterangan: string };

export default function EditKlasifikasiDialog({ klasifikasi, onUpdated }: { klasifikasi: Klasifikasi; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        kode: klasifikasi.kode,
        keterangan: klasifikasi.keterangan,
      });
    }
  }, [open, klasifikasi, form]);

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase
      .from("klasifikasi_surat")
      .update(values)
      .eq("id", klasifikasi.id);

    if (error) {
      showError(`Gagal memperbarui klasifikasi: ${error.message}`);
    } else {
      showSuccess("Klasifikasi berhasil diperbarui.");
      onUpdated();
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
          <DialogTitle>Edit Klasifikasi Surat</DialogTitle>
          <DialogDescription>
            Ubah detail untuk kode {klasifikasi.kode}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Input {...field} />
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