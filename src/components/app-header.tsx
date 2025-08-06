
"use client";

import Link from "next/link";
import {
  Bell,
  ClipboardList,
  HardHat,
  UsersRound,
  Trash2,
} from "lucide-react";
import { useNotifications, type NotificationType } from "@/hooks/use-notifications";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";


const notificationColorClasses: Record<NotificationType, string> = {
  'task-created': 'text-blue-500',
  'task-started': 'text-orange-500',
  'task-paused': 'text-yellow-500',
  'task-completed': 'text-green-500',
};


export function AppHeader() {
  const { notifications, clearNotifications, getIcon } = useNotifications();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/clienti", label: "Clienti", icon: UsersRound },
    { href: "/tecnici", label: "Tecnici", icon: HardHat },
    { href: "/attivita", label: "Attività", icon: ClipboardList },
  ];
  
  const handleClearNotifications = (e: React.MouseEvent) => {
    e.preventDefault();
    clearNotifications();
  };

  return (
    <header className="bg-card border-b p-4 sm:p-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link href="/">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-[45px] w-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Button variant="ghost" asChild key={link.href}>
              <Link href={link.href} className="flex items-center gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifiche Recenti</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    const colorClass = notificationColorClasses[notification.type] || 'text-primary';
                    return (
                        <DropdownMenuItem key={notification.id} className="flex items-start gap-3">
                           <Icon className={cn("h-5 w-5 mt-1 shrink-0", colorClass)} />
                            <div className="flex-1">
                                <p className="text-sm font-medium whitespace-normal">
                                {notification.text}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                {notification.time}
                                </p>
                            </div>
                        </DropdownMenuItem>
                    )
                })
              ) : (
                <p className="p-4 text-sm text-center text-muted-foreground">
                    Nessuna notifica.
                </p>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleClearNotifications}
                disabled={notifications.length === 0}
                className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
                <span>Elimina Notifiche</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
