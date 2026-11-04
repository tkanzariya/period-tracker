import { en, type Strings } from './en';
import { hi } from './hi';

export type { Strings };
export type Language = 'en' | 'hi';
export const LANGUAGES: Language[] = ['en', 'hi'];
export const STRINGS: Record<Language, Strings> = { en, hi };

/** The phone's language if we support it (Hindi), otherwise English. */
export function defaultLanguage(deviceLocale?: string): Language {
  return deviceLocale?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'hi';
}
