'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

type JapandiTheme = 'setdey' | 'olive' | 'soft' | 'terracoot' | 'mizu' | 'sakura' | 'mori' | 'kuro';

interface CustomThemeContextType {
  japandiTheme: JapandiTheme
  setJapandiTheme: (theme: JapandiTheme) => void
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined)

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
    // Remove other theme classes
    document.body.classList.remove('theme-setdey', 'theme-olive', 'theme-soft', 'theme-terracoot', 'theme-mizu', 'theme-sakura', 'theme-mori', 'theme-kuro');
    // Add the new theme class
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


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}

export function useTheme() {
  const nextThemeContext = useNextTheme();
  const customThemeContext = useContext(CustomThemeContext);

  if (nextThemeContext === undefined || customThemeContext === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return { ...nextThemeContext, ...customThemeContext };
}
