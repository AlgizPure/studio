// ===============================
// INSIGHTS
// ===============================

export type InsightType = 'recommendation' | 'warning' | 'achievement' | 'pattern';

export type HabitInsight = {
  id: string;
  date: string; // ISO date
  systemId?: string;
  type: InsightType;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  data?: {
    habitIds?: string[];
    metrics?: { [key: string]: number };
    suggestions?: {
      action: 'add' | 'modify' | 'remove' | 'pause' | 'change_schedule';
      habitId?: string;
      newParams?: Record<string, unknown>;
      reason?: string;
    }[];
  };
  dismissed?: boolean;
  actionTaken?: string;
  createdAt: string;
};
