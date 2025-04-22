import NextAuth, { AuthError } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import { compare } from 'bcryptjs';
import { getUser, sql } from '@/lib/action';
import { User } from './lib/types';
import { extractNameFromEmail } from './lib/utils';
import { UAParser } from 'ua-parser-js';
import { headers } from 'next/headers';

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    newUser: '/sign-up',
    signIn: '/login',
    error: '/error'
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
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com', required: true },
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        id: { label: 'Id', type: 'text', placeholder: '23232-3ddd23-2asda13-fgdgdd', required: true },
        image: { label: 'Image', type: 'text', placeholder: "https://ui-avatar.com/anas", required: true },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error('No credentials provided');
        }
        const image = credentials.image as string || 'failed';
        const email = credentials.email as string || 'failed';
        const name = credentials.username as string || 'failed';
        const id = credentials.id as string || 'failed';

        return { id, image, name, email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const ip = headers().get('x-forwarded-for') || '36.255.42.109';
          const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
          const geoData = await geoRes.json();
          const userAgent = headers().get('user-agent') || '';
          const parser = new UAParser(userAgent);
          const result = parser.getResult();
          let country = "oooo";
          let city = "pppp";

          if (ip && ip !== '::1' && ip !== '127.0.0.1') {
            country = geoData.country || 'Unknown';
            city = geoData.city || 'Unknown';
          } else {
            country = "Localhost";
            city = "Localhost";
            console.log("Skipping geo lookup for local IP:", ip);
          }

          const os = `${result.os.name} ${result.os.version}`;
          const device = result.device.type || "Desktop";
          const browser = `${result.browser.name} ${result.browser.version}`;

          const dbUser = await getUser({ email: user.email!, provider: account.provider, browser, city, country, ip, userAgent, os, device });

          if (!dbUser) {
            let newUser: any = null;
            if (account.provider === 'google') {
              [newUser] = await sql`
            INSERT INTO users (id, name, email, image, googleid, country, city)
            VALUES (${crypto.randomUUID()}, ${extractNameFromEmail(user.email!)}, ${user.email}, ${user.image!}, ${account.providerAccountId}, ${country}, ${city})
            RETURNING id
          `;
            } else if (account.provider === 'github') {
              [newUser] = await sql`
              INSERT INTO users (id, name, email, image, githubid, country, city)
              VALUES (${crypto.randomUUID()}, ${extractNameFromEmail(user.email!)}, ${user.email}, ${user.image!}, ${account.providerAccountId}, ${country}, ${city})
              RETURNING id
            `;
            }
            await sql`
         INSERT INTO user_signin_history (userid, country, city, ip, user_agent, os, browser, device, signed_in_at)
         VALUES (${newUser.id},${country},${city}, ${ip}, ${userAgent}, ${os}, ${browser}, ${device}, ${new Date()})
       `;
            (user as any).dbId = newUser.id;
          } else {
            (user as any).dbId = dbUser.id;
          }
          return true;
        } catch (error) {
          const customEncoded = (error as Error).message.replace(/ /g, '+');
          return `/error?message=${customEncoded}&provider=${account.provider}`

        }
      }
      if (account?.provider === 'credentials') return true;
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).dbId || user.id;
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