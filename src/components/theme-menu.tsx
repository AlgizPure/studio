'use client'

import * as React from 'react'
import { Moon, Sun, Palette, Check } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import type { JapandiTheme } from '@/components/theme-provider'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/**
 * @fileoverview Компонент выпадающего меню для выбора темы оформления.
 * Позволяет переключаться между светлой, темной и системной темами, а также выбирать цветовую схему Japandi.
 */

/**
 * Массив доступных тем Japandi.
 * @type {Array<{ name: JapandiTheme, label: string, color: string }>}
 */
const themes: { name: JapandiTheme, label: string, color: string }[] = [
    { name: 'soft', label: 'Мягкая', color: 'hsl(25 50% 70%)' },
    { name: 'terracoot', label: 'Терракотовая', color: 'hsl(16 66% 60%)' },
    { name: 'setdey', label: 'Сетдей', color: 'hsl(210 5% 55%)' },
    { name: 'olive', label: 'Оливковая', color: 'hsl(80 15% 45%)' },
    { name: 'mizu', label: 'Мидзу', color: 'hsl(210 40% 55%)' },
    { name: 'sakura', label: 'Сакура', color: 'hsl(340 50% 70%)' },
    { name: 'mori', label: 'Мори', color: 'hsl(140 25% 40%)' },
    { name: 'kuro', label: 'Куро', color: 'hsl(220 5% 40%)' },
];

/**
 * Компонент меню выбора темы.
 * @returns {JSX.Element} - Меню выбора темы.
 */
export function ThemeMenu() {
  const { setTheme, japandiTheme, setJapandiTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
          <Palette className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Тема</span>
          <span className="sr-only">Переключить тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Светлая</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Темная</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
            <Sun className="mr-2 h-4 w-4" /><span className="text-muted-foreground">/</span><Moon className="h-4 w-4" />
            <span>Системная</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Palette className="mr-2 h-4 w-4" />
                <span>Цветовая схема</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    {themes.map((theme) => (
                        <DropdownMenuItem key={theme.name} onClick={() => setJapandiTheme(theme.name)} className="justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.color }} />
                                <span>{theme.label}</span>
                            </div>
                            {japandiTheme === theme.name && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
