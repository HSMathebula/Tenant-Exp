"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, MessageSquare, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface TenantHeaderProps {
  onMenuClick: () => void
}

export function TenantHeader({ onMenuClick }: TenantHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="mr-4 hidden md:flex">
          <Link href="/tenant/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">PropertyPulse</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  <DropdownMenuItem className="flex flex-col items-start py-2">
                    <div className="font-medium">Maintenance Update</div>
                    <div className="text-sm text-muted-foreground">
                      Your ticket #1234 has been updated to "In Progress"
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-2">
                    <div className="font-medium">New Announcement</div>
                    <div className="text-sm text-muted-foreground">
                      Water will be shut off on April 30th from 10am-2pm
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">5 hours ago</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start py-2">
                    <div className="font-medium">Visitor Access</div>
                    <div className="text-sm text-muted-foreground">Your visitor code for John Smith has been used</div>
                    <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Link href="/tenant/notifications">View all notifications</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">Alex Thompson</span>
                    <span className="text-xs text-muted-foreground">Unit 302</span>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/tenant/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/tenant/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/tenant/documents" className="w-full">
                    Documents
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/auth/login" className="w-full">
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
