"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Building, User, Wrench, Fingerprint } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [userType, setUserType] = useState("tenant")
  const [useBiometric, setUseBiometric] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, we would authenticate the user here
    // For demo purposes, we'll just redirect based on user type
    if (userType === "tenant") {
      router.push("/tenant/dashboard")
    } else if (userType === "maintenance") {
      router.push("/maintenance/dashboard")
    } else if (userType === "admin") {
      router.push("/admin/dashboard")
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">PropertyPulse</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Tabs defaultValue="tenant" className="w-full" onValueChange={setUserType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tenant" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Tenant</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tenant">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Login</CardTitle>
                <CardDescription>Access your tenant portal to manage maintenance requests and more.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="biometric"
                      checked={useBiometric}
                      onCheckedChange={(checked) => setUseBiometric(checked as boolean)}
                    />
                    <Label htmlFor="biometric" className="text-sm flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      Use biometric login when available
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Staff Login</CardTitle>
                <CardDescription>Access your maintenance portal to manage work orders.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-id">Staff ID</Label>
                    <Input id="staff-id" placeholder="Enter your staff ID" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="staff-password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="staff-password" type="password" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="staff-biometric"
                      checked={useBiometric}
                      onCheckedChange={(checked) => setUseBiometric(checked as boolean)}
                    />
                    <Label htmlFor="staff-biometric" className="text-sm flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      Use biometric login when available
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Access the property management dashboard.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="admin-password" type="password" required />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin-biometric"
                      checked={useBiometric}
                      onCheckedChange={(checked) => setUseBiometric(checked as boolean)}
                    />
                    <Label htmlFor="admin-biometric" className="text-sm flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      Use biometric login when available
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="text-primary hover:underline">
            Contact your property manager
          </Link>
        </div>
      </div>
    </div>
  )
}
