import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ClipboardList,
  HardHat,
  UsersRound,
  LogOut,
  PlusCircle,
  Play,
  Pause,
  CheckCircle,
} from "lucide-react";

export function AppHeader() {
  const navLinks = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/clienti", label: "Clienti", icon: UsersRound },
    { href: "/tecnici", label: "Tecnici", icon: HardHat },
    { href: "/attivita", label: "Attività", icon: ClipboardList },
  ];

  const notifications = [
    {
      icon: CheckCircle,
      text: "Attività 'Riparazione quadro...' terminata.",
      time: "2 min fa",
      color: "text-green-500",
    },
    {
      icon: Pause,
      text: "Attività 'Sostituzione caldaia' in pausa.",
      time: "15 min fa",
      color: "text-orange-500",
    },
    {
      icon: Play,
      text: "Attività 'Sostituzione caldaia' avviata.",
      time: "1 ora fa",
      color: "text-blue-500",
    },
    {
      icon: PlusCircle,
      text: "Nuova attività 'Rifacimento intonaco...' creata.",
      time: "3 ore fa",
      color: "text-primary",
    },
  ];

  return (
    <header className="bg-card border-b p-4 sm:p-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link href="/">
          <img
            src="/logo.png"
            alt="Logo"
            width="180"
            height="45"
            style={{ height: "45px", width: "auto" }}
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
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifiche Recenti</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification, index) => (
                <DropdownMenuItem key={index} className="flex items-start gap-3">
                  <notification.icon
                    className={`h-5 w-5 mt-1 shrink-0 ${notification.color}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium whitespace-normal">
                      {notification.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
               <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center gap-2 cursor-pointer">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
