import YAML from 'yaml';
import { validateZTL, validateZTLPatch } from './schema';

/**
 * @fileoverview Функции для парсинга и сериализации ZTL (Zenith Training Language).
 * Поддерживает форматы YAML и JSON.
 */

/**
 * Парсит входную строку как ZTL или ZTL Patch.
 * Автоматически определяет формат (JSON или YAML).
 * @param {string} input - Входная строка для парсинга.
 * @returns {{kind: 'program' | 'patch', value: any}} Объект, указывающий тип ('program' или 'patch') и распарсенные данные.
 * @throws {Error} Если строка не соответствует формату ZTL или ZTL Patch.
 */
export function parseZTLOrPatch(input: string) {
  const trimmed = input.trim();
  const isJSON = trimmed.startsWith('{') || trimmed.startsWith('[');
  const data = isJSON ? JSON.parse(trimmed) : YAML.parse(trimmed);

  const programRes = validateZTL(data);
  if (programRes.success) return { kind: 'program' as const, value: programRes.data };

  const patchRes = validateZTLPatch(data);
  if (patchRes.success) return { kind: 'patch' as const, value: patchRes.data };

  throw new Error('Invalid ZTL or ZTL Patch format');
}

/**
 * Преобразует объект JavaScript в строку формата YAML.
 * @param {unknown} obj - Объект для преобразования.
 * @returns {string} Строка в формате YAML.
 */
export function toYAML(obj: unknown) {
  return YAML.stringify(obj);
}

/**
 * Преобразует объект JavaScript в строку формата JSON.
 * @param {unknown} obj - Объект для преобразования.
 * @returns {string} Строка в формате JSON с отступами.
 */
export function toJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2);
}
