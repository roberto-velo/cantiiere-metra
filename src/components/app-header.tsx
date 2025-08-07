
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "./ui/sidebar";

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


export function AppHeader() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    { href: "/", label: "Dashboard" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { href, label };
    })
  ]

  return (
     <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="sm:hidden" />
        <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 ? (
                        <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                        ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                    </BreadcrumbItem>
                    {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
            <NotificationMenu />
        </div>
    </header>
  );
}
