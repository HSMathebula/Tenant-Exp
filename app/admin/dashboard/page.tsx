"use client"

import { AvatarFallback } from "@/components/ui/avatar"

import { Avatar } from "@/components/ui/avatar"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { BarChart, LineChart, PieChart } from "@/components/charts"
import { Building, Users, Wrench, Clock, AlertTriangle, CheckCircle, Calendar, Download } from "lucide-react"

export default function AdminDashboard() {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader onMenuClick={() => setShowSidebar(!showSidebar)} />

      <div className="flex flex-1">
        <AdminSidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Property Management Dashboard</h1>
            <p className="text-muted-foreground">Overview of all properties and maintenance activities.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">120 total units</p>
              </CardContent>
              <CardFooter>
                <Link href="/admin/properties" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Properties
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">112</div>
                <p className="text-xs text-muted-foreground">8 vacant units</p>
              </CardContent>
              <CardFooter>
                <Link href="/admin/tenants" className="w-full">
                  <Button variant="outline" className="w-full">
                    Manage Tenants
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">5 urgent, 18 normal</p>
              </CardContent>
              <CardFooter>
                <Link href="/admin/tickets" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Tickets
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.8 days</div>
                <p className="text-xs text-muted-foreground">↓ 0.3 days from last month</p>
              </CardContent>
              <CardFooter>
                <Link href="/admin/reports" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Reports
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Maintenance Tickets Overview</CardTitle>
                <CardDescription>Ticket volume over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart />
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Ticket Categories</CardTitle>
                <CardDescription>Distribution by maintenance type</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart />
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Staff Performance</CardTitle>
                <CardDescription>Tickets completed by staff member</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart />
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>Urgent Tickets</CardTitle>
                <CardDescription>Tickets requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Water leak under kitchen sink</h3>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Unit 302 - Sarah Johnson</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Reported: 2 hours ago
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unassigned
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Assign</Button>
                  </div>

                  <div className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">No hot water in shower</h3>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Unit 508 - Emily Rodriguez</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Reported: 5 hours ago
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Assigned to Mike
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>

                  <div className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Power outage in bedroom</h3>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Unit 104 - John Smith</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Reported: 3 hours ago
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unassigned
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Assign</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Urgent Tickets
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="schedule">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schedule">Staff Schedule</TabsTrigger>
                <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
              </TabsList>

              <TabsContent value="schedule" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Today's Staff Schedule</CardTitle>
                      <CardDescription>Staff assignments for today</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Full Calendar</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>MS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">Mike Smith</p>
                          <p className="text-sm text-muted-foreground">Plumbing Specialist</p>
                        </div>
                        <Badge variant="outline">8:00 AM - 5:00 PM</Badge>
                        <Badge>3 Tickets</Badge>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">Jessica Davis</p>
                          <p className="text-sm text-muted-foreground">Electrical Specialist</p>
                        </div>
                        <Badge variant="outline">9:00 AM - 6:00 PM</Badge>
                        <Badge>4 Tickets</Badge>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>RJ</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">Robert Johnson</p>
                          <p className="text-sm text-muted-foreground">General Maintenance</p>
                        </div>
                        <Badge variant="outline">7:00 AM - 4:00 PM</Badge>
                        <Badge>5 Tickets</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Manage Staff Schedule
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Inventory Status</CardTitle>
                      <CardDescription>Current inventory levels</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium">Faucets</p>
                          <div className="w-full h-2 bg-muted rounded-full mt-2">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          15 in stock
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium">Light Bulbs</p>
                          <div className="w-full h-2 bg-muted rounded-full mt-2">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: "90%" }}></div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          45 in stock
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium">Air Filters</p>
                          <div className="w-full h-2 bg-muted rounded-full mt-2">
                            <div className="h-2 bg-yellow-500 rounded-full" style={{ width: "30%" }}></div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        >
                          6 in stock
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="font-medium">Garbage Disposals</p>
                          <div className="w-full h-2 bg-muted rounded-full mt-2">
                            <div className="h-2 bg-red-500 rounded-full" style={{ width: "10%" }}></div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          2 in stock
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Manage Inventory
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="announcements" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Announcements</CardTitle>
                      <CardDescription>Announcements sent to tenants</CardDescription>
                    </div>
                    <Button size="sm">New Announcement</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-primary p-4 bg-primary/5">
                        <h3 className="font-medium">Scheduled Maintenance: Water Shut-off</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Water will be shut off on April 30th from 10am-2pm for routine maintenance.
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">Posted on Apr 20, 2024</p>
                          <Badge>All Properties</Badge>
                        </div>
                      </div>

                      <div className="border-l-4 border-primary p-4 bg-primary/5">
                        <h3 className="font-medium">Community BBQ Event</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Join us for a community BBQ in the courtyard on May 15th from 4-7pm.
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">Posted on Apr 18, 2024</p>
                          <Badge>Riverside Apartments</Badge>
                        </div>
                      </div>

                      <div className="border-l-4 border-primary p-4 bg-primary/5">
                        <h3 className="font-medium">Parking Garage Cleaning</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          The parking garage will be cleaned on May 5th. Please remove vehicles by 8am.
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">Posted on Apr 15, 2024</p>
                          <Badge>Parkview Towers</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Announcements
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
