"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  Stethoscope,
  ClipboardList,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const { user, logout, hasRole } = useAuth()
  const pathname = usePathname()

  const navGroups = {
    main: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        roles: ["patient", "doctor", "admin"],
      },
      {
        label: "Profile",
        href: "/profile",
        icon: <UserCheck className="w-5 h-5" />,
        roles: ["patient", "doctor", "admin"],
      },
    ],
    patient: [
      {
        label: "Browse Doctors",
        href: "/doctors",
        icon: <Stethoscope className="w-5 h-5" />,
        roles: ["patient"],
      },
      {
        label: "My Doctors",
        href: "/patient/mappings",
        icon: <Users className="w-5 h-5" />,
        roles: ["patient"],
      },
    ],
    doctor: [
      {
        label: "My Patients",
        href: "/doctor/patients",
        icon: <Users className="w-5 h-5" />,
        roles: ["doctor"],
      },
      {
        label: "My Mappings",
        href: "/doctor/mappings",
        icon: <ClipboardList className="w-5 h-5" />,
        roles: ["doctor"],
      },
    ],
    admin: [
      {
        label: "Manage Patients",
        href: "/admin/patients",
        icon: <Users className="w-5 h-5" />,
        roles: ["admin"],
      },
      {
        label: "Manage Doctors",
        href: "/admin/doctors",
        icon: <Stethoscope className="w-5 h-5" />,
        roles: ["admin"],
      },
      {
        label: "View Mappings",
        href: "/admin/mappings",
        icon: <Activity className="w-5 h-5" />,
        roles: ["admin"],
      },
      {
        label: "Reports",
        href: "/reports",
        icon: <FileText className="w-5 h-5" />,
        roles: ["admin"],
      },
      {
        label: "Settings",
        href: "/settings",
        icon: <Settings className="w-5 h-5" />,
        roles: ["admin"],
      },
    ],
  }

  const allItems = [
    ...navGroups.main,
    ...(user?.role === "patient" ? navGroups.patient : []),
    ...(user?.role === "doctor" ? navGroups.doctor : []),
    ...(user?.role === "admin" ? navGroups.admin : []),
  ]

  const filteredItems = allItems.filter((item) => item.roles.includes(user?.role || ""))

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="hover:bg-muted">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 z-40 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">HealthCare</h1>
          </div>
          <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="text-sm px-2">
            <p className="font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
