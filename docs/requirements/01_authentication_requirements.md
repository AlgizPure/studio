# Authentication Module Requirements

**Module ID:** Module 1
**Total Functions:** 5
**Priority:** CRITICAL
**Status:** ✅ Implemented 100%
**Dependencies:** Firebase Auth

---

## Overview

The Authentication module provides secure user authentication and session management using Firebase Authentication. This module is the foundation of Zenith Trainer, ensuring that all user data is protected and access is properly controlled.

The module handles user registration, login, password reset, profile management, and persistent sessions. All authentication flows use Firebase Auth's email/password provider with httpOnly session cookies for security.

**Key Capabilities:**
- Secure email/password authentication with industry-standard encryption
- Persistent sessions across browser sessions and devices
- Password reset via email with Firebase's secure reset flow
- User profile management with Firestore integration
- Protected routes ensuring authenticated-only access

**Integration Points:**
- **Firebase Auth:** Core authentication service
- **Firestore:** User profile storage (`/users/{userId}`)
- **All Modules:** Every module depends on Authentication for user identification

---

## Function 1.1: Email/Password Registration

### User Story
**As a** new user  
**I want to** create an account with my email and password  
**So that** I can access Zenith Trainer and start tracking my workouts

### Acceptance Criteria

**Scenario 1: Successful Registration**
- **Given** I am on the signup page
- **When** I enter a valid email (format: user@example.com) and password (min 8 characters)
- **And** I confirm the password matches
- **Then** Firebase Auth creates my account
- **And** A user profile document is created in Firestore `/users/{userId}`
- **And** I am automatically logged in
- **And** I am redirected to the dashboard

**Scenario 2: Invalid Email Format**
- **Given** I am on the signup page
- **When** I enter an invalid email (e.g., "notanemail" or "user@")
- **Then** I see validation error: "Please enter a valid email address"
- **And** The form does not submit

**Scenario 3: Weak Password**
- **Given** I am on the signup page
- **When** I enter a password shorter than 8 characters
- **Then** I see validation error: "Password must be at least 8 characters"
- **And** The form does not submit

**Scenario 4: Password Mismatch**
- **Given** I am on the signup page
- **When** I enter password "MyPassword123" and confirmation "DifferentPassword"
- **Then** I see validation error: "Passwords do not match"
- **And** The form does not submit

**Scenario 5: Email Already in Use**
- **Given** An account exists with email "existing@example.com"
- **When** I try to register with the same email
- **Then** Firebase Auth returns error
- **And** I see error message: "This email is already registered. Please log in instead."
- **And** A "Log in" link is provided

### Technical Requirements

**Frontend:**
- Component: `SignupPage`
- Location: `src/app/signup/page.tsx`
- Form Library: React Hook Form
- Validation: Zod schema

