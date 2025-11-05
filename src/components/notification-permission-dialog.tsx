'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirebaseApp, useFirestore } from '@/firebase/provider';
import { subscribeToHabitReminders, getNotificationPermission, isNotificationSupported, onForegroundMessage } from '@/firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { createNotificationFromPush, createNotification } from '@/lib/notification-helpers';

/**
 * @fileoverview Компонент для управления разрешениями на push-уведомления.
 */

/**
 * Компонент, управляющий запросом разрешений на уведомления,
 * подпиской на push-уведомления через FCM (Firebase Cloud Messaging)
 * и отображением статуса разрешений.
 * @returns {JSX.Element} React-компонент.
 */
export function NotificationPermissionDialog() {
  const { user } = useUser();
  const firebaseApp = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  // Автоматически открывать диалог, если уведомления поддерживаются, но разрешение не дано
  useEffect(() => {
    if (!user) return;
    const dismissed = localStorage.getItem('notification-permission-dismissed');
    if (isNotificationSupported() && getNotificationPermission() === 'default' && !dismissed) {
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Инициализация слушателя FCM для сохранения уведомлений в Firestore
  useEffect(() => {
    if (!user || !firebaseApp || !firestore || permission !== 'granted') return;

    const unsubscribe = onForegroundMessage(
      firebaseApp,
      (payload) => {
        // Показать уведомление браузера при необходимости
        if (Notification.permission === 'granted') {
          const notification = payload.notification || {};
          new Notification(notification.title || 'Уведомление', {
            body: notification.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
          });
        }
      },
      async (payload) => {
        // Сохранить в Firestore для центра уведомлений в приложении
        try {
          const notificationData = createNotificationFromPush(payload, user.uid);
          await createNotification(firestore, user.uid, notificationData);
        } catch (error) {
          console.error('[NotificationPermission] Не удалось сохранить уведомление:', error);
        }
      }
    );

    return () => unsubscribe();
  }, [user, firebaseApp, firestore, permission]);

  /**
   * Обрабатывает включение уведомлений.
   */
  const handleEnable = async () => {
    if (!user || !firebaseApp || !firestore) return;
    
    setBusy(true);
    try {
      const success = await subscribeToHabitReminders(firebaseApp, user.uid, async (data) => {
        const userDoc = doc(firestore, `users/${user.uid}`);
        await updateDoc(userDoc, data);
      });

      if (success) {
        toast({
          title: 'Уведомления включены',
          description: 'Вы будете получать напоминания о своих привычках',
        });
        setPermission('granted');
        setOpen(false);
      } else {
        toast({
          title: 'Разрешение отклонено',
          description: 'Пожалуйста, включите уведомления в настройках вашего браузера',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[NotificationPermission] Ошибка:', error);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Обрабатывает отклонение запроса на разрешение.
   */
  const handleDismiss = () => {
    localStorage.setItem('notification-permission-dismissed', 'true');
    setOpen(false);
  };

  const PermissionButton = () => {
    if (!isNotificationSupported()) return null;
    return (
      <Button variant={permission === 'granted' ? 'outline' : 'secondary'} size="sm" onClick={() => setOpen(true)}>
        {permission === 'granted' ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </Button>
    );
  };

  return (
    <>
      <PermissionButton />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Включить напоминания о привычках
            </DialogTitle>
            <DialogDescription>
              Получайте своевременные уведомления, чтобы не сбиться с пути.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* ... (описание преимуществ) ... */}
          </div>
          <DialogFooter className="gap-2">
            {permission !== 'granted' && (
              <Button type="button" variant="ghost" onClick={handleDismiss}>
                Может быть, позже
              </Button>
            )}
            <Button type="button" onClick={handleEnable} disabled={busy || permission === 'denied'}>
              {busy ? 'Включение...' : permission === 'granted' ? 'Подписаться заново' : 'Включить уведомления'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
