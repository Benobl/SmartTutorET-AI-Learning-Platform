"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"

/**
 * AdminLayout enforces role-based access control for all administrative routes.
 * It sits inside the main DashboardLayout, inheriting the sidebar and navbar.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={["admin", "manager"]}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </div>
        </AuthGuard>
    )
}
