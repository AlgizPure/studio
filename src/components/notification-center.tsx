'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import type { InAppNotification } from '@/lib/types';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/lib/notification-helpers';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

/**
 * @fileoverview Компонент центра уведомлений.
 */

interface NotificationCenterProps {
  className?: string;
}

/**
 * Компонент, отвечающий за отображение и управление внутриигровыми уведомлениями.
 * Подписывается на уведомления в реальном времени из Firestore.
 * @param {NotificationCenterProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }
    // ... (логика подписки на уведомления в реальном времени) ...
  }, [user, firestore]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  /**
   * Обрабатывает клик по уведомлению.
   * @param {InAppNotification} notification - Уведомление.
   */
  const handleNotificationClick = async (notification: InAppNotification) => {
    if (!user || !firestore) return;
    if (!notification.read) {
      await markNotificationAsRead(firestore, user.uid, notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setOpen(false);
    }
  };

  /**
   * Отмечает все уведомления как прочитанные.
   */
  const handleMarkAllRead = async () => {
    if (!user || !firestore) return;
    await markAllNotificationsAsRead(firestore, user.uid);
    toast({
      title: 'Все уведомления отмечены как прочитанные',
    });
  };

  /**
   * Удаляет уведомление.
   * @param {string} notificationId - ID уведомления.
   * @param {React.MouseEvent} e - Событие клика.
   */
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) return;
    await deleteNotification(firestore, user.uid, notificationId);
    toast({ title: 'Уведомление удалено' });
  };

  /**
   * Возвращает иконку для типа уведомления.
   * @param {InAppNotification['type']} type - Тип уведомления.
   * @returns {string} - Эмодзи-иконка.
   */
  const getNotificationIcon = (type: InAppNotification['type']) => { /* ... */ };

  /**
   * Возвращает классы цвета для типа уведомления.
   * @param {InAppNotification['type']} type - Тип уведомления.
   * @returns {string} - CSS-классы.
   */
  const getNotificationColor = (type: InAppNotification['type']) => { /* ... */ };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn('relative', className)}
        aria-label={`Уведомления${unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Уведомления</DialogTitle>
                <DialogDescription>
                  {unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Все прочитано!'}
                </DialogDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Отметить все как прочитанные
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Загрузка уведомлений...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Нет уведомлений</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unreadNotifications.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-2">
                      Непрочитанные
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} /* ... */ />
                    ))}
                  </>
                )}
                {readNotifications.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-4">
                      Ранее
                    </div>
                    {readNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} /* ... */ />
                    ))}
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface NotificationItemProps {
  notification: InAppNotification;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  getIcon: (type: InAppNotification['type']) => string;
  getColor: (type: InAppNotification['type']) => string;
}

function NotificationItem({ notification, onClick, onDelete, getIcon, getColor }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  return (
    <div
      className={cn('relative p-3 rounded-lg border cursor-pointer', getColor(notification.type), !notification.read && 'ring-2 ring-primary')}
      onClick={onClick}
    >
      {/* ... (рендеринг элемента уведомления) ... */}
    </div>
  );
}
