"use client";

import React, { useState, useEffect, useRef } from "react";
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

    const allowedRolesStr = allowedRoles?.join(',') || '';
    const [isMounted, setIsMounted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const lastCheckedPath = useRef<string>("");

    useEffect(() => {
        setIsMounted(true);
        const user = getCurrentUser();
        
        // Prevent infinite loops on same path
        if (lastCheckedPath.current === pathname && isAuthorized) return;
        lastCheckedPath.current = pathname;

        if (!user) {
            router.push(`/login?callbackUrl=${pathname}`);
            return;
        }

        const roles = allowedRolesStr ? allowedRolesStr.split(',') : null;
        if (roles && !roles.includes(user.role)) {
            router.push(`/dashboard/${user.role}`);
            return;
        }

        setIsAuthorized(true);
    }, [router, pathname, allowedRolesStr, isAuthorized]);

    // Hydration Guard: Return a stable container on the server and first client render
    if (!isMounted || !isAuthorized) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0a0e27]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                        {isMounted ? "Verifying Credentials..." : "Syncing Academy..."}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
