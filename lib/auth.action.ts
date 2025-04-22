'use server'
import { createUser, getUser, sql } from "./action";
import { z } from "zod";
import { Result, User } from "./types";
import { signIn } from "@/auth";
import { ResultCode } from "./utils";
import { compare, genSalt ,hash} from "bcryptjs";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function authenticate(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
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
        const email = formData.get('email')
        const password = formData.get('password')

        const parsedCredentials = z
            .object({
                email: z.string().email(),
                password: z.string().min(6, "Password must be 6 characters long")
            })
            .safeParse({
                email,
                password
            })

        if (parsedCredentials.error) {
            let joinedMessages = ''
            parsedCredentials.error.issues.map((i, _) => (
                joinedMessages += `${_ > 0 ? ' & ' : ' '}` + i.message
            ))
            return {
                type: 'error',
                resultCode: joinedMessages
            }
        }
        const user: User | null = await getUser({ email: parsedCredentials.data.email, provider: 'credentials', browser, city, country, ip, userAgent, os, device });
        if (!user) {
            return {
                type: 'error',
                resultCode: ResultCode.InvalidCredentials
            }
        }
        const isMatched = await compare(parsedCredentials.data.password, user.password);
        if (!isMatched) {
            return {
                type: 'error',
                resultCode: ResultCode.InvalidCredentials
            }
        }
        await signIn('credentials', {
            email,
            id: user.id,
            username: user.name,
            image: user.image,
            redirect: false
        });

        return {
            type: 'success',
            resultCode: ResultCode.UserLoggedIn
        }

    } catch (error) {

        return {
            type: 'error',
            resultCode: (error as Error).message
        }
    }
}




export async function signup(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    try {

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const username = formData.get('username') as string;

        const parsedCredentials = z
            .object({
                email: z.string().email(),
                username: z.string().min(4, "Username must be 4 characters long without symbols"),
                password: z.string().min(6, "Password must be 6 characters long")
            })
            .safeParse({
                email,
                username,
                password
            });

        if (parsedCredentials.success) {
            const ip = headers().get('x-forwarded-for') || '36.255.42.109';
            const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
            const geoData = await geoRes.json();
            const userAgent = headers().get('user-agent') || '';
            const parser = new UAParser(userAgent);
            const resultAgent = parser.getResult();

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

            const os = `${resultAgent.os.name} ${resultAgent.os.version}`;
            const device = resultAgent.device.type || "Desktop";
            const browser = `${resultAgent.browser.name} ${resultAgent.browser.version}`;
            const salt = await genSalt(10);

            const hashedPassword = await hash(password, salt);

            const createdUser = await createUser({ email, hashedPassword, username, browser, city, country, ip, userAgent, os, device, isSigningUpUserWithCredientials: true });

            if (createdUser) {
                await signIn('credentials', {
                    email,
                    id: createdUser.id,
                    username: createdUser.name,
                    image: createdUser.image,
                    redirect: false
                });
            } else {
                return {
                    type: 'error',
                    resultCode: ResultCode.UserAlreadyExists,
                };
            }

            return {
                type: 'succes',
                resultCode: ResultCode.UserCreated,
            };

        } else {
            let joinedMessages = ''
            parsedCredentials.error.issues.map((i, _) => (
                joinedMessages += `${_ > 0 ? ' & ' : ' '}` + i.message
            ))
            return {
                type: 'error',
                resultCode: joinedMessages
            }
        }
    } catch (error) {
        console.error("Error in signup process:", error); // Log detailed error to the console
        const typeErr = error as Error
        return {
            type: 'error',
            resultCode: typeErr.message as string,
        };
    }
}
export async function resetPassRequest(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    try {
        const email = formData.get('email');

        const parsedCredentials = z
            .object({
                email: z.string().email(),
            })
            .safeParse({
                email,
            });

        if (!parsedCredentials.success) {
            let joinedMessages = ''
            parsedCredentials.error.issues.map((i, _) => (
                joinedMessages += `${_ > 0 ? ' & ' : ' '}` + i.message
            ))
            return {
                type: 'error',
                resultCode: joinedMessages
            }
        }

        const token = crypto.randomUUID();
        const tokenExpirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now, in seconds

        try {
            const [user] = await sql`
                UPDATE users 
                SET reset_token = ${token}, reset_token_expires = to_timestamp(${tokenExpirationTime})
                WHERE email = ${parsedCredentials.data.email} 
                AND password IS NOT NULL
                RETURNING id
            `;

            if (user) {
                const res = await fetch(`${process.env.DOMAIN_URL}/api/reset-mail`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ emailsToSend: [parsedCredentials.data.email], userId: user.id, token }),
                });

                if (res.ok) {
                    return {
                        type: 'succes',
                        resultCode: 'Reset password email sent.'
                    };
                } else {
                    return {
                        type: 'error',
                        resultCode: 'Error sending mail'
                    };
                }
            } else {
                return {
                    type: 'error',
                    resultCode: 'This email does not exist with credentials'
                };
            }
        } catch (error) {
            const typeErr = error as Error;
            return {
                type: 'error',
                resultCode: typeErr.message
            };
        }

    } catch (error) {
        return {
            type: 'error',
            resultCode: 'Unknown Error'
        };
    }
}


export async function resetPassword(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    try {
        const token = formData.get('token');
        const userId = formData.get('userId');
        const newPassword = formData.get('password');
        const ConfirmPassword = formData.get('cpassword');

        const parsedCredentials = z
            .object({
                token: z.string().uuid(),
                userId: z.string().min(30, "Invalid userId"),
                password: z.string().min(6, "Password must be at least 6 characters long"),
                ConfirmPassword: z.string().min(6, "ConfirmPassword must be at least 6 characters long"),
            })
            .safeParse({
                token,
                userId,
                password: newPassword,
                ConfirmPassword
            });

        if (!parsedCredentials.success) {
            let joinedMessages = ''
            parsedCredentials.error.issues.map((i, _) => (
                joinedMessages += `${_ > 0 ? ' & ' : ' '}` + i.message
            ))
            return {
                type: 'error',
                resultCode: joinedMessages
            }
        }
        if (parsedCredentials.data?.ConfirmPassword !== parsedCredentials.data?.password) {
            return {
                type: 'error',
                resultCode: 'Password do not match',
            };
        }

        const [user] = await sql`
            SELECT id, reset_token, reset_token_expires
            FROM users 
            WHERE id = ${parsedCredentials.data.userId}
        `;

        const isValidToken = user.reset_token === parsedCredentials.data.token;
        const isExpiredToken = user.reset_token_expires > Math.floor(Date.now() / 1000)

        if (!isValidToken || !isExpiredToken) {
            return {
                type: 'error',
                resultCode: 'Invalid or expired token',
            };
        }

        const hashedPassword = await hash(parsedCredentials.data.password, 10);

        await sql`
            UPDATE users
            SET password = ${hashedPassword},
                reset_token = NULL,
                reset_token_expires = NULL
            WHERE id = ${user.id}
        `;

        return {
            type: 'succes',
            resultCode: 'Password successfully reset',
        };
    } catch (error) {
        const typeErr = error as Error;
        return {
            type: 'error',
            resultCode: typeErr.message,
        };
    }
}
