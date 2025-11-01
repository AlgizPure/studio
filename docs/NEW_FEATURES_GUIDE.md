# New Features Guide - Habit Tracker 2.0

## 🚀 Implemented Modules (Priority 1 - CRITICAL)

### 1. Push Notifications ✅

#### Files Created:
- `src/firebase/messaging.ts` - FCM setup and token management
- `src/components/notification-permission-dialog.tsx` - Permission request UI
- `src/lib/reminder-scheduler.ts` - Client-side scheduling logic
- `public/firebase-messaging-sw.js` - Service worker for background notifications

#### Features:
- ✅ FCM integration with VAPID key support
- ✅ Permission request dialog with auto-prompt
- ✅ Token management and storage in user profile
- ✅ Foreground and background message handling
- ✅ Local notification fallback
- ✅ Escalating reminders (3 levels)
- ✅ Snooze functionality (30 minutes)
- ✅ Notification actions (Complete, Snooze, Skip)
- ✅ Smart reminder time analysis

#### Setup Required:
1. Add VAPID key to `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
   ```
2. Enable Cloud Messaging in Firebase Console
3. Generate VAPID key: Firebase Console → Project Settings → Cloud Messaging
4. Deploy service worker to `/public/firebase-messaging-sw.js`

#### Usage:
```tsx
import { NotificationPermissionDialog } from '@/components/notification-permission-dialog';

// In your component
<NotificationPermissionDialog />
```

The dialog will auto-appear 3 seconds after mount if:
- Notifications are supported
- Permission is not granted
- User hasn't dismissed it before

#### API:
```ts
// Request permission manually
const token = await requestNotificationPermission(app);

// Subscribe to reminders
const success = await subscribeToHabitReminders(app, userId, updateProfile);

// Schedule local notification
scheduleLocalNotification('Title', 'Body', delayMs);

// Check support
const supported = isNotificationSupported();
const permission = getNotificationPermission();
```

---

### 2. Enhanced "Today" UI v2 ✅

#### Files Created:
- `src/components/today-habits-v2.tsx` - New time-grouped layout
- `src/components/swipeable-habit-card.tsx` - Swipeable habit cards

#### Features:
- ✅ Time-of-day grouping (Morning, Afternoon, Evening, Anytime)
- ✅ Collapsible sections with progress bars
- ✅ Overall daily progress card
- ✅ Swipe right to complete
- ✅ Swipe left to skip
- ✅ Touch and mouse support
- ✅ Visual swipe indicators
- ✅ Smooth animations
- ✅ Auto-detection of time windows

#### UI Groups:
- 🌅 **Morning** (04:00 - 12:00)
- ☀️ **Afternoon** (12:00 - 18:00)
- 🌙 **Evening** (18:00 - 23:59)
- 📋 **Anytime** (No specific time window)

#### Usage:
```tsx
<TodayHabitsV2
  habits={habits}
  habitLogs={logs}
  streaksMap={streaksMap}
  todaysProgress={progressMap}
  onComplete={handleComplete}
  onSkip={handleSkip}
  onOpenLog={handleOpenLog}
/>
```

#### Swipe Gestures:
- **Swipe Right (>80px)**: Complete habit
- **Swipe Left (>80px)**: Skip habit
- Works with touch and mouse
- Visual feedback during swipe
- Smooth spring-back animation

#### Layout Toggle:
In `HabitTracker`, added a toggle button:
- 📋 List icon = Classic view
- 🎛️ Grid icon = Enhanced v2 view
- Preference saved in localStorage

---

### 3. Streak UI with Management ✅

#### Files Created:
- `src/components/habit-streak-card.tsx` - Detailed streak display
- `src/components/freeze-streak-dialog.tsx` - Freeze streak dialog
- `src/components/streaks-dialog.tsx` - Main streaks dialog

#### Features:
- ✅ Current streak display
- ✅ Longest streak (all-time record)
- ✅ Habit Strength Score (HSS) visualization
- ✅ 90-day completion rate
- ✅ Consistency score
- ✅ Skip tokens management
- ✅ Streak freeze functionality
- ✅ Visual progress indicators

#### Metrics Displayed:

**Main Stats:**
- 🔥 **Current Streak**: Days in a row
- 🏆 **Best Streak**: All-time record
- 📈 **HSS**: Habit Strength Score (0-100%)

**Calculations:**
```
HSS = 0.3 * (currentStreak/30) + 
      0.4 * completionRate90d + 
      0.2 * consistencyScore + 
      0.1 * (longestStreak/100)
```

**Skip Tokens:**
- Default: 2 tokens per month
- Resets on 1st of month
- Use token to skip without breaking streak
- Visual indicator of remaining tokens

