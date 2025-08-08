import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { showInfo } from '@/utils/toast';

type NotificationPayload = {
  perihal: string;
  pengirim: string;
};

type Notification = {
  id: string;
  created_at: string;
  payload: NotificationPayload;
  read: boolean;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (title: string, options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('surat-masuk-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'surat_masuk' },
        (payload) => {
          const newSurat = payload.new as { perihal: string; pengirim: string };
          
          const newNotification: Notification = {
            id: new Date().toISOString() + Math.random(),
            created_at: new Date().toISOString(),
            payload: {
              perihal: newSurat.perihal,
              pengirim: newSurat.pengirim,
            },
            read: false,
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          const notificationTitle = 'Surat Masuk Baru!';
          const notificationBody = `Perihal: ${newSurat.perihal}\nDari: ${newSurat.pengirim}`;
          
          showBrowserNotification(notificationTitle, {
            body: notificationBody,
            icon: '/logo-lombok-barat.png',
          });
          
          showInfo(`Surat Masuk Baru: ${newSurat.perihal}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
      if (!open && unreadCount > 0) {
          setUnreadCount(0);
          setNotifications(notifications.map(n => ({...n, read: true})));
      }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-1 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Buka notifikasi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem key={notification.id} className={`flex flex-col items-start gap-1 whitespace-normal ${!notification.read ? 'font-semibold' : ''}`}>
              <p className="text-sm">Surat Masuk Baru</p>
              <p className={`text-xs text-muted-foreground ${!notification.read ? 'font-normal' : ''}`}>
                Perihal: {notification.payload.perihal} dari {notification.payload.pengirim}
              </p>
              <p className="text-xs text-muted-foreground/70 font-normal">
                {new Date(notification.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi baru.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}