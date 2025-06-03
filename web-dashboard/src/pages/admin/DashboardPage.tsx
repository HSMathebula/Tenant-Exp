import type React from "react"
import { Link } from "react-router-dom"
import { Building, Users, Wrench, Clock, AlertTriangle, CheckCircle, Calendar, Download } from "lucide-react"

const DashboardPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Property Management Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Overview of all properties and maintenance activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</h2>
            <Building className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">120 total units</p>
          <div className="mt-4">
            <Link
              to="/admin/properties"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Properties
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tenants</h2>
            <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-2xl font-bold">112</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">8 vacant units</p>
          <div className="mt-4">
            <Link
              to="/admin/tenants"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Manage Tenants
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Tickets</h2>
            <Wrench className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-2xl font-bold">23</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">5 urgent, 18 normal</p>
          <div className="mt-4">
            <Link
              to="/admin/tickets"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Tickets
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Resolution Time</h2>
            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-2xl font-bold">1.8 days</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">↓ 0.3 days from last month</p>
          <div className="mt-4">
            <Link
              to="/admin/reports"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Urgent Tickets</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tickets requiring immediate attention</p>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">Water leak under kitchen sink</h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Urgent
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unit 302 - Sarah Johnson</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Reported: 2 hours ago
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unassigned
                    </div>
                  </div>
                </div>
                <button className="mt-2 sm:mt-0 px-3 py-1 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                  Assign
                </button>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">No hot water in shower</h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Urgent
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unit 508 - Emily Rodriguez</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Reported: 5 hours ago
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Assigned to Mike
                    </div>
                  </div>
                </div>
                <button className="mt-2 sm:mt-0 px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                  View
                </button>
              </div>
            </div>

            <div className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium">Power outage in bedroom</h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Urgent
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Unit 104 - John Smith</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Reported: 3 hours ago
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unassigned
                    </div>
                  </div>
                </div>
                <button className="mt-2 sm:mt-0 px-3 py-1 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                  Assign
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/admin/tickets"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              View All Urgent Tickets
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">Today's Staff Schedule</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Staff assignments for today</p>
            </div>
            <button className="flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Full Calendar</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
                MS
              </div>
              <div className="flex-1">
                <p className="font-medium">Mike Smith</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plumbing Specialist</p>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  8:00 AM - 5:00 PM
                </span>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  3 Tickets
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
                JD
              </div>
              <div className="flex-1">
                <p className="font-medium">Jessica Davis</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Electrical Specialist</p>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  9:00 AM - 6:00 PM
                </span>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  4 Tickets
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
                RJ
              </div>
              <div className="flex-1">
                <p className="font-medium">Robert Johnson</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">General Maintenance</p>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  7:00 AM - 4:00 PM
                </span>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  5 Tickets
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/admin/schedule"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Manage Staff Schedule
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">Inventory Status</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current inventory levels</p>
            </div>
            <button className="flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
              <Download className="h-4 w-4 mr-1" />
              <span>Export</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Faucets</p>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  15 in stock
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Light Bulbs</p>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  45 in stock
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Air Filters</p>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                  <div className="h-2 bg-yellow-500 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  6 in stock
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">Garbage Disposals</p>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                  <div className="h-2 bg-red-500 rounded-full" style={{ width: "10%" }}></div>
                </div>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  2 in stock
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/admin/inventory"
              className="text-sm text-center block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Manage Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
