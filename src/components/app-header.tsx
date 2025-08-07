
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ClipboardList,
  HardHat,
  UsersRound,
  Home,
} from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

// Dynamically import the NotificationMenu with SSR turned off
const NotificationMenu = dynamic(() => import('./notification-menu').then(mod => mod.NotificationMenu), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" size="icon" className="relative">
      <div className="h-5 w-5 animate-pulse rounded-full bg-primary/50" />
      <span className="sr-only">Notifiche</span>
    </Button>
  ),
});


const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/clienti", label: "Clienti", icon: UsersRound },
  { href: "/tecnici", label: "Tecnici", icon: HardHat },
  { href: "/attivita", label: "Attività", icon: ClipboardList },
];

export function AppHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Make dashboard link active only on exact match
    if (href === "/") {
        return pathname === href;
    }
    // For other links, check if the pathname starts with the href
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
           <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <Image 
                    src="/metra-logo.png" 
                    alt="CantiereFlow Logo" 
                    width={180} 
                    height={45}
                    priority
                />
            </Link>
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
            <NotificationMenu />
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Apri menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium mt-8">
                     {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                            <Link
                                href={link.href}
                                className={cn(
                                "flex items-center gap-4 px-2.5",
                                isActive(link.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
