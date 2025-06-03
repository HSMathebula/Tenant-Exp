"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Home, FileText, Calendar, PenToolIcon as Tool, CheckCircle, Settings, LogOut, X } from "lucide-react"

interface MaintenanceSidebarProps {
  show: boolean
  onClose: () => void
}

export function MaintenanceSidebar({ show, onClose }: MaintenanceSidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/maintenance/dashboard",
      active: pathname === "/maintenance/dashboard",
    },
    {
      label: "Tickets",
      icon: FileText,
      href: "/maintenance/tickets",
      active: pathname.includes("/maintenance/tickets"),
    },
    {
      label: "Schedule",
      icon: Calendar,
      href: "/maintenance/schedule",
      active: pathname.includes("/maintenance/schedule"),
    },
    {
      label: "Materials",
      icon: Tool,
      href: "/maintenance/materials",
      active: pathname.includes("/maintenance/materials"),
    },
    {
      label: "Completed Jobs",
      icon: CheckCircle,
      href: "/maintenance/completed",
      active: pathname.includes("/maintenance/completed"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/maintenance/settings",
      active: pathname.includes("/maintenance/settings"),
    },
  ]

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center px-4 border-b md:hidden">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <X className="h-5 w-5" />
        </Button>
        <Link href="/maintenance/dashboard" className="flex items-center space-x-2">
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
            <Link href="/maintenance/dashboard" className="flex items-center space-x-2">
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
