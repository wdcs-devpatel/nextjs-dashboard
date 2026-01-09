import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // Protects dashboard but ignores landing page, static files, and API routes
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};