"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CreditCard, Bus, Users, BarChart3, LogOut, ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  onLogout: () => void
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if the screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setExpanded(false)
      } else {
        setExpanded(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/dashboard/id-verification", label: "ID Verification", icon: <CreditCard className="h-5 w-5" /> },
    { href: "/dashboard/vehicle-configuration", label: "Vehicles", icon: <Bus className="h-5 w-5" /> },
    { href: "/dashboard/account-management", label: "Account Management", icon: <Users className="h-5 w-5" /> },
    { href: "/dashboard/logs", label: "System Logs", icon: <BarChart3 className="h-5 w-5" /> },
  ]

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden border-r bg-muted/40 transition-all duration-300 ease-in-out lg:flex lg:flex-col",
          expanded ? "lg:w-64" : "lg:w-[68px]",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {expanded ? (
            <h2 className="text-lg font-semibold">Tara-vel</h2>
          ) : (
            <span className="mx-auto">
              <Bus className="h-6 w-6" />
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <nav className="flex flex-col gap-2 p-2">
          {navItems.map((item) => (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "transparent text-muted-foreground",
                    !expanded && "justify-center px-2",
                  )}
                >
                  {item.icon}
                  {expanded && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {!expanded && (
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
                size={expanded ? "default" : "icon"}
                className={cn("w-full justify-start gap-2", !expanded && "h-10 w-10 justify-center px-0")}
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
                {expanded && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="flex items-center gap-4">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
