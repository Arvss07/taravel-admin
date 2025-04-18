"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  LogOut,
  Menu,
  CreditCard,
  Bus,
  Users,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"

interface AppLayoutProps {
  children: React.ReactNode
  navItems?: NavItem[]
  title?: string
  icon?: React.ReactNode
}

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function AppLayout({
  children,
  navItems,
  title = "Tara-vel Admin Panel",
  icon = <Bus className="h-6 w-6" />,
}: AppLayoutProps) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if the screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Default navigation items if none provided
  const defaultNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/dashboard/id-verification", label: "ID Verification", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/dashboard/vehicle-configuration", label: "Vehicles", icon: <Bus className="h-5 w-5" /> },
    { href: "/dashboard/account-management", label: "Users", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/logs", label: "System Logs", icon: <BarChart3 className="h-5 w-5" /> },
  ]

  const items = navItems || defaultNavItems

  useEffect(() => {
    // Only redirect if not loading and no user
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, router, user])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-8 w-40" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-14 flex-col border-r bg-muted/40 lg:flex xl:w-64">
            <div className="flex h-14 items-center border-b px-3 lg:h-16 lg:px-4">
              <Skeleton className="h-8 w-8 lg:hidden" />
              <Skeleton className="hidden h-8 w-28 lg:block" />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
            </div>
          </aside>
          <main className="flex-1 p-4 md:p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Sheet open={isMobile ? undefined : false}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center gap-2 font-semibold">
                  {icon}
                  <span>{title}</span>
                </div>
              </div>
              <nav className="grid flex-1 gap-0.5 overflow-y-auto">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "transparent text-muted-foreground",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-auto border-t p-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="flex items-center gap-2 font-semibold">
              {icon}
              <span className={cn("transition-all", !sidebarOpen && "lg:hidden")}>{title}</span>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className={cn("flex flex-col justify-center", !sidebarOpen && "lg:hidden")}>
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          <aside
            className={cn(
              "hidden border-r bg-muted/40 transition-all duration-300 ease-in-out lg:flex lg:flex-col",
              sidebarOpen ? "lg:w-64" : "lg:w-[68px]",
            )}
          >
            <nav className="flex flex-col gap-2 p-2">
              {items.map((item) => (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "transparent text-muted-foreground",
                        !sidebarOpen && "justify-center px-2",
                      )}
                    >
                      {item.icon}
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {!sidebarOpen && (
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </nav>
            <div className="mt-auto border-t p-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={sidebarOpen ? "default" : "icon"}
                    className={cn("w-full justify-start gap-2", !sidebarOpen && "h-9 w-9 justify-center px-0")}
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    {sidebarOpen && <span>Logout</span>}
                  </Button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right" className="flex items-center gap-4">
                    Logout
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </aside>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
