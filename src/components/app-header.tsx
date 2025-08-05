import Link from "next/link";
import { Button } from "./ui/button";
import { ClipboardList, HardHat, UsersRound, LogOut } from "lucide-react";

export function AppHeader() {
  const navLinks = [
    { href: "/", label: "Dashboard", icon: ClipboardList },
    { href: "/clienti", label: "Clienti", icon: UsersRound },
    { href: "/tecnici", label: "Tecnici", icon: HardHat },
    { href: "/attivita", label: "Attività", icon: ClipboardList },
  ];

  return (
    <header className="bg-card border-b p-4 sm:p-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link href="/">
          {/* Using a standard img tag for debugging */}
          <img
            src="/logo.png"
            alt="Logo"
            width="180"
            height="45"
            style={{ height: '45px', width: 'auto' }}
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
          <Button variant="outline" asChild>
            <Link href="/login" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
