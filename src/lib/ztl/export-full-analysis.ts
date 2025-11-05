import { format } from 'date-fns';
import { toYAML } from './parser';
import type { Program } from '@/lib/ztl/types';
import type { WorkoutLog } from '@/lib/types';

/**
 * @fileoverview Функции для генерации и скачивания полного анализа тренировок в формате Markdown.
 */

/** Запланированная тренировка. */
export type ScheduledWorkout = {
  date: string; // дата в формате ISO
  workoutName: string;
  plannedVolume?: number;
  status: 'Upcoming' | 'Planned';
  exercises: string[];
};

/** Экспорт активной программы. */
export type ActiveProgramExport = {
  program: Program;
  ztl: unknown; // уже преобразованная структура
  currentWeek: number;
  totalWeeks: number;
  scheduledWorkouts: ScheduledWorkout[];
};

type Input = {
  userId: string;
  userGoal?: string;
  pastWorkouts: WorkoutLog[];
  activePrograms: ActiveProgramExport[];
};

function escapeTripleBackticks(text: string) {
  return text.replace(/```/g, '\u0060\u0060\u0060');
}

function truncateJson(obj: unknown, maxLength = 350000): string {
  const s = JSON.stringify(obj, null, 2);
  if (s.length <= maxLength) return s;
  const head = s.slice(0, maxLength);
  return head + "\n/* усечено для размера */";
}

/**
 * Скачивает Markdown-файл.
 * @param {string} markdown - Содержимое Markdown.
 * @param {string} filename - Имя файла.
 */
export function downloadMarkdownFile(markdown: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Генерирует полный анализ в формате Markdown.
 * @param {Input} input - Входные данные для анализа.
 * @returns {Promise<string>} - Строка с содержимым Markdown.
 */
export async function generateFullAnalysisExport(input: Input): Promise<string> {
  const exportDate = format(new Date(), 'yyyy-MM-dd');

  const header = `# 🏋️ ZENITH TRAINER - ПОЛНЫЙ АНАЛИЗ\n**Дата экспорта:** ${exportDate}\n**Окно анализа:** Прошлые 90д + Следующие 90д\n**ID пользователя:** ${input.userId}`;

  const instructions = `\n\n## 📋 ИНСТРУКЦИИ ДЛЯ АНАЛИЗА CLAUDE\n\nВы анализируете данные тренировок из приложения Zenith Trainer для получения персональных рекомендаций.\n\n### ВАША РОЛЬ\nЭлитный тренер по силовой и кондиционной подготовке с опытом в научно-обоснованном программировании, RPE, периодизации и восстановлении.\n\n### ОБЯЗАТЕЛЬНЫЕ ШАГИ АНАЛИЗА\n1) Веб-исследование последних (2023-2025): прогрессивная перегрузка, эффективность RPE, мета-анализы объема/частоты, оптимизация восстановления, тенденции периодизации.\n\nПредлагаемые запросы:\n- RPE based training effectiveness 2024 research\n- progressive overload strategies evidence based 2025\n- training volume frequency optimization study\n- strength training periodization latest research\n\n2) Глубокий анализ данных: тенденции объема, паттерны RPE, прогрессивная перегрузка, индикаторы восстановления, анализ по конкретным упражнениям.\n3) Сравнение с научно-обоснованными нормами.\n4) Персональные рекомендации (немедленные, план на 4 недели, 3-6 месяцев) с красными флагами.\n5) Научное обоснование с цитатами.\n\n### ФОРМАТ ВЫВОДА\n\n## 🔍 РЕЗУЛЬТАТЫ ИССЛЕДОВАНИЯ\n## 📊 АНАЛИЗ ДАННЫХ\n### Тенденции объема\n### Паттерны RPE\n### Прогрессивная перегрузка\n### Восстановление\n### Анализ по упражнениям\n\n## 🎯 РЕКОМЕНДАЦИИ\n### Немедленные (на этой неделе)\n### План на 4 недели\n### Долгосрочная стратегия\n\n## ⚠️ ОПАСЕНИЯ И КРАСНЫЕ ФЛАГИ\n## 📚 НАУЧНАЯ БАЗА\n`;

  const userSection = `\n---\n\n## 📦 РАЗДЕЛ 1: ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ\n- Цель: ${input.userGoal ?? 'Не указана'}\n`;

  const programsSection = `\n---\n\n## 📦 РАЗДЕЛ 2: АКТИВНЫЕ ПРОГРАММЫ (СЛЕДУЮЩИЕ 90 ДНЕЙ)\n\n${input.activePrograms
    .map((ap) => {
      const scheduleTable = ap.scheduledWorkouts
        .slice(0, 120) // ограничение строк
        .map(
          (sw) => `| ${sw.date} | ${sw.workoutName} | ${sw.exercises.join(', ')} | ${sw.plannedVolume ?? ''} | ${sw.status} |`
        )
        .join('\n');
      const tableHeader = `| Дата | Тренировка | Упражнения | Планируемый объем | Статус |\n|------|---------|-----------|----------------|--------|`;
      const ztlYaml = toYAML(ap.ztl as any);
      return `### Программа: ${ap.program.name}\n**Статус:** ${ap.program.status} • **Прогресс:** Неделя ${ap.currentWeek}/${ap.totalWeeks || '∞'}\n\n#### Полная спецификация программы:\n\n\`\`\`ztl\n${escapeTripleBackticks(ztlYaml)}\n\`\`\`\n\n#### Запланированные тренировки (следующие 90 дней):\n${tableHeader}\n${scheduleTable}\n`;
    })
    .join('\n')}`;

  const pastSection = `\n---\n\n## 📦 РАЗДЕЛ 3: ЗАВЕРШЕННЫЕ ТРЕНИРОВКИ (ПРОШЛЫЕ 90 ДНЕЙ)\n\n### Хронологический лог\n\n\`\`\`json\n${escapeTripleBackticks(truncateJson(input.pastWorkouts))}\n\`\`\`\n`;

  const feedbackSection = `\n---\n\n## 📦 РАЗДЕЛ 4: ОБРАТНАЯ СВЯЗЬ / ЗАМЕТКИ ПО ТРЕНИРОВКАМ\n\n${input.pastWorkouts
    .filter((w) => (w as any).userFeedback || (w as any).feedbackTags)
    .slice(0, 200)
    .map((w) => `**${w.date}** — ${((w as any).feedbackTags || []).join(', ')}\n${(w as any).userFeedback || ''}`)
    .join('\n\n')}`;

  const questions = `\n---\n\n## 📦 РАЗДЕЛ 5: ВОПРОСЫ ДЛЯ АНАЛИЗА\n- Прошлая производительность (прогрессии, стагнация, перетренированность, восстановление)\n- Текущие программы (устойчивость объема, выбор, недостающие элементы)\n- Будущий план на 90 дней (риски перегрузки, расписание, дополнения)\n- Интеграция (запланировано vs. фактически)\n\n**КОНЕЦ ИНСТРУКЦИЙ - НАЧАТЬ АНАЛИЗ**`;

  return [header, instructions, userSection, programsSection, pastSection, feedbackSection, questions].join('\n');
}
