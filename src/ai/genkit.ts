import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Инициализирует и настраивает экземпляр Genkit.
 *
 * Этот экземпляр Genkit настроен для использования плагина Google AI
 * и модели 'gemini-2.5-flash'.
 *
 * @see {@link https://genkit.dev/docs/getting-started}
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
