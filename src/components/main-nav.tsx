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

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/programs', label: 'Programs', icon: Target },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/workout-history', label: 'History', icon: History },
  { href: '/library', label: 'Exercise Library', icon: Dumbbell },
  { href: '/workouts', label: 'Workouts Library', icon: Dumbbell },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

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
