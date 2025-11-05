import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @fileoverview Утилитарная функция для объединения имен классов Tailwind CSS.
 */

/**
 * Объединяет имена классов, разрешая конфликты.
 * @param {...ClassValue[]} inputs - Имена классов для объединения.
 * @returns {string} - Объединенная строка имен классов.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
