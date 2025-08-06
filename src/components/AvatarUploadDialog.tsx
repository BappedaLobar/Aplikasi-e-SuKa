import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/utils/toast';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { ImageUp } from 'lucide-react';

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  avatar: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'Foto profil diperlukan.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Ukuran file maksimal 500KB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      'Hanya format .jpg, .jpeg, .png, dan .webp yang didukung.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function AvatarUploadDialog({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    const file = values.avatar[0];
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showError('Pengguna tidak ditemukan.');
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

    if (uploadError) {
      showError(`Gagal mengunggah foto: ${uploadError.message}`);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      showError(`Gagal memperbarui profil: ${updateError.message}`);
    } else {
      showSuccess('Foto profil berhasil diperbarui.');
      onUploadComplete();
      setOpen(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ImageUp className="mr-2 h-4 w-4" />
          Ubah Foto Profil
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Foto Profil</DialogTitle>
          <DialogDescription>
            Pilih file gambar baru untuk dijadikan foto profil Anda. Ukuran maksimal 500KB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Gambar</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Mengunggah...' : 'Unggah'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}