# Firestore security rules (notes)

Collections under `users/{uid}` should be accessible only to the authenticated owner (uid == request.auth.uid).

## Read/Write patterns
- `users/{uid}/habits`: allow read/write if auth.uid == uid
- `users/{uid}/habitLogs`: allow read/write if auth.uid == uid
- `users/{uid}/habitStreaks`: allow read/write if auth.uid == uid
- `users/{uid}/dailyReflections`: allow read/write if auth.uid == uid
- `users/{uid}/habitInsights`: allow read/write if auth.uid == uid
- `users/{uid}/activeSystems`: allow read/write if auth.uid == uid

## Validation suggestions
- `habitLogs.status` in ['done','partial','skipped','missed']
- `habitLogs.date` matches `/^\d{4}-\d{2}-\d{2}$/`
- `habits.type` in ['boolean','quantity','duration','range']
- Ensure `value`/`durationMin` are non-negative numbers

Implement these in your `firestore.rules` file accordingly.
