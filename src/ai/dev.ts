/**
 * @fileoverview Этот файл является точкой входа для запуска AI-потоков в режиме разработки.
 * Он загружает переменные окружения из файла .env и импортирует необходимые AI-потоки.
 */
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-routine-optimizer.ts';
