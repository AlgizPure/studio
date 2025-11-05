'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * @fileoverview Провайдер темы для управления основной темой (светлая/темная) и пользовательскими темами Japandi.
 */

/**
 * Тип для доступных тем Japandi.
 * @typedef {'setdey' | 'olive' | 'soft' | 'terracoot' | 'mizu' | 'sakura' | 'mori' | 'kuro'} JapandiTheme
 */
export type JapandiTheme = 'setdey' | 'olive' | 'soft' | 'terracoot' | 'mizu' | 'sakura' | 'mori' | 'kuro';

/**
 * Контекст для пользовательской темы.
 * @interface CustomThemeContextType
 * @property {JapandiTheme} japandiTheme - Текущая тема Japandi.
 * @property {(theme: JapandiTheme) => void} setJapandiTheme - Функция для установки новой темы Japandi.
 */
interface CustomThemeContextType {
  japandiTheme: JapandiTheme
  setJapandiTheme: (theme: JapandiTheme) => void
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined)

/**
 * Провайдер для пользовательских тем Japandi.
 * @param {{ children: React.ReactNode }} props - Свойства компонента.
 * @returns {JSX.Element} - Провайдер пользовательской темы.
 */
function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [japandiTheme, setJapandiTheme] = useState<JapandiTheme>('soft');

  useEffect(() => {
    const storedTheme = localStorage.getItem('japandi-theme') as JapandiTheme | null;
    if (storedTheme) {
      setJapandiTheme(storedTheme);
    } else {
      document.body.classList.add('theme-soft');
    }
  }, []);

  const handleSetJapandiTheme = useCallback((theme: JapandiTheme) => {
    setJapandiTheme(theme);
    localStorage.setItem('japandi-theme', theme);
    // Удаляем другие классы тем
    document.body.classList.remove('theme-setdey', 'theme-olive', 'theme-soft', 'theme-terracoot', 'theme-mizu', 'theme-sakura', 'theme-mori', 'theme-kuro');
    // Добавляем новый класс темы
    document.body.classList.add(`theme-${theme}`);
  }, []);

  useEffect(() => {
    handleSetJapandiTheme(japandiTheme);
  }, [japandiTheme, handleSetJapandiTheme]);


  return (
    <CustomThemeContext.Provider value={{ japandiTheme, setJapandiTheme: handleSetJapandiTheme }}>
      {children}
    </CustomThemeContext.Provider>
  )
}

/**
 * Главный провайдер темы, который оборачивает как next-themes, так и пользовательский провайдер.
 * @param {ThemeProviderProps} props - Свойства провайдера темы.
 * @returns {JSX.Element} - Главный провайдер темы.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}

/**
 * Хук для доступа к контексту темы.
 * @returns {{ theme: string | undefined, setTheme: (theme: string) => void, japandiTheme: JapandiTheme, setJapandiTheme: (theme: JapandiTheme) => void }} - Контекст темы.
 * @throws {Error} - Если хук используется вне ThemeProvider.
 */
export function useTheme() {
  const nextThemeContext = useNextTheme();
  const customThemeContext = useContext(CustomThemeContext);

  if (nextThemeContext === undefined || customThemeContext === undefined) {
    throw new Error('useTheme должен использоваться внутри ThemeProvider');
  }

  return { ...nextThemeContext, ...customThemeContext };
}
