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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";

const jabatanOptions = [
  "Kepala Badan",
  "Sekretaris Badan",
  "Kepala Bidang Litbang Renbang",
  "Kepala Bidang Sosbud",
  "Kepala Bidang Ekonomi",
  "Kepala Bidang Sarpraswil",
  "Fungsional",
  "Staff",
];

const formSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap tidak boleh kosong."),
  role: z.enum(["admin", "user"]),
  nip: z.string().optional(),
  jabatan: z.string().min(1, "Jabatan harus dipilih."),
});

type FormValues = z.infer<typeof formSchema>;

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  nip: string | null;
  jabatan: string | null;
};

export default function EditUserDialog({ user, onUserUpdated }: { user: UserProfile; onUserUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fullName: user.full_name || "",
        role: user.role as "admin" | "user",
        nip: user.nip || "",
        jabatan: user.jabatan || "",
      });
    }
  }, [open, user, form]);

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.functions.invoke('update-user', {
      body: {
        userIdToUpdate: user.id,
        fullName: values.fullName,
        role: values.role,
        nip: values.nip,
        jabatan: values.jabatan,
      },
    });

    if (error) {
      try {
        const errorBody = await error.context.json();
        showError(`Gagal memperbarui pengguna: ${errorBody.error}`);
      } catch {
        showError(`Gagal memperbarui pengguna: ${error.message}`);
      }
    } else {
      showSuccess("Pengguna berhasil diperbarui.");
      onUserUpdated();
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
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Ubah detail untuk pengguna {user.email}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] w-full pr-4">
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Lengkap Pengguna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="NIP Pengguna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jabatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jabatan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-[200px]">
                            {jabatanOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
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