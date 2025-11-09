// ===============================
// ANALYSIS SYSTEMS
// ===============================

export type SystemParameter = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'slider' | 'checkbox' | 'text';
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  default?: string | number | boolean;
  required: boolean;
  aiAssignable: boolean;
  description?: string;
};

export type AnalysisSystem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isPremium: boolean;
  price?: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveSystem = {
  systemId: string;
  userId: string;
  activatedAt: string;
  isPremium: boolean;
  expiresAt?: string;
  settings?: {
    notificationsEnabled?: boolean;
    insightFrequency?: 'daily' | 'weekly' | 'monthly';
    customParams?: Record<string, unknown>;
  };
};
