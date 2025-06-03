"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode } from "lucide-react"
import { TenantHeader } from "@/components/tenant-header"
import { TenantSidebar } from "@/components/tenant-sidebar"

export default function TenantDashboard() {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <TenantHeader onMenuClick={() => setShowSidebar(!showSidebar)} />

      <div className="flex flex-1">
        <TenantSidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome back, Alex</h1>
            <p className="text-muted-foreground">Here's what's happening with your apartment today.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
                <Badge>2</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 Open</div>
                <p className="text-xs text-muted-foreground">1 in progress, 1 pending</p>
              </CardContent>
              <CardFooter>
                <Link href="/tenant/tickets" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Tickets
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rent Status</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Paid
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,250.00</div>
                <p className="text-xs text-muted-foreground">Next payment: May 1, 2024</p>
              </CardContent>
              <CardFooter>
                <Link href="/tenant/payments" className="w-full">
                  <Button variant="outline" className="w-full">
                    Payment History
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitor Access</CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Generate Code</div>
                <p className="text-xs text-muted-foreground">Create temporary access for visitors</p>
              </CardContent>
              <CardFooter>
                <Link href="/tenant/visitor-access" className="w-full">
                  <Button variant="outline" className="w-full">
                    Create Access Code
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                <Badge>3 New</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Community Updates</div>
                <p className="text-xs text-muted-foreground">3 new announcements</p>
              </CardContent>
              <CardFooter>
                <Link href="/tenant/announcements" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Maintenance Tickets</CardTitle>
                <CardDescription>Your recent maintenance requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Leaking faucet in kitchen</p>
                      <p className="text-sm text-muted-foreground">Submitted on Apr 15, 2024</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    >
                      In Progress
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">AC not cooling properly</p>
                      <p className="text-sm text-muted-foreground">Submitted on Apr 10, 2024</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Pending
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Light bulb replacement in bathroom</p>
                      <p className="text-sm text-muted-foreground">Completed on Apr 5, 2024</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Completed
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/tenant/tickets/new" className="w-full">
                  <Button className="w-full">Create New Ticket</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Building Announcements</CardTitle>
                <CardDescription>Latest updates from management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary p-4 bg-primary/5">
                    <h3 className="font-medium">Scheduled Maintenance: Water Shut-off</h3>
                    <p className="text-sm text-muted-foreground">
                      Water will be shut off on April 30th from 10am-2pm for routine maintenance.
                    </p>
                    <p className="text-xs mt-2">Posted on Apr 20, 2024</p>
                  </div>

                  <div className="border-l-4 border-primary p-4 bg-primary/5">
                    <h3 className="font-medium">Community BBQ Event</h3>
                    <p className="text-sm text-muted-foreground">
                      Join us for a community BBQ in the courtyard on May 15th from 4-7pm.
                    </p>
                    <p className="text-xs mt-2">Posted on Apr 18, 2024</p>
                  </div>

                  <div className="border-l-4 border-primary p-4 bg-primary/5">
                    <h3 className="font-medium">Parking Garage Cleaning</h3>
                    <p className="text-sm text-muted-foreground">
                      The parking garage will be cleaned on May 5th. Please remove vehicles by 8am.
                    </p>
                    <p className="text-xs mt-2">Posted on Apr 15, 2024</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/tenant/announcements" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Announcements
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
