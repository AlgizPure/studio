'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Dumbbell, Home, CalendarDays, Target, History } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

/**
 * @fileoverview Компонент основной навигации, отображаемый на боковой панели.
 */

/**
 * Элементы навигации.
 * @type {Array<{ href: string, label: string, icon: React.ElementType }>}
 */
const navItems = [
  { href: '/', label: 'Панель управления', icon: Home },
  { href: '/programs', label: 'Программы', icon: Target },
  { href: '/schedule', label: 'Расписание', icon: CalendarDays },
  { href: '/workout-history', label: 'История', icon: History },
  { href: '/library', label: 'Библиотека упражнений', icon: Dumbbell },
  { href: '/workouts', label: 'Библиотека тренировок', icon: Dumbbell },
  { href: '/analytics', label: 'Аналитика', icon: BarChart3 },
];

/**
 * Компонент основной навигации.
 * @param {React.HTMLAttributes<HTMLElement>} props - Свойства компонента.
 * @returns {JSX.Element} - Основная навигация.
 */
export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className)} {...props}>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
              >
                <div>
                  <item.icon />
                  <span>{item.label}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
