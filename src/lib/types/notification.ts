// ===============================
// IN-APP NOTIFICATIONS
// ===============================

export type NotificationType =
  | 'habit_reminder'
  | 'workout_complete'
  | 'streak_milestone'
  | 'streak_broken'
  | 'ai_insight'
  | 'program_reminder'
  | 'achievement'
  | 'system';

export type InAppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO timestamp
  read: boolean;
  readAt?: string; // ISO timestamp
  actionUrl?: string; // URL to navigate on click
  actionLabel?: string; // e.g., "Complete", "View", "Open"
  // Context data for different notification types
  data?: {
    habitId?: string;
    workoutId?: string;
    programId?: string;
    streakValue?: number;
    achievementId?: string;
    [key: string]: unknown;
  };
  priority?: 1 | 2 | 3 | 4 | 5; // Higher = more important
  expiresAt?: string; // ISO timestamp - auto-delete after this
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
