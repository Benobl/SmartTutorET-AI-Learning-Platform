import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isDashboardRoute = pathname.startsWith('/dashboard');

    const jwt = request.cookies.get('jwt');
    const userRole = request.cookies.get('user_role')?.value;

    // RBAC: Only do a role-mismatch redirect if the user_role cookie is present
    // (This handles cases where a user directly types a URL for a different role's dashboard)
    // We do NOT block access when no jwt cookie is present because the JWT lives in
    // localStorage (frontend), not an httpOnly cookie from the same origin.
    if (isDashboardRoute && userRole) {
        const segments = pathname.split('/');
        const dashboardType = segments[2]; // 'student' | 'admin' | 'tutor' | 'manager'

        if (dashboardType && dashboardType !== userRole) {
            console.log(`[Middleware] Role mismatch: ${pathname}. Role: ${userRole}. Redirecting.`);
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
