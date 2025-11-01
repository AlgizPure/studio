# Setup Guide - New Features

## 🚀 Quick Setup (3 Priority Modules)

### Prerequisites
- Firebase project with Firestore enabled
- Node.js environment set up
- Next.js app running

---

## 1️⃣ Push Notifications Setup

### Step 1: Enable Cloud Messaging in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to: **Project Settings** → **Cloud Messaging** tab
4. Under "Web configuration", click **Generate key pair**
5. Copy the generated VAPID key

### Step 2: Add Environment Variable

Add to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Step 3: Verify Service Worker

The service worker is already created at:
```
studio/public/firebase-messaging-sw.js
```

No additional setup needed - it will be auto-registered by Firebase SDK.

### Step 4: Test Notifications

1. Run the app: `npm run dev`
2. Open in browser (must be HTTPS or localhost)
3. After 3 seconds, permission dialog will appear
4. Grant permission
5. Check browser console for token confirmation

### Verification Checklist:
- [ ] VAPID key added to `.env.local`
- [ ] Service worker file exists in `/public`
- [ ] Permission dialog appears on app load
- [ ] Token saved to user profile in Firestore
- [ ] Console shows: `[FCM] Registration token obtained`

---

## 2️⃣ Enhanced "Today" UI v2

### No Setup Required! ✅

The new UI is ready to use out of the box.

### How to Enable:

1. Open the app
2. Look for the toggle button in header (📋/🎛️ icon)
3. Click to switch between Classic and Enhanced views
4. Preference is saved in localStorage

### Features Available:
- ✅ Time-of-day grouping
- ✅ Swipe gestures (right = complete, left = skip)
- ✅ Daily progress bar
- ✅ Collapsible sections

### Time Groups:
Habits are automatically grouped based on their `timeWindow`:
- 🌅 Morning: 04:00 - 12:00
- ☀️ Afternoon: 12:00 - 18:00
- 🌙 Evening: 18:00 - 23:59
- 📋 Anytime: No time window set

---

## 3️⃣ Streak Management UI

### No Setup Required! ✅

Streak features work automatically with existing data.

### How to Use:

1. Click **Streaks** button in header (🔥 icon)
2. Select a habit from dropdown
3. View detailed stats:
   - Current streak
   - Best streak
   - Habit Strength Score (HSS)
   - Skip tokens
   - 90-day completion rate

### Features:
- **Skip Tokens**: Use to skip without breaking streak (2/month)
- **Freeze Streak**: Pause for vacation/illness (max 14 days)
- **HSS Score**: Comprehensive habit strength metric

---

## 📦 Complete File Structure

### New Files Created:

```
studio/
├── public/
│   └── firebase-messaging-sw.js          # Service worker
├── src/
│   ├── firebase/
│   │   └── messaging.ts                  # FCM utilities
│   ├── lib/
│   │   └── reminder-scheduler.ts         # Scheduling logic
│   └── components/
│       ├── notification-permission-dialog.tsx
│       ├── today-habits-v2.tsx
│       ├── swipeable-habit-card.tsx
│       ├── habit-streak-card.tsx
│       ├── freeze-streak-dialog.tsx
│       └── streaks-dialog.tsx
└── docs/
    ├── NEW_FEATURES_GUIDE.md
    └── SETUP_NEW_FEATURES.md (this file)
```

### Modified Files:
- `src/components/habit-tracker.tsx` - Added new UI toggle and integrations
- `src/firebase/provider.tsx` - Added useFirebase export

---

## 🧪 Testing Scenarios

### Test 1: Push Notifications
```bash
# Terminal 1: Start dev server
npm run dev

# Browser:
# 1. Open http://localhost:3000
# 2. Wait 3 seconds for permission dialog
# 3. Click "Enable Notifications"
# 4. Check browser DevTools → Application → Service Workers
# 5. Verify service worker is registered
```

Expected console output:
```
[FCM] Registration token obtained: eyJhbGc...
[FCM] Subscribed to habit reminders
```

### Test 2: Enhanced Today UI
```bash
# In browser:
# 1. Add several habits with different time windows
# 2. Click grid icon (🎛️) in header
# 3. Verify habits grouped by time of day
# 4. Try swiping a habit card right/left
# 5. Check localStorage: habit-tracker-layout = 'v2'
```

### Test 3: Streak Management
```bash
# In browser:
# 1. Click "Streaks" button (🔥)
# 2. Select a habit
# 3. Verify HSS calculation is correct
# 4. Try using a skip token (if available)
# 5. Try freezing the streak
```

