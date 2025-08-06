
"use client";

import Link from "next/link";
import {
  ClipboardList,
  HardHat,
  UsersRound,
  Menu,
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
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="h-10 w-auto"
            fill="currentColor"
          >
            <path d="M50,5c-24.8,0-45,20.2-45,45s20.2,45,45,45s45-20.2,45-45S74.8,5,50,5z M25.8,63.4c-2.3-2.3-3.6-5.3-3.6-8.5 s1.3-6.2,3.6-8.5c2.3-2.3,5.3-3.6,8.5-3.6c3.2,0,6.2,1.3,8.5,3.6c4.7,4.7,4.7,12.3,0,17C40.5,65.7,37.5,67,34.2,67 S28.1,65.7,25.8,63.4z M74.2,63.4c-2.3,2.3-5.3,3.6-8.5,3.6c-3.2,0-6.2-1.3-8.5-3.6c-4.7-4.7-4.7-12.3,0-17 c2.3-2.3,5.3-3.6,8.5-3.6c3.2,0,6.2,1.3,8.5,3.6C78.9,51.1,78.9,58.7,74.2,63.4z" />
          </svg>
           <span className="hidden sm:inline-block">CantiereFlow</span>
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
