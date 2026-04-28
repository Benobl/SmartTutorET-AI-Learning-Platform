"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-utils";

/**
 * AuthGuard Component
 * Enforces client-side role-based access control and ensures user session is valid.
 * Uses a synchronous initial check to avoid a full-screen spinner flash on navigation.
 */
export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    const pathname = usePathname();

    // Synchronously check localStorage on first render to avoid the spinner flash
    const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        const user = getCurrentUser();
        if (!user) return false;
        if (allowedRoles && !allowedRoles.includes(user.role)) return false;
        return true;
    });

    useEffect(() => {
        const user = getCurrentUser();
        console.log("[AuthGuard] Checking authorization for path:", pathname, "User:", user?.email, "Role:", user?.role);

        if (!user) {
            console.log("[AuthGuard] No user found, redirecting to login");
            router.push(`/login?callbackUrl=${pathname}`);
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            console.log("[AuthGuard] Role not allowed. Redirecting to:", `/dashboard/${user.role}`);
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