---

## 🔧 Troubleshooting

### Issue: Permission dialog doesn't appear
**Solutions:**
- Check if notifications are supported: `console.log(Notification.permission)`
- Clear localStorage: `localStorage.removeItem('notification-permission-dismissed')`
- Try incognito mode (fresh state)

### Issue: Service worker not registering
**Solutions:**
- Check file exists: `public/firebase-messaging-sw.js`
- Verify VAPID key is set in `.env.local`
- Check browser console for errors
- Ensure running on localhost or HTTPS

### Issue: Swipe gestures not working
**Solutions:**
- Check if using touch or mouse
- Verify threshold: swipe >80px
- Try classic view if issues persist
- Check browser console for errors

### Issue: Streaks not displaying
**Solutions:**
- Verify `habitLogs` collection has data
- Check `habitStreaks` collection exists
- Ensure habit has logs for calculation
- Check browser console for calculation errors

---

## 🌐 Browser Compatibility

### Push Notifications:
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (Desktop - limited, iOS - not supported)
- ❌ iOS Safari (Apple restriction)

### Swipe Gestures:
- ✅ All modern browsers
- ✅ Touch devices
- ✅ Mouse/trackpad

### Progressive Web App:
- Consider using native wrapper for iOS push notifications
- Alternatives: OneSignal, Pushwoosh (cross-platform)

---

## 📊 Database Structure

### New/Updated Collections:

#### `users/{userId}/habitStreaks/{habitId}`
```typescript
{
  habitId: string;
  current: number;
  longest: number;
  frozenUntil?: string;        // ISO date
  skipTokens: number;
  maxSkipTokens: number;
  lastCompletedDate?: string;
}
```

#### `users/{userId}` (updated)
```typescript
{
  // ... existing fields
  fcmToken?: string;            // FCM registration token
}
```

---

## 🚦 Deployment Checklist

Before deploying to production:

- [ ] VAPID key added to production environment
- [ ] Service worker accessible at `/firebase-messaging-sw.js`
- [ ] HTTPS enabled (required for push notifications)
- [ ] Firestore security rules allow token storage
- [ ] Test on multiple browsers
- [ ] Test notification actions (complete/snooze/skip)
- [ ] Verify localStorage permissions
- [ ] Check mobile responsiveness

---

## 📈 Monitoring

### Metrics to Track:
1. **Notifications:**
   - Permission grant rate
   - Token registration success rate
   - Notification click-through rate
   - Action button usage (complete/snooze/skip)

2. **UI v2 Adoption:**
   - Percentage using enhanced view
   - Swipe gesture usage
   - Session duration comparison

3. **Streak Engagement:**
   - Skip token usage rate
   - Freeze feature usage
   - HSS distribution
   - Average streak length

### Firebase Analytics Events:
```typescript
// Example tracking (add to components)
analytics.logEvent('notification_permission_granted');
analytics.logEvent('ui_v2_enabled');
analytics.logEvent('streak_frozen', { habitId, days });
analytics.logEvent('skip_token_used', { habitId });
```

---

## 🔐 Security Considerations

### Service Worker:
- Served from same origin as app
- No sensitive data in service worker
- Token validation on backend recommended

### FCM Tokens:
- Tokens should be refreshed periodically
- Invalid tokens should be removed from Firestore
- Implement token rotation strategy

### Firestore Rules:
```javascript
// Ensure users can only access their own data
match /users/{userId}/habitStreaks/{streakId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == userId;
}

match /users/{userId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == userId;
}
```

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Permission dialog appears and grants successfully
2. ✅ FCM token visible in Firestore under user document
3. ✅ Service worker registered in DevTools
4. ✅ UI toggle button switches between views
5. ✅ Habits grouped by time in v2 view
6. ✅ Swipe gestures trigger complete/skip actions
7. ✅ Streaks dialog shows accurate HSS scores
8. ✅ Freeze and skip token features work
9. ✅ No console errors
10. ✅ Smooth animations and transitions

---

## 💬 Support

If you encounter issues:

1. Check console for errors
2. Review [NEW_FEATURES_GUIDE.md](./NEW_FEATURES_GUIDE.md)
3. Verify Firebase configuration
4. Check browser compatibility
5. Review Firestore security rules

---

**Setup complete! All 3 priority modules are ready to use.** 🎉

Next steps:
- Test on different devices
- Monitor user engagement
- Gather feedback
- Plan Phase 2 features (AI auto-assignment, system insights, etc.)

Last Updated: 2024-11-01

