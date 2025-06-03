"use client"

import type React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import AdminLayout from "../layouts/AdminLayout"

interface ProtectedRouteProps {
  role?: "admin"
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export default ProtectedRoute
