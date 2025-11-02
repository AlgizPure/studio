import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SiteHeader } from '@/components/site-header';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * Метаданные для приложения.
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  title: 'Zenith Trainer',
  description: 'Ваш личный фитнес-трекер и трекер привычек на базе ИИ.',
};

/**
 * Корневой макет для всего приложения.
 * Он настраивает HTML-документ и включает основных поставщиков.
 * @param {Readonly<{ children: React.ReactNode }>} props - Свойства для корневого макета.
 * @param {React.ReactNode} props.children - Дочерние элементы для рендеринга внутри макета.
 * @returns {JSX.Element} Обертка корневого макета.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            <SidebarProvider>
              <Sidebar />
              <div className="flex flex-col flex-1 md:pl-[3rem]">
                <SiteHeader />
                <main className="flex-1 p-4 md:p-8">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
