/**
 * @fileoverview Этот файл содержит конфигурацию для Genkit, фреймворка для работы с AI.
 * Он инициализирует плагин Google AI и указывает используемую модель.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-pro',
});
