import { MainNav } from '@/components/main-nav';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarHeader,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const Logo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"strokeLinejoin="round"/>
    </svg>
);


export function Sidebar() {
  return (
    <SidebarPrimitive collapsible="icon" variant="sidebar" side="left">
      <SidebarContent className="flex flex-col">
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
              <Logo />
              <span className="font-bold font-headline text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">Zenith</span>
            </div>
        </SidebarHeader>
        <div className="flex-1 px-2">
            <MainNav />
        </div>
        <SidebarFooter className="p-4 flex flex-col gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="w-full justify-start gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
                <Settings className="h-4 w-4" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </Button>
        </SidebarFooter>
      </SidebarContent>
    </SidebarPrimitive>
  );
}
