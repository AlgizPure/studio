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

  // Auto-open dialog if notifications supported but not granted
  useEffect(() => {
    if (!user) return;
    const supported = isNotificationSupported();
    const perm = getNotificationPermission();
    
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('notification-permission-dismissed');
    
    if (supported && perm === 'default' && !dismissed) {
      // Show dialog after 3 seconds
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Initialize FCM listener to save notifications to Firestore
  useEffect(() => {
    if (!user || !firebaseApp || !firestore || permission !== 'granted') return;

    const unsubscribe = onForegroundMessage(
      firebaseApp,
      (payload) => {
        // Show browser notification if needed
        if (Notification.permission === 'granted') {
          const notification = payload.notification || {};
          new Notification(notification.title || 'Notification', {
            body: notification.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
          });
        }
      },
      async (payload) => {
        // Save to Firestore for in-app notification center
        try {
          const notificationData = createNotificationFromPush(payload, user.uid);
          await createNotification(firestore, user.uid, notificationData);
        } catch (error) {
          console.error('[NotificationPermission] Failed to save notification:', error);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, firebaseApp, firestore, permission]);

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
          title: 'Notifications enabled',
          description: 'You will receive reminders for your habits',
        });
        setPermission('granted');
        setOpen(false);
      } else {
        toast({
          title: 'Permission denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[NotificationPermission] Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable notifications',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-permission-dismissed', 'true');
    setOpen(false);
  };

  const handleOpenSettings = () => {
    setOpen(true);
  };

  // Render button in header
  const PermissionButton = () => {
    if (!isNotificationSupported()) return null;

    return (
      <Button
        variant={permission === 'granted' ? 'outline' : 'secondary'}
        size="sm"
        onClick={handleOpenSettings}
        aria-label={permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
      >
        {permission === 'granted' ? (
          <>
            <Bell className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">On</span>
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Off</span>
          </>
        )}
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
              Enable Habit Reminders
            </DialogTitle>
            <DialogDescription>
              Get timely notifications to help you stay on track with your habits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm space-y-2">
              <p className="font-medium">Benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Never miss a scheduled habit</li>
                <li>Smart reminders based on your schedule</li>
                <li>Snooze and reschedule options</li>
                <li>Escalating reminders for important habits</li>
              </ul>
            </div>
            {permission === 'denied' && (
              <div className="bg-destructive/10 text-destructive text-xs p-3 rounded">
                Notifications are blocked. Please enable them in your browser settings:
                <br />
                Settings → Privacy → Notifications → Allow for this site
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {permission !== 'granted' && (
              <Button type="button" variant="ghost" onClick={handleDismiss}>
                Maybe later
              </Button>
            )}
            <Button 
              type="button" 
              onClick={handleEnable} 
              disabled={busy || permission === 'denied'}
            >
              {busy ? 'Enabling...' : permission === 'granted' ? 'Re-subscribe' : 'Enable Notifications'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

