"use client"

import { usePathname } from "next/navigation"

import { AuthGuard } from "@/components/admin/AuthGuard"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

/**
 * Layout das rotas admin. A página /admin/login é a única
 * pública dentro deste segmento — o resto passa pelo AuthGuard
 * e ganha o AdminSidebar persistente.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginRoute = pathname === "/admin/login"

  if (isLoginRoute) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden">
          <main className="px-8 py-10">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
