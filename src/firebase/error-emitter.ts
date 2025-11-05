'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileoverview Реализация строго типизированного издателя/подписчика (pub/sub) для обработки событий ошибок в приложении.
 */

/**
 * Определяет форму всех возможных событий и их соответствующих типов данных.
 * Это централизует определения событий для обеспечения типобезопасности во всем приложении.
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// Общий тип для функции обратного вызова.
type Callback<T> = (data: T) => void;

/**
 * Создает строго типизированный эмиттер событий pub/sub.
 * Использует обобщенный тип T, который расширяет запись имен событий до типов данных.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // Объект events хранит массивы обратных вызовов, ключами которых являются имена событий.
  // Типы гарантируют, что обратный вызов для определенного события соответствует его типу данных.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    /**
     * Подписывается на событие.
     * @param {K} eventName - Имя события для подписки.
     * @param {Callback<T[K]>} callback - Функция, вызываемая при возникновении события.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    /**
     * Отписывается от события.
     * @param {K} eventName - Имя события для отписки.
     * @param {Callback<T[K]>} callback - Конкретный обратный вызов для удаления.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    /**
     * Публикует событие для всех подписчиков.
     * @param {K} eventName - Имя события для публикации.
     * @param {T[K]} data - Данные, соответствующие типу события.
     */
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// Создает и экспортирует синглтон-экземпляр эмиттера, типизированный с помощью нашего интерфейса AppEvents.
export const errorEmitter = createEventEmitter<AppEvents>();
