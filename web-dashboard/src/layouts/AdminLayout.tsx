"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import {
  Building,
  Users,
  FileText,
  Calendar,
  PenToolIcon as Tool,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Search,
  Sun,
  Moon,
  X,
  ChevronDown,
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const routes = [
    {
      label: "Dashboard",
      icon: <Building className="h-5 w-5" />,
      href: "/admin/dashboard",
      active: location.pathname === "/admin/dashboard",
    },
    {
      label: "Properties",
      icon: <Building className="h-5 w-5" />,
      href: "/admin/properties",
      active: location.pathname.includes("/admin/properties"),
    },
    {
      label: "Tenants",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/tenants",
      active: location.pathname.includes("/admin/tenants"),
    },
    {
      label: "Tickets",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin/tickets",
      active: location.pathname.includes("/admin/tickets"),
    },
    {
      label: "Staff Schedule",
      icon: <Calendar className="h-5 w-5" />,
      href: "/admin/schedule",
      active: location.pathname.includes("/admin/schedule"),
    },
    {
      label: "Inventory",
      icon: <Tool className="h-5 w-5" />,
      href: "/admin/inventory",
      active: location.pathname.includes("/admin/inventory"),
    },
    {
      label: "Announcements",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin/announcements",
      active: location.pathname.includes("/admin/announcements"),
    },
    {
      label: "Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin/reports",
      active: location.pathname.includes("/admin/reports"),
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      active: location.pathname.includes("/admin/settings"),
    },
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? "visible" : "invisible"}`}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100 ease-out" : "opacity-0 ease-in"
          }`}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        ></div>

        <div
          className={`relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800 pt-5 pb-4 transition duration-300 transform ${
            sidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-shrink-0 items-center px-4">
            <Link to="/admin/dashboard" className="text-xl font-bold">
              PropertyPulse
            </Link>
          </div>
          <div className="mt-5 h-0 flex-1 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    route.active
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {route.icon}
                  <span className="ml-3">{route.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/admin/dashboard" className="text-xl font-bold">
                PropertyPulse
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    route.active
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  {route.icon}
                  <span className="ml-3">{route.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <button onClick={handleLogout} className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    <LogOut className="h-5 w-5 inline mr-2" />
                    Log out
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white dark:bg-gray-800">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:text-gray-400 dark:hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <form
              onSubmit={handleSearch}
              className="w-full max-w-lg lg:max-w-xs relative text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
              >
                <span className="sr-only">Toggle theme</span>
                {theme === "dark" ? (
                  <Sun className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Moon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <div className="ml-3 relative">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-300 hidden md:block">{user?.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400 hidden md:block" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
