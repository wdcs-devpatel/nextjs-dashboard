import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } 
      
      // We removed the 'else if (isLoggedIn)' block that was 
      // forcing users to /dashboard when they visited the landing page.
      
      return true; // Allow access to all other pages (including your home page)
    },
  },
  providers: [], 
} satisfies NextAuthConfig;