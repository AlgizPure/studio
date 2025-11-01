# AI Testing Guide for Stage 4.2.2

## Quick Testing Checklist

### 1. Mock Mode Testing (No API Key Required)

Set environment variable:
```bash
NEXT_PUBLIC_AI_MOCK=1
```

**Test Quick Insights:**
1. Go to `/analytics`
2. Click "Get AI Insights"
3. Should see mock insights immediately (no API call)

**Test Progression Suggestions:**
1. Go to `/programs/[any-program-id]`
2. Click "Get AI Progressions"
3. Should see mock suggestions based on recent workouts

---

### 2. Real API Testing (Requires API Key)

Set environment variable:
```bash
GOOGLE_GENAI_API_KEY=your-key-here
```

**Test Quick Insights:**
1. Ensure you have at least 1-2 workout logs in last 14 days
2. Go to `/analytics`
3. Click "Get AI Insights"
4. Wait 5-10 seconds for Gemini response
5. Verify insights are specific and actionable
6. Refresh page - should see cached insights immediately

**Test Progression Suggestions:**
1. Ensure you have an active program with recent workout logs
2. Go to `/programs/[program-id]` where status = 'active'
3. Click "Get AI Progressions"
4. Wait 5-10 seconds
5. Review suggestions - check confidence scores
6. Test "Apply" button on a suggestion
7. Verify workout's targetWeight is updated in Firestore

---

### 3. Rate Limiting Test

1. Make 10+ requests to `/api/ai/insights` or `/api/ai/progressions`
2. 11th request should return `429` status with message "Daily limit reached"

---

### 4. Error Handling Test

**Test without API key:**
```bash
unset GOOGLE_GENAI_API_KEY
# or remove from .env.local
```
- Should fallback to mock automatically
- No errors should appear

**Test with invalid API key:**
- Set invalid key
- Should retry 3 times, then fallback to mock

---

### 5. Caching Test

1. Generate insights (should take 5-10s)
2. Refresh page immediately
3. Should see cached data (< 1s load)
4. Check timestamp shows "Updated X minutes ago (cached)"
5. After 24 hours, cache should expire and trigger fresh analysis

---

### 6. Data Validation

**Minimum data required:**
- Quick Insights: At least 1 workout log
- Progression Suggestions: At least 1 workout log for the program + exercise history

**Test with insufficient data:**
- Should return helpful error messages
- No crashes

---

## Expected AI Output Quality

### Quick Insights Should:
- ✅ Be specific ("Add 5kg to squat" not "Train harder")
- ✅ Include numbers and dates
- ✅ Have actionable recommendations
- ✅ Show priority correctly (1-3)

### Progression Suggestions Should:
- ✅ Propose safe increases (2.5-5% max)
- ✅ Have confidence scores that make sense
- ✅ Include reasoning for each suggestion
- ✅ Not suggest jumps > 10% weight

---

## Debugging

**Check console logs:**
- `[quick-insights]` - insights generation logs
- `[progression-suggestions]` - progression logs
- `[api/ai/insights]` - API route logs
- `[api/ai/progressions]` - API route logs

**Check Firestore:**
- `users/{uid}/aiInsights/` - cached data
- `users/{uid}/aiUsage/` - daily usage tracking

**Check Network tab:**
- API calls to `/api/ai/insights` and `/api/ai/progressions`
- Response times and status codes
- Response structure

---

## Performance Benchmarks

- **Quick Insights:** < 10 seconds (with API), < 1 second (cached)
- **Progression Suggestions:** < 10 seconds (with API), < 1 second (cached)
- **Apply Suggestion:** < 2 seconds (Firestore update)

---

## Common Issues

**Issue:** "Daily limit reached" too early
- **Fix:** Check `users/{uid}/aiUsage/{date}` in Firestore
- Reset by deleting the document

**Issue:** Insights not generating
- **Fix:** Check API key is set
- Check console for errors
- Verify workout logs exist

**Issue:** Suggestions not applying
- **Fix:** Check workout structure matches expectations
- Verify exerciseId matches in program
- Check Firestore permissions

