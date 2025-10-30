import YAML from 'yaml';
import { validateZTL, validateZTLPatch } from './schema';

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

export function toYAML(obj: unknown) {
  return YAML.stringify(obj);
}

export function toJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2);
}



