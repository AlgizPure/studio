# Reminders architecture (spec)

## Collections
- `users/{uid}/habits` — reminders: `[{ id: 'default', times: ['08:00','20:00'] }]`
- `users/{uid}/scheduledNotifications/{id}` — { habitId, timeISO, escalationLevel, snoozed?: boolean }

## Cloud Functions
- `scheduleDailyReminders` (cron daily 00:05 user TZ)
  - For each habit with reminders: expand today's times → create scheduled docs
- `sendReminder` (pub/sub or scheduled triggers per doc time)
  - Send FCM to device(s). If no completion after 30m → create level 1; after 60m → level 2
  - Cancel when `habitLogs` has { habitId, date=today, status in ['done','partial'] } or habit.completed = true
- `snoozeReminder` (callable)
  - Input: scheduledId, minutes. Action: update timeISO = now + minutes
- `cancelRemindersForHabitAndDate` (util)

## Client
- Dev simulator (env `NEXT_PUBLIC_REMINDER_SIMULATOR=1`) shows toast at exact HH:MM
- Actions from notification: Mark done, Snooze 15/30/60, Open habit

## Notes
- Respect DND windows and calendar events (future)
- Time zone per user, store `tz` in profile
