import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isloggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isloggedIn) return true; // Allow access to dashboard
        return false; // Redirect to login
      } 

      if (isloggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl)); // Redirect to dashboard
      }

      return true; // Allow access to non-dashboard pages
    },
  },
  providers: [], // Add providers here later
} satisfies NextAuthConfig;
