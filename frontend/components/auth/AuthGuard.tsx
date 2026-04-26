"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * AuthGuard Component
 * Enforces client-side role-based access control and ensures user session is valid.
 */
export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        console.log("[AuthGuard] Checking authorization for path:", pathname, "User:", user?.email, "Role:", user?.role);

        if (!user) {
            console.log("[AuthGuard] No user found, redirecting to login");
            router.push(`/login?callbackUrl=${pathname}`);
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            console.log("[AuthGuard] Role not allowed. Allowed:", allowedRoles, "User role:", user.role, "Redirecting to:", `/dashboard/${user.role}`);
            router.push(`/dashboard/${user.role}`);
            return;
        }

        console.log("[AuthGuard] Authorized successfully");
        setIsAuthorized(true);
    }, [router, pathname, allowedRoles]);

    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0a0e27]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                        Verifying Credentials...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
