"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Home, FileText, CreditCard, MessageSquare, Bell, QrCode, Settings, LogOut, X } from "lucide-react"

interface TenantSidebarProps {
  show: boolean
  onClose: () => void
}

export function TenantSidebar({ show, onClose }: TenantSidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/tenant/dashboard",
      active: pathname === "/tenant/dashboard",
    },
    {
      label: "Maintenance Tickets",
      icon: FileText,
      href: "/tenant/tickets",
      active: pathname.includes("/tenant/tickets"),
    },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/tenant/payments",
      active: pathname.includes("/tenant/payments"),
    },
    {
      label: "Visitor Access",
      icon: QrCode,
      href: "/tenant/visitor-access",
      active: pathname.includes("/tenant/visitor-access"),
    },
    {
      label: "Announcements",
      icon: Bell,
      href: "/tenant/announcements",
      active: pathname.includes("/tenant/announcements"),
    },
    {
      label: "Chat Support",
      icon: MessageSquare,
      href: "/tenant/chat",
      active: pathname.includes("/tenant/chat"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/tenant/settings",
      active: pathname.includes("/tenant/settings"),
    },
  ]

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center px-4 border-b md:hidden">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <X className="h-5 w-5" />
        </Button>
        <Link href="/tenant/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">PropertyPulse</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                route.active ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Link href="/auth/login" onClick={onClose}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={show} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex flex-col h-full">{sidebarContent}</div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col h-full border-r bg-background">
          <div className="flex h-16 items-center px-4 border-b">
            <Link href="/tenant/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold">PropertyPulse</span>
            </Link>
          </div>
          {sidebarContent}
        </div>
      </div>

      {/* Spacer for desktop layout */}
      <div className="hidden md:block md:w-64" />
    </>
  )
}
