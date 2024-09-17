import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { getUser, sql } from '@/lib/action';
import { User } from './lib/types';
import { extractNameFromEmail } from './lib/utils';

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    newUser: 'sign-up',
    signIn: 'login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user: User | null = await getUser(email);

        if (!user) {
          return null
        }
        if (!user.password) {
          return null
        }
        const isMatched = await compare(password, user.password);
        if (!isMatched) {
          return null
        }

        return { id: user.id, image: user.image, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const googleUser = await getUser(user.email!);

          if (!googleUser) {
            await sql`
          INSERT INTO users (id, name, email, image, googleid)
          VALUES (${crypto.randomUUID()},${extractNameFromEmail(user.email!)},${user.email}, ${user.image!}, ${user.id})
        `;
          }
          return true;
        } catch (error) {
          throw new Error('Erro while creating user');
        }
      }
      if (account?.provider === 'credentials') return true;
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});