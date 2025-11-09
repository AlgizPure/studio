# ✅ Stage 4.2.1 - Quick Testing Guide

## 🎯 STATUS: READY FOR TESTING

All code has been implemented. Now it's time to test!

---

## 🧪 QUICK TESTS (15 minutes)

### Test 1: Export for AI Analysis ⏱️ 2 min
```
1. Navigate to: http://localhost:9002/analytics
2. Click: "Export for Claude Analysis" button
3. ✅ File downloads: zenith-analysis-2025-10-30.md
4. Open file and verify:
   - Header with date and user ID
   - Section 2: Active Programs (ZTL YAML format)
   - Section 3: Completed Workouts (JSON)
   - Section 4: Workout Feedback
```

### Test 2: Import Program ⏱️ 3 min
```
1. Navigate to: http://localhost:9002/programs
2. Click: "Import Program" button
3. Paste this YAML:

meta:
  version: '1.0'
  id: test-program
  name: Test Program
  goal: hypertrophy
schedule:
  pattern: days_of_week
  days:
    - monday
workouts:
  - id: test-workout
    name: Test Workout
    day: monday
    cycles:
      - type: normal
        exercises:
          - id: test-ex
            name: Test Exercise
            sets: 3
            target_reps: '10'
            target_weight_kg: 50

4. Click "Validate"
5. ✅ Shows: "PROGRAM PREVIEW"
6. Toggle between YAML/JSON views
7. Click "Import & Activate" (stub currently)
```

### Test 3: Workout Feedback ⏱️ 5 min
```
1. Navigate to: http://localhost:9002/programs/[any-program-id]
2. Click "Start Workout" on any workout
3. Complete sets (use any values)
4. Click "Complete" button
5. ✅ Feedback dialog appears
6. Select tags: 💪 Strong, 🔥 Great Pump
7. Write note: "Felt good today"
8. Click "Save Feedback"
9. Verify in Firestore console:
   - workoutLogs/{log-id}/userFeedback
   - workoutLogs/{log-id}/feedbackTags
```

### Test 4: Error Handling ⏱️ 2 min
```
Import Dialog:
1. Paste invalid YAML: "meta: {version: 2.0}"
2. Click "Validate"
3. ✅ Shows error: "version must be 1.0"
```

### Test 5: Round-trip (Advanced) ⏱️ 3 min
```
1. Export data (Test 1)
2. Extract ZTL from Section 2
3. Import it back (Test 2)
4. ✅ No validation errors
5. ✅ Data preserved exactly
```

---

## ❌ KNOWN ISSUES (TODO)

### Not Implemented Yet:
1. **Import Persistence**: Import dialog validates but doesn't save to Firestore
   - **Fix**: Wire `handleImport` to Firestore API
   
2. **Real Scheduling**: `generateScheduledWorkouts` uses placeholder logic
   - **Fix**: Map `Program.workouts.schedule` to actual dates
   
3. **Collision Detection**: Duplicate program IDs not handled
   - **Fix**: Check existing IDs before import

### These are EXPECTED and documented in the report!

---

## 🐛 IF YOU FIND BUGS

### Export not working?
- Check browser console for errors
- Verify user has active programs
- Check workoutLogs collection exists

### Import validation fails?
- Verify YAML syntax (proper indentation)
- Check version is '1.0' (string)
- Ensure all required fields present

### Feedback dialog doesn't appear?
- Check `workout-execution-mode.tsx` has been updated
- Verify state: `showFeedback` and `pendingLog`
- Look for console errors

---

## 📊 NEXT STEPS

After testing:
1. ✅ Confirm all 5 tests pass
2. 📝 Note any bugs or improvements
3. 🚀 Ready for Stage 4.2.2 (Gemini Integration)

---

## 📞 SUPPORT

All implementation details in:
**[View Full Report](computer:///mnt/user-data/outputs/STAGE_4.2.1_FINAL_REPORT.md)**

The report contains:
- Complete architecture
- Code examples
- Known limitations
- Future roadmap
