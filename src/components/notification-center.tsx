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

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription to notifications
  useEffect(() => {
    if (!user || !firestore) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(firestore, `users/${user.uid}/notifications`);
    const notificationsQuery = query(
      notificationsRef,
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(50) // Limit to 50 most recent unread
    );

    // Also get recent read notifications (last 10)
    const readQuery = query(
      notificationsRef,
      where('read', '==', true),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    let unreadUnsubscribe: (() => void) | null = null;
    let readUnsubscribe: (() => void) | null = null;

    try {
      // Subscribe to unread notifications
      unreadUnsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const unread = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as InAppNotification[];

          // Subscribe to read notifications
          readUnsubscribe = onSnapshot(
            readQuery,
            (readSnapshot) => {
              const read = readSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              })) as InAppNotification[];

              setNotifications([...unread, ...read]);
              setLoading(false);
            },
            (error) => {
              console.error('[NotificationCenter] Error fetching read notifications:', error);
              setNotifications(unread);
              setLoading(false);
            }
          );
        },
        (error) => {
          console.error('[NotificationCenter] Error fetching notifications:', error);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('[NotificationCenter] Setup error:', error);
      setLoading(false);
    }

    return () => {
      unreadUnsubscribe?.();
      readUnsubscribe?.();
    };
  }, [user, firestore]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleNotificationClick = async (notification: InAppNotification) => {
    if (!user || !firestore) return;

    // Mark as read
    if (!notification.read) {
      try {
        await markNotificationAsRead(firestore, user.uid, notification.id);
      } catch (error) {
        console.error('[NotificationCenter] Error marking as read:', error);
      }
    }

    // Navigate if action URL provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user || !firestore) return;

    try {
      await markAllNotificationsAsRead(firestore, user.uid);
      toast({
        title: 'All notifications marked as read',
        description: `${unreadCount} notification${unreadCount !== 1 ? 's' : ''} marked as read`,
      });
    } catch (error) {
      console.error('[NotificationCenter] Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) return;

    try {
      await deleteNotification(firestore, user.uid, notificationId);
      toast({
        title: 'Notification deleted',
      });
    } catch (error) {
      console.error('[NotificationCenter] Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'habit_reminder':
        return '⏰';
      case 'workout_complete':
        return '💪';
      case 'streak_milestone':
        return '🔥';
      case 'streak_broken':
        return '💔';
      case 'ai_insight':
        return '🤖';
      case 'program_reminder':
        return '📅';
      case 'achievement':
        return '🏆';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: InAppNotification['type']) => {
    switch (type) {
      case 'habit_reminder':
        return 'border-blue-200 bg-blue-50';
      case 'workout_complete':
        return 'border-green-200 bg-green-50';
      case 'streak_milestone':
        return 'border-orange-200 bg-orange-50';
      case 'streak_broken':
        return 'border-red-200 bg-red-50';
      case 'ai_insight':
        return 'border-purple-200 bg-purple-50';
      case 'program_reminder':
        return 'border-indigo-200 bg-indigo-50';
      case 'achievement':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Separate notifications into unread and read
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <>
      {/* Bell Button with Badge */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn('relative', className)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
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

      {/* Notification Center Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'All caught up!'}
                </DialogDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-2">
                      Unread
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDelete={(e) => handleDelete(notification.id, e)}
                        getIcon={getNotificationIcon}
                        getColor={getNotificationColor}
                      />
                    ))}
                  </>
                )}

                {/* Read Notifications */}
                {readNotifications.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-4">
                      Earlier
                    </div>
                    {readNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDelete={(e) => handleDelete(notification.id, e)}
                        getIcon={getNotificationIcon}
                        getColor={getNotificationColor}
                      />
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
      className={cn(
        'relative p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md group',
        getColor(notification.type),
        !notification.read && 'ring-2 ring-primary ring-offset-1'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-semibold text-sm">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5">{timeAgo}</p>
            </div>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>
          {notification.actionLabel && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {notification.actionLabel}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100"
          onClick={onDelete}
        >
          ×
        </Button>
      </div>
    </div>
  );
}

