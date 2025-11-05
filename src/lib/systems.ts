import type { AnalysisSystem } from './types';

/**
 * @fileoverview Содержит массив встроенных систем анализа.
 */

/**
 * Массив встроенных систем анализа.
 * @type {AnalysisSystem[]}
 */
export const BUILTIN_SYSTEMS: AnalysisSystem[] = [
  {
    id: 'wheel-of-life-v1',
    name: 'Колесо жизни',
    description: 'Баланс в 8 жизненных областях',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'life_area',
        label: 'Жизненная область',
        type: 'select',
        options: [
          { value: 'health', label: 'Здоровье' },
          { value: 'career', label: 'Карьера' },
          { value: 'relationships', label: 'Отношения' },
          { value: 'growth', label: 'Рост' },
          { value: 'finance', label: 'Финансы' },
          { value: 'recreation', label: 'Отдых' },
          { value: 'environment', label: 'Окружение' },
          { value: 'spirituality', label: 'Духовность' },
        ],
        required: false,
        aiAssignable: true,
      },
      {
        id: 'impact_score',
        label: 'Оценка влияния',
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
        { id: 'area_completion', label: 'Завершение области', calculation: 'done/total per area' },
        { id: 'balance_score', label: 'Оценка баланса', calculation: '100 - stddev(area_completion)*10' },
      ],
      insights: ['слабые места', 'сильные стороны', 'баланс']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'maslow-hierarchy-v1',
    name: 'Пирамида Маслоу',
    description: 'Фокус на иерархии потребностей',
    version: '1.0',
    author: 'Zenith',
    isPremium: false,
    habitParameters: [
      {
        id: 'need_level',
        label: 'Уровень потребности',
        type: 'select',
        options: [
          { value: 'physiological', label: 'Физиологические' },
          { value: 'safety', label: 'Безопасность' },
          { value: 'belonging', label: 'Принадлежность' },
          { value: 'esteem', label: 'Уважение' },
          { value: 'self_actualization', label: 'Самоактуализация' },
        ],
        required: false,
        aiAssignable: true,
      },
    ],
    aiContext: {},
    analytics: {
      chartType: 'pyramid',
      metrics: [
        { id: 'base_stability', label: 'Стабильность базы', calculation: 'avg(physiological, safety)' },
      ],
      insights: ['слабая база', 'сильный верх']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
