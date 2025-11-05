import { UserNav } from '@/components/user-nav';
import { SidebarTrigger } from './ui/sidebar';

/**
 * @fileoverview Компонент заголовка сайта (шапки).
 */

/**
 * Компонент заголовка сайта.
 * Отображается в верхней части страницы, содержит триггер для боковой панели
 * на мобильных устройствах и навигацию пользователя.
 * @returns {JSX.Element} React-компонент.
 */
export function SiteHeader() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="h-16 flex items-center px-4 md:px-8">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
