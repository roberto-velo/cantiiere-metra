
"use client"

import Link from "next/link";
import {
  ClipboardList,
  HardHat,
  UsersRound,
  Home,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";


export function AppSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/clienti", label: "Clienti", icon: UsersRound },
    { href: "/tecnici", label: "Tecnici", icon: HardHat },
    { href: "/attivita", label: "Attività", icon: ClipboardList },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
             <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <Image 
                    src="/metra-logo.png" 
                    alt="CantiereFlow Logo" 
                    width={180} 
                    height={45}
                    priority
                    className="group-data-[collapsible=icon]:hidden"
                />
                 <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                    C
                 </div>
            </Link>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {navLinks.map((link) => (
                    <SidebarMenuItem key={link.href}>
                       <Link href={link.href} legacyBehavior passHref>
                            <SidebarMenuButton
                                isActive={isActive(link.href)}
                                tooltip={{
                                    children: link.label,
                                    side: "right",
                                }}
                            >
                                <link.icon />
                                <span>{link.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{
                        children: "Impostazioni",
                        side: "right"
                    }}>
                        <Settings />
                        <span>Impostazioni</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
         </SidebarFooter>
    </Sidebar>
  );
}
