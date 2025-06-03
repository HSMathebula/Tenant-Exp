"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MaintenanceHeader } from "@/components/maintenance-header"
import { MaintenanceSidebar } from "@/components/maintenance-sidebar"
import { Calendar, Clock, PenToolIcon as Tool, CheckCircle, Clock3 } from "lucide-react"

export default function MaintenanceDashboard() {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <MaintenanceHeader onMenuClick={() => setShowSidebar(!showSidebar)} />

      <div className="flex flex-1">
        <MaintenanceSidebar show={showSidebar} onClose={() => setShowSidebar(false)} />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Maintenance Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Mike. Here's your work summary.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
                <Badge>4</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4 Active</div>
                <p className="text-xs text-muted-foreground">2 urgent, 2 normal</p>
              </CardContent>
              <CardFooter>
                <Link href="/maintenance/tickets" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Tickets
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3 Jobs</div>
                <p className="text-xs text-muted-foreground">8:00 AM - 5:00 PM</p>
              </CardContent>
              <CardFooter>
                <Link href="/maintenance/schedule" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Schedule
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 Tickets</div>
                <p className="text-xs text-muted-foreground">Avg. completion: 1.2 days</p>
              </CardContent>
              <CardFooter>
                <Link href="/maintenance/completed" className="w-full">
                  <Button variant="outline" className="w-full">
                    View History
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Materials</CardTitle>
                <Tool className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 Jobs</div>
                <p className="text-xs text-muted-foreground">Waiting for parts</p>
              </CardContent>
              <CardFooter>
                <Link href="/maintenance/materials" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="assigned">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="assigned">Assigned Tickets</TabsTrigger>
                <TabsTrigger value="available">Available Tickets</TabsTrigger>
                <TabsTrigger value="recent">Recently Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="assigned" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Assigned Tickets</CardTitle>
                    <CardDescription>Tickets currently assigned to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Water leak under kitchen sink</h3>
                            <Badge variant="destructive">Urgent</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 302 - Sarah Johnson</p>
                          <p className="text-sm mt-2">
                            Water is pooling under the sink and appears to be coming from the pipe connection.
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Reported: 2 hours ago
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled: Today, 11:00 AM
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Start Job</Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">AC not cooling properly</h3>
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            >
                              Normal
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 415 - Michael Chen</p>
                          <p className="text-sm mt-2">
                            Air conditioner is running but not cooling the apartment effectively.
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Reported: 1 day ago
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled: Today, 2:00 PM
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Start Job</Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Garbage disposal not working</h3>
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            >
                              Normal
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 201 - David Wilson</p>
                          <p className="text-sm mt-2">Garbage disposal makes a humming sound but doesn't grind.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Reported: 2 days ago
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled: Tomorrow, 10:00 AM
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-l-4 border-red-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">No hot water in shower</h3>
                            <Badge variant="destructive">Urgent</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 508 - Emily Rodriguez</p>
                          <p className="text-sm mt-2">No hot water coming from the shower, but sink has hot water.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Reported: 5 hours ago
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled: Tomorrow, 9:00 AM
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Assigned Tickets
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="available" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Tickets</CardTitle>
                    <CardDescription>Tickets that need to be assigned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Broken towel rack in bathroom</h3>
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            >
                              Normal
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 103 - James Thompson</p>
                          <p className="text-sm mt-2">
                            Towel rack has come loose from the wall and needs to be reinstalled.
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Reported: 1 day ago
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Claim Ticket</Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Light bulb replacement in hallway</h3>
                            <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            >
                              Low
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 210 - Lisa Garcia</p>
                          <p className="text-sm mt-2">Hallway light bulb has burned out and needs replacement.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Reported: 3 days ago
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Claim Ticket</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Available Tickets
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="recent" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recently Completed</CardTitle>
                    <CardDescription>Your recently completed tickets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Replace bathroom faucet</h3>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 405 - Robert Brown</p>
                          <p className="text-sm mt-2">Replaced leaking bathroom faucet with new model.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Completed: Today, 9:45 AM
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock3 className="h-3 w-3 mr-1" />
                              Time spent: 45 minutes
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Fix loose cabinet door</h3>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 301 - Jennifer Martinez</p>
                          <p className="text-sm mt-2">Tightened hinges on kitchen cabinet door that was loose.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Completed: Yesterday, 3:20 PM
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock3 className="h-3 w-3 mr-1" />
                              Time spent: 15 minutes
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Unclog bathroom drain</h3>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Unit 512 - Thomas Lee</p>
                          <p className="text-sm mt-2">Unclogged bathroom sink drain that was draining slowly.</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Completed: Yesterday, 11:15 AM
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock3 className="h-3 w-3 mr-1" />
                              Time spent: 30 minutes
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Completed Tickets
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
