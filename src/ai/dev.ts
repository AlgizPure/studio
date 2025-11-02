/**
 * @file Этот файл служит точкой входа для разработки.
 * Он загружает переменные окружения из файла .env и импортирует
 * необходимые потоки Genkit.
 */
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-routine-optimizer.ts';