"use server";
import { neon } from "@neondatabase/serverless";
import { extractNameFromEmail } from "./utils";
import { User } from "./types";

export const sql = neon(process.env.DATABASE_URL!);


export async function getUser({
    email,
    provider,
    ip,
    userAgent,
    country,
    city,
    browser,
    device,
    os,
    isSigningUpUserWithCredientials = false,
}: {
    email: string
    provider: 'google' | 'github' | 'credentials' | 'none'
    ip: string
    userAgent: string
    country: string
    city: string
    browser: string
    device: string
    os: string
    isSigningUpUserWithCredientials?: boolean
}) {
    try {
        const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

        if (!user) {
            return null;
        }

        const providerMatches =
            (provider === 'google' && user.googleid) ||
            (provider === 'github' && user.githubid) ||
            (provider === 'credentials' && user.password);


        if (isSigningUpUserWithCredientials) {
            if (providerMatches) {
                return user as User;
            }
            throw new Error('A user with this email already exists with another sign-in method');
        }

        if (!providerMatches) {
            throw new Error('Email already exists with a different sign-in method');
        }

        await sql`
          INSERT INTO user_signin_history (
            userid, country, city, ip, user_agent, os, browser, device, signed_in_at
          ) VALUES (
            ${user.id}, ${country}, ${city}, ${ip}, ${userAgent}, ${os}, ${browser}, ${device}, ${new Date()}
          )
      `;

        return user as User;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message);
    }
}


export async function createUser({ email,
    ip,
    username,
    hashedPassword,
    userAgent,
    country,
    city,
    browser,
    device,
    os,
    isSigningUpUserWithCredientials = false
}: {
    email: string,
    hashedPassword: string,
    username: string,
    ip: string,
    userAgent: string,
    country: string,
    city: string,
    browser: string,
    device: string,
    os: string,
    isSigningUpUserWithCredientials?: boolean
}) {
    try {
        const existingUser = await getUser({ email, provider: 'credentials', browser, city, country, ip, userAgent, os, device, isSigningUpUserWithCredientials });

        if (existingUser) {
            return null;
        } else {
            const name = username || extractNameFromEmail(email)
            const [user] = await sql`
            INSERT INTO users (id, name, email, image, password, country, city)
            VALUES (${crypto.randomUUID()}, ${name}, ${email}, ${'https://ui-avatars.com/api/?name=' + name}, ${hashedPassword}, ${country}, ${city})
            RETURNING id, name, image, email`;
            await sql`
             INSERT INTO user_signin_history (
            userid, country, city, ip, user_agent, os, browser, device, signed_in_at
          ) VALUES (
            ${user.id}, ${country}, ${city}, ${ip}, ${userAgent}, ${os}, ${browser}, ${device}, ${new Date()}
          )
          `
            return user as User;
        }
    } catch (error) {
        console.log('creating User: ' + (error as Error).message);
        throw new Error('creating User: ' + (error as Error).message);
    }
}


