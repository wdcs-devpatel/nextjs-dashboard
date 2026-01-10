import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import postgres from 'postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';

const sql = postgres(process.env.DATABASE_URL_UNPOOLED!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    // Added backticks here
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          
          if (!user) {
            console.log('Login Fail: User not found in database.');
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) {
            console.log('Login Success: Credentials match.');
            return user;
          } else {
            console.log('Login Fail: Passwords do not match.');
          }
        }
        
        console.log('Login Fail: Invalid input format.');
        return null;
      },
    }),
  ],
});