**Streak Freeze:**
- Maximum: 14 days
- Once per quarter
- Perfect for vacations/illness
- Presets: 3, 7, 14 days, or custom
- Days don't count toward or against streak

#### Usage:
```tsx
<StreaksDialog
  habits={habits}
  habitLogs={logs}
  streaks={streaksMap}
/>
```

Individual card:
```tsx
<HabitStreakCard
  habit={habit}
  streak={streak}
  logs={logs}
  onFreeze={handleFreeze}
  onUseSkipToken={handleUseSkipToken}
/>
```

---

## 🎯 Integration Points

### In HabitTracker Component:

```tsx
import { NotificationPermissionDialog } from './notification-permission-dialog';
import { StreaksDialog } from './streaks-dialog';
import { TodayHabitsV2 } from './today-habits-v2';

// State
const [useV2Layout, setUseV2Layout] = useState(false);

// In header actions
<NotificationPermissionDialog />
<StreaksDialog habits={habits} habitLogs={logs} streaks={streaksMap} />

// Toggle button
<Button onClick={() => setUseV2Layout(!useV2Layout)}>
  {useV2Layout ? <List /> : <LayoutGrid />}
</Button>

// In CardContent
{useV2Layout ? (
  <TodayHabitsV2 {...props} />
) : (
  // Classic view
)}
```

---

## 🔧 Configuration

### Firebase Cloud Messaging:

1. **Enable FCM:**
   - Firebase Console → Project Settings
   - Cloud Messaging tab
   - Generate Web credentials (VAPID key)

2. **Environment Variables:**
   ```env
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
   ```

3. **Service Worker:**
   - File: `public/firebase-messaging-sw.js`
   - Auto-registered by Firebase SDK
   - Handles background notifications

### Local Storage Keys:

- `habit-tracker-layout`: 'v1' | 'v2'
- `notification-permission-dismissed`: 'true'

---

## 📱 User Experience Flow

### First Time User:
1. Opens app
2. After 3 seconds → Notification permission dialog appears
3. User grants permission → FCM token saved
4. Reminders scheduled automatically

### Viewing Streaks:
1. Click "Streaks" button in header
2. Select a habit from dropdown
3. View detailed stats (HSS, tokens, etc.)
4. Manage freeze or use skip tokens

### Enhanced Today View:
1. Click grid icon to toggle to v2
2. See habits grouped by time of day
3. Swipe right on habit to complete
4. Swipe left to skip
5. Progress bar shows daily completion

---

## 🚨 Known Limitations

1. **Push Notifications:**
   - Requires VAPID key setup
   - iOS Safari has limited support
   - Background notifications need service worker

2. **Swipe Gestures:**
   - May conflict with browser gestures on some devices
   - Threshold set to 80px (adjustable)

3. **Streak Freeze:**
   - Maximum 14 days per freeze
   - Only one freeze per quarter
   - Cannot freeze retroactively

---

## 🎨 Design Tokens

### Colors:
- Morning: `amber-50/amber-200` (sunrise theme)
- Afternoon: `orange-50/orange-200` (sun theme)
- Evening: `indigo-50/indigo-200` (moon theme)
- Streak fire: `orange-600`
- HSS: `emerald-600`

### Animations:
- Swipe transition: 200ms ease-out
- Collapse/expand: 300ms ease-in-out
- Progress bars: 500ms ease-out

---

## 🧪 Testing Checklist

### Notifications:
- [ ] Permission request appears
- [ ] Token saved to Firestore
- [ ] Foreground messages received
- [ ] Background messages work (when app closed)
- [ ] Notification actions (complete/snooze/skip)
- [ ] Escalation (3 levels)

### Today UI v2:
- [ ] Habits grouped by time
- [ ] Sections collapsible
- [ ] Progress bars accurate
- [ ] Swipe right completes
- [ ] Swipe left skips
- [ ] Layout preference saved

### Streaks:
- [ ] HSS calculated correctly
- [ ] Skip tokens work
- [ ] Freeze dialog validates dates
- [ ] Streak preserved during freeze
- [ ] Tokens reset monthly

---

## 📚 Related Documentation

- [Firestore Rules](./FIRESTORE_RULES_NOTES.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Backend API](./backend.json)

---

## 🔮 Future Enhancements

### Planned (Not Yet Implemented):
1. **Cloud Functions for scheduling** (currently client-side)
2. **Smart reminder time adjustment** (AI analyzes actual completion times)
3. **Location-based reminders**
4. **Reminder analytics** (effectiveness tracking)
5. **Group habits by categories** in v2 view
6. **Custom time windows** for grouping
7. **Streak history calendar view**

---

Last Updated: 2024-11-01
Version: 2.0.0

