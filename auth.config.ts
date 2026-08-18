import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth config — no Node.js APIs (no mongoose, no bcryptjs).
 * Used in middleware.ts which runs in the Edge Runtime.
 * The full credentials provider (with DB lookup) lives in lib/auth.ts only.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // credentials provider is added in lib/auth.ts
};