**Zod Schema:**
```typescript
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

**Backend:**
- Firebase Auth method: `createUserWithEmailAndPassword(auth, email, password)`
- Firestore: Create user document at `/users/{userId}`

**User Profile Document:**
```typescript
interface UserProfile {
  email: string;
  displayName: string; // defaults to email username
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultRestTime: number; // seconds (default: 60)
    defaultRPE: number; // 1-10 (default: 7)
  };
}
```

### UI Behavior

**Layout:**
- Centered card layout (max-width: 400px)
- Zenith Trainer logo at top
- Form fields: Email, Password, Confirm Password
- Submit button: "Create Account"
- Link to login: "Already have an account? Log in"

**User Interactions:**
1. User enters email → Real-time format validation
2. User enters password → Real-time length validation, strength indicator
3. User confirms password → Real-time match validation
4. User clicks "Create Account" → Loading state, disabled button
5. On success → Redirect to dashboard
6. On error → Show error message, re-enable form

**UI States:**
- **Loading:** Button shows spinner, text: "Creating account..."
- **Success:** Brief success toast, then redirect
- **Error:** Red alert banner with error message
- **Validation:** Inline field errors (red text below input)

**Responsive Behavior:**
- Mobile: Full-width card, larger touch targets
- Desktop: Fixed-width card (400px), centered

### Error Handling

**Validation Errors:**
- Invalid email → "Please enter a valid email address"
- Short password → "Password must be at least 8 characters"
- Password mismatch → "Passwords do not match"

**System Errors:**
- Email already in use → "This email is already registered. Please log in instead."
- Network error → "Network error. Please check your connection and try again."
- Firebase error (unknown) → "An error occurred. Please try again."

**Recovery:**
- All errors allow user to correct input and retry
- "Log in" link provided if email already registered

### Edge Cases

- **Empty form submission:** All fields show "This field is required"
- **Special characters in email:** Allowed (e.g., "user+tag@example.com")
- **Uppercase email:** Normalized to lowercase by Firebase
- **Leading/trailing spaces:** Trimmed before validation
- **Very long email (>256 chars):** Validation error
- **Password with special chars:** Allowed and encouraged

### Dependencies

**Requires:**
- Firebase Auth configured (API keys in env vars)
- Firestore Security Rules allowing user document creation

**Blocks:**
- All authenticated features (user must be registered to use app)

**External Dependencies:**
- Firebase Auth service
- Firestore database

### Testing Considerations

**Unit Tests:**
- Zod schema validation (test all edge cases)
- User profile document creation

**Integration Tests:**
- Firebase Auth `createUserWithEmailAndPassword` call
- Firestore document created correctly

**E2E Tests:**
- Complete signup flow (enter email, password, submit, verify redirect)
- Error scenarios (invalid email, weak password, email in use)
- UI state changes (loading, success, error)

---

## Function 1.2: Email/Password Login

### User Story
**As a** registered user  
**I want to** log in with my email and password  
**So that** I can access my workout data and continue training

### Acceptance Criteria

**Scenario 1: Successful Login**
- **Given** I have a registered account
- **When** I enter my correct email and password
- **Then** Firebase Auth authenticates me
- **And** My session is persisted (httpOnly cookie)
- **And** I am redirected to the dashboard

**Scenario 2: Incorrect Password**
- **Given** I have a registered account
- **When** I enter my email but wrong password
- **Then** I see error: "Incorrect email or password"
- **And** I remain on the login page

**Scenario 3: Unregistered Email**
- **Given** I enter an email that is not registered
- **When** I submit the form
- **Then** I see error: "No account found with this email"
- **And** A "Sign up" link is provided

**Scenario 4: Persistent Session**
- **Given** I logged in successfully
- **When** I close and reopen my browser
- **Then** I am still logged in (session persisted)

**Scenario 5: Account Locked (After Multiple Failed Attempts)**
- **Given** I entered wrong password 5+ times
- **When** I try to log in again
- **Then** Firebase temporarily locks the account
- **And** I see error: "Too many failed login attempts. Please try again later or reset your password."

### Technical Requirements

**Frontend:**
- Component: `LoginPage`
- Location: `src/app/login/page.tsx`
- Form Library: React Hook Form
- Validation: Zod schema

**Zod Schema:**
```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
});
```

**Backend:**
- Firebase Auth method: `signInWithEmailAndPassword(auth, email, password)`
- Session: Firebase Auth token stored in httpOnly cookie

**Authentication/Authorization:**
- Required: No (this is the login endpoint)
- Permissions: Public route

### API Specification

Not applicable - client-side Firebase Auth SDK

### UI Behavior

**Layout:**
- Centered card (max-width: 400px)
- Logo, "Welcome back" heading
- Email and Password fields
- "Forgot password?" link below password field
- Submit button: "Log In"
- Link to signup: "Don't have an account? Sign up"

**User Interactions:**
1. User enters credentials
2. User clicks "Log In" → Loading state
3. On success → Redirect to dashboard
4. On error → Show error message

**UI States:**
- **Loading:** Button spinner, text: "Logging in..."
- **Success:** Brief success toast, redirect
- **Error:** Red alert banner
- **Remember Me:** Optional checkbox (future feature)

**Responsive Behavior:**
- Same as signup page

### Error Handling

**Validation Errors:**
- Empty email → "Email is required"
- Empty password → "Password is required"
- Invalid email format → "Please enter a valid email"

**System Errors:**
- Wrong credentials → "Incorrect email or password" (generic for security)
- Account locked → "Too many failed attempts. Please try again later or reset your password."
- Network error → "Network error. Please check your connection."

**Recovery:**
- "Forgot password?" link prominently displayed
- "Sign up" link if user doesn't have account

### Edge Cases

- **Case-insensitive email:** Firebase normalizes to lowercase
- **Copy-paste password with whitespace:** Trimmed
- **Login during Firebase outage:** Show error, suggest trying later
- **Expired session token:** Auto re-login on next API call

### Dependencies

**Requires:**
- Firebase Auth configured
- User must have registered account

**Blocks:**
- Access to all authenticated routes

**External Dependencies:**
- Firebase Auth service

### Testing Considerations

**Unit Tests:**
- Form validation
- Error message display logic

**Integration Tests:**
- Firebase `signInWithEmailAndPassword` call
- Session token storage

**E2E Tests:**
- Successful login flow
- Incorrect password flow
- Persistent session (close/reopen browser)
- "Forgot password" link navigation

---

## Function 1.3: Password Reset

### User Story
**As a** user who forgot my password  
**I want to** reset my password via email  
**So that** I can regain access to my account

### Acceptance Criteria

**Scenario 1: Request Password Reset**
- **Given** I am on the login page
- **When** I click "Forgot password?"
- **Then** I am taken to the password reset page
- **And** I see a form to enter my email

**Scenario 2: Successful Reset Email Sent**
- **Given** I enter my registered email
- **When** I click "Send reset link"
- **Then** Firebase sends a password reset email
- **And** I see confirmation: "Password reset email sent. Check your inbox."

**Scenario 3: Reset Email for Unregistered Email**
- **Given** I enter an email that is not registered
- **When** I click "Send reset link"
- **Then** Firebase does not send email (security: don't reveal account existence)
- **And** I still see confirmation: "Password reset email sent. Check your inbox." (generic response)

**Scenario 4: Complete Password Reset**
- **Given** I received the password reset email
- **When** I click the link in the email
- **Then** I am taken to Firebase's password reset page
- **And** I can enter a new password
- **And** My password is updated
- **And** I can log in with the new password

### Technical Requirements

**Frontend:**
- Component: `PasswordResetPage`
- Location: `src/app/reset-password/page.tsx`
- Form: Single email field

**Backend:**
- Firebase Auth method: `sendPasswordResetEmail(auth, email)`
- Reset flow: Handled by Firebase (hosted reset page)

**Authentication/Authorization:**
- Required: No (public route)

### UI Behavior

**Layout:**
- Centered card
- Heading: "Reset your password"
- Instructions: "Enter your email and we'll send you a link to reset your password"
- Email field
- Submit button: "Send reset link"
- Back to login link

**User Interactions:**
1. User enters email
2. User clicks "Send reset link" → Loading
3. Firebase sends email → Success message
4. User checks email → Clicks link → Firebase hosted page

**UI States:**
- **Loading:** Button spinner, "Sending..."
- **Success:** Green alert: "Password reset email sent. Check your inbox (and spam folder)."
- **Error:** Red alert with error message

### Error Handling

**Validation Errors:**
- Empty email → "Email is required"
- Invalid email → "Please enter a valid email"

**System Errors:**
- Network error → "Network error. Please try again."
- Firebase error → "An error occurred. Please try again."

**Recovery:**
- Allow user to re-enter email and retry

### Edge Cases

- **Email not registered:** Still show success (don't reveal account existence)
- **User requests reset multiple times:** Firebase rate-limits (max 3-5 per hour)
- **Reset link expired (24 hours):** User must request new link

### Dependencies

**Requires:**
- Firebase Auth configured
- Email delivery service (Firebase built-in)

**Blocks:**
- None (password reset is independent flow)

**External Dependencies:**
- Firebase Auth
- Email delivery

### Testing Considerations

**Unit Tests:**
- Email validation

**Integration Tests:**
- `sendPasswordResetEmail` call
- Email sent confirmation

**E2E Tests:**
- Request password reset → Check success message
- (Cannot test email delivery in E2E, requires manual verification)

---

## Function 1.4: User Profile Management

### User Story
**As a** logged-in user  
**I want to** view and update my profile (display name, preferences)  
**So that** I can personalize my Zenith Trainer experience

### Acceptance Criteria

**Scenario 1: View Profile**
- **Given** I am logged in
- **When** I navigate to settings/profile page
- **Then** I see my email (read-only)
- **And** I see my display name (editable)
- **And** I see my preferences (theme, default rest time, default RPE)

**Scenario 2: Update Display Name**
- **Given** I am on the profile page
- **When** I change my display name from "John" to "John Doe"
- **And** I click "Save"
- **Then** Firestore updates my user document
- **And** I see success message: "Profile updated"
- **And** My new display name appears throughout the app

**Scenario 3: Update Preferences**
- **Given** I am on the profile page
- **When** I change theme to "dark", default rest time to 90s, default RPE to 8
- **And** I click "Save"
- **Then** Firestore updates my preferences
- **And** Theme changes immediately
- **And** New defaults apply to future workouts

### Technical Requirements

**Frontend:**
- Component: `ProfilePage` or `SettingsPage`
- Location: `src/app/settings/page.tsx` (future)
- Form: React Hook Form + Zod

**Backend:**
- Firestore: Update `/users/{userId}` document
- Method: `updateDoc(userRef, { displayName, preferences })`

**User Document Fields:**
```typescript
{
  email: string; // read-only
  displayName: string; // editable
  preferences: {
    theme: 'light' | 'dark' | 'system'; // editable
    defaultRestTime: number; // editable (30-300 seconds)
    defaultRPE: number; // editable (1-10)
  };
  updatedAt: Timestamp; // auto-update
}
```

**Authentication/Authorization:**
- Required: Yes (must be logged in)
- Permissions: Can only edit own profile

### UI Behavior

**Layout:**
- Settings page with tabs (Profile, Preferences, Account)
- Profile tab: Display name field
- Preferences tab: Theme dropdown, rest time slider, RPE slider
- Save button at bottom

**User Interactions:**
1. User edits fields
2. Save button becomes enabled (only if changes made)
3. User clicks "Save" → Loading state
4. On success → Success toast, disable Save button
5. On error → Error message, re-enable Save

**UI States:**
- **Loading:** Save button disabled, spinner
- **Success:** Green toast: "Profile updated successfully"
- **Error:** Red alert banner
- **Unsaved changes:** "Save" button enabled and highlighted

### Error Handling

**Validation Errors:**
- Empty display name → "Display name cannot be empty"
- Rest time out of range → "Rest time must be between 30 and 300 seconds"
- RPE out of range → "RPE must be between 1 and 10"

**System Errors:**
- Network error → "Could not save changes. Please try again."
- Firestore error → "An error occurred. Please try again."

**Recovery:**
- Allow user to retry save
- Show which field caused error (if specific)

### Edge Cases

- **Very long display name (>50 chars):** Truncate or show validation error
- **Special characters in display name:** Allowed (e.g., "O'Brien")
- **Update theme:** Immediate UI change without page reload

### Dependencies

**Requires:**
- Authentication (user must be logged in)
- Firestore user document exists

**Blocks:**
- None (profile management is independent feature)

**External Dependencies:**
- Firestore

### Testing Considerations

**Unit Tests:**
- Form validation
- Preference value ranges

**Integration Tests:**
- Firestore document update
- Theme change propagation

**E2E Tests:**
- Update display name → Verify in UI
- Update preferences → Verify saved to Firestore
- Theme change → Verify UI updates

---

## Function 1.5: Session Management

### User Story
**As a** logged-in user  
**I want to** my session to persist across browser sessions  
**So that** I don't have to log in every time I use Zenith Trainer

### Acceptance Criteria

**Scenario 1: Persistent Session**
- **Given** I logged in successfully
- **When** I close my browser and reopen
- **Then** I am still logged in (no login required)

**Scenario 2: Logout**
- **Given** I am logged in
- **When** I click "Log out"
- **Then** My session is cleared
- **And** I am redirected to the login page
- **And** I must log in again to access the app

**Scenario 3: Automatic Token Refresh**
- **Given** My session token expires (Firebase tokens expire after 1 hour)
- **When** I make an API request
- **Then** Firebase automatically refreshes my token
- **And** The request succeeds
- **And** I remain logged in

**Scenario 4: Session Expired (User Inactive for 30 Days)**
- **Given** I haven't used the app for 30+ days
- **When** I return and try to access the app
- **Then** My session is expired
- **And** I am redirected to login

### Technical Requirements

**Frontend:**
- Firebase Auth persistence: `setPersistence(auth, browserLocalPersistence)`
- Logout: `signOut(auth)`

**Backend:**
- Firebase handles token refresh automatically
- Tokens stored in httpOnly cookies (secure)

**Session Persistence:**
- Mode: `browserLocalPersistence` (persists across browser sessions)
- Alternative: `browserSessionPersistence` (clears when browser closes) - not used

**Authentication/Authorization:**
- Session checked on every protected route
- Middleware: Redirect to /login if not authenticated

### UI Behavior

**Logout:**
- Nav bar: "Log out" button
- Click → Confirmation dialog (optional)
- On logout → Clear session → Redirect to /login

**Auto-redirect:**
- If not authenticated and accessing protected route → Redirect to /login
- After login → Redirect back to intended page

**UI States:**
- **Loading:** Show skeleton UI while checking session
- **Authenticated:** Show full app
- **Not authenticated:** Redirect to login

### Error Handling

**System Errors:**
- Token refresh fails → Force logout, redirect to login
- Network error during logout → Still clear local session, show offline message

**Recovery:**
- If token refresh fails, user must log in again

### Edge Cases

- **Multiple tabs open:** Session synced across tabs (Firebase handles)
- **User logs in on another device:** Both devices remain logged in
- **User changes password:** Sessions on all devices remain valid until token expires (1 hour), then must re-login

### Dependencies

**Requires:**
- Firebase Auth configured
- User logged in

**Blocks:**
- All authenticated features

**External Dependencies:**
- Firebase Auth service

### Testing Considerations

**Unit Tests:**
- Logout function clears session
- Session check logic

**Integration Tests:**
- Firebase `signOut` call
- Token refresh on expiry

**E2E Tests:**
- Login → Close browser → Reopen → Verify still logged in
- Logout → Verify redirect to login
- Access protected route while not logged in → Verify redirect

---

## Module-Level Requirements

### Performance Requirements
- Login response time: <2s (Firebase Auth call + Firestore user fetch)
- Session check: <100ms (local token verification)
- Logout: Instant (local session clear)
- Password reset email: Sent within 5s

### Security Requirements
- Passwords hashed by Firebase (bcrypt)
- Session tokens: httpOnly cookies (XSS protection)
- HTTPS required for all auth requests
- Rate limiting on password reset (max 5 per hour per IP)
- Account lockout after 5 failed login attempts (30 min cooldown)

### Accessibility Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation: Tab through form fields
- Screen reader: Form labels, error announcements
- Focus management: Error fields focused on validation failure

### Browser/Platform Support
- Chrome/Edge 111+, Firefox 128+, Safari 16.4+
- Mobile: iOS 16+, Android 12+
- Responsive design: Works on all screen sizes

---

## Implementation Notes

**Recommended Implementation Order:**
1. Function 1.2: Login (foundation - implement first)
2. Function 1.1: Registration (builds on login)
3. Function 1.5: Session Management (logout, persistence)
4. Function 1.3: Password Reset (independent, lower priority)
5. Function 1.4: User Profile Management (nice-to-have for MVP)

**Estimated Effort:**
- Function 1.1: 6-8 hours / 5 story points
- Function 1.2: 4-6 hours / 3 story points
- Function 1.3: 3-4 hours / 3 story points
- Function 1.4: 6-8 hours / 5 story points
- Function 1.5: 4-6 hours / 3 story points
- **Total Module Estimate:** 23-32 hours / 19 story points

**Technical Risks & Mitigation:**
- **Risk:** Firebase Auth service outage  
  **Mitigation:** Show error message, allow retry, monitor Firebase status page
- **Risk:** Email delivery delays (password reset)  
  **Mitigation:** Set user expectation ("Email may take up to 5 minutes")
- **Risk:** Session token theft (XSS attack)  
  **Mitigation:** httpOnly cookies, HTTPS only, Content Security Policy headers

**Dependencies on External Factors:**
- Firebase Auth service availability (99.95% SLA)
- Email delivery service (Firebase built-in, reliable)

---

## Related Documentation

- [Architecture Overview](../core/02_ARCHITECTURE.md#security-architecture)
- [Tech Stack - Firebase Auth](../core/01_TECH_STACK.md#backend--database)
- [Security Best Practices](https://firebase.google.com/docs/auth/web/manage-users)

---

**Last Updated:** November 14, 2025  
**Author:** Bootstrap PHASE 5  
**Status:** ✅ Ready for Development
