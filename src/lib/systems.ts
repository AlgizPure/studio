import type { AnalysisSystem } from './types';

export const BUILTIN_SYSTEMS: AnalysisSystem[] = [
  {
    id: 'wheel-of-life-v1',
    name: 'Wheel of Life',
    description: 'Balance across 8 life areas',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'life_area',
        label: 'Life area',
        type: 'select',
        options: [
          { value: 'health', label: 'Health' },
          { value: 'career', label: 'Career' },
          { value: 'relationships', label: 'Relationships' },
          { value: 'growth', label: 'Growth' },
          { value: 'finance', label: 'Finance' },
          { value: 'recreation', label: 'Recreation' },
          { value: 'environment', label: 'Environment' },
          { value: 'spirituality', label: 'Spirituality' },
        ],
        required: false,
        aiAssignable: true,
      },
      {
        id: 'impact_score',
        label: 'Impact score',
        type: 'slider',
        min: 1,
        max: 10,
        default: 5,
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'wheel',
      metrics: [
        { id: 'area_completion', label: 'Area completion', calculation: 'done/total per area' },
        { id: 'balance_score', label: 'Balance score', calculation: '100 - stddev(area_completion)*10' },
      ],
      insights: ['weak areas', 'strong areas', 'balance']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'maslow-hierarchy-v1',
    name: 'Maslow Pyramid',
    description: 'Needs hierarchy focus',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'need_level',
        label: 'Need level',
        type: 'select',
        options: [
          { value: 'physiological', label: 'Physiological' },
          { value: 'safety', label: 'Safety' },
          { value: 'belonging', label: 'Belonging' },
          { value: 'esteem', label: 'Esteem' },
          { value: 'self_actualization', label: 'Self-actualization' },
        ],
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'pyramid',
      metrics: [
        { id: 'base_stability', label: 'Base stability', calculation: 'avg(physiological, safety)' },
      ],
      insights: ['base weak', 'upper strong']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];


