import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    const jwt = request.cookies.get('jwt');
    const userRole = request.cookies.get('user_role')?.value;

    // 1. If trying to access dashboard without being logged in
    if (isDashboardRoute && !jwt?.value) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // 2. [REMOVED] Automatic redirect for authenticated users on auth routes (login/signup)
    // This has been removed to allow users to access login/signup even if they have an active session.

    // 3. Granular RBAC for Dashboards
    if (isDashboardRoute && userRole) {
        const segments = pathname.split('/');
        const dashboardType = segments[2]; // e.g. 'student', 'admin', 'tutor', 'manager'

        if (dashboardType && dashboardType !== userRole) {
            // Prevent Cross-Dashboard Access
            // Standardize roles: ensure dashboardType matches userRole
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
