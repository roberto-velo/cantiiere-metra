
"use client";

import Link from "next/link";
import {
  ClipboardList,
  HardHat,
  UsersRound,
  Menu,
  Bell,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NotificationMenu } from "./notification-menu";


export function AppHeader() {

  const navLinks = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/clienti", label: "Clienti", icon: UsersRound },
    { href: "/tecnici", label: "Tecnici", icon: HardHat },
    { href: "/attivita", label: "Attività", icon: ClipboardList },
  ];
  
  return (
    <header className="bg-primary text-primary-foreground border-b p-4 sm:p-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link href="/">
          <img src="/metra-logo.png" alt="Metra Logo" style={{ height: '100px' }} />
        </Link>
        <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Button variant="ghost" asChild key={link.href}>
                  <Link href={link.href} className="flex items-center gap-2 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>
            
             <div className="flex items-center gap-2">
                <NotificationMenu />
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6 text-primary-foreground" />
                            <span className="sr-only">Apri menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] bg-primary text-primary-foreground">
                        <SheetHeader>
                            <SheetTitle>Menu Principale</SheetTitle>
                        </SheetHeader>
                         <nav className="flex flex-col gap-4 mt-8">
                            {navLinks.map((link) => (
                               <SheetClose asChild key={link.href}>
                                 <Link href={link.href} className="flex items-center gap-3 p-2 rounded-md text-lg hover:bg-primary/80">
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
      </div>
    </header>
  );
}
