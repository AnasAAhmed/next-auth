"use server";
import { neon } from "@neondatabase/serverless";
import { extractNameFromEmail, ResultCode } from "./utils";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { hash, genSalt } from "bcryptjs";
import { User } from "./types";

export const sql = neon(process.env.DATABASE_URL!);



export async function getUser(email: string) {
    try {
        const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
        return user as User;
    } catch (error) {
        const err = error as Error
        throw new Error('Internal Server Error' + err.message)
    }
}

interface Result {
    type: string
    resultCode: string
}

export async function authenticate(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    try {
        const email = formData.get('email')
        const password = formData.get('password')

        const parsedCredentials = z
            .object({
                email: z.string().email(),
                password: z.string().min(6)
            })
            .safeParse({
                email,
                password
            })

        if (parsedCredentials.error) {
            return {
                type: 'error',
                resultCode: parsedCredentials.error.cause as string
            }
        }
        await signIn('credentials', {
            email,
            password,
            redirect: false
        })

        return {
            type: 'success',
            resultCode: ResultCode.UserLoggedIn
        }

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        type: 'error',
                        resultCode: ResultCode.InvalidCredentials
                    }
                default:
                    return {
                        type: 'error',
                        resultCode: ResultCode.UnknownError
                    }
            }
        }
    }
}

export async function createUser(
    email: string,
    hashedPassword: string,
) {
    const existingUser = await getUser(email)

    if (existingUser) {
        return {
            type: 'error',
            resultCode: ResultCode.UserAlreadyExists
        }
    } else {
        const name = extractNameFromEmail(email)
        await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${crypto.randomUUID()}, ${name}, ${email}, ${hashedPassword})
      `;
        return {
            type: 'success',
            resultCode: ResultCode.UserCreated
        }
    }
}


export async function signup(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const parsedCredentials = z
        .object({
            email: z.string().email(),
            password: z.string().min(6)
        })
        .safeParse({
            email,
            password
        });

    if (parsedCredentials.success) {
        const salt = await genSalt(10);

        const hashedPassword = await hash(password, salt);

        try {
            const result = await createUser(email, hashedPassword);

            if (result.resultCode === ResultCode.UserCreated) {
                await signIn('credentials', {
                    email,
                    password,
                    redirect: false
                });
            }

            return result;
        } catch (error) {
            console.error("Error in signup process:", error); // Log detailed error to the console

            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        return {
                            type: 'error',
                            resultCode: ResultCode.InvalidCredentials
                        };
                    default:
                        return {
                            type: 'error',
                            resultCode: error.message
                        };
                }
            } else {
                const typeErr = error as Error
                return {
                    type: 'error',
                    resultCode: typeErr.message as string,
                };
            }
        }
    } else {
        return {
            type: 'error',
            resultCode: ResultCode.InvalidSubmission,
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
            return {
                type: 'error',
                resultCode: parsedCredentials.error.message as string
            }
        }

        const token = crypto.randomUUID();
        const tokenExpirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now, in seconds

        try {
            const [user] = await sql`
                UPDATE users 
                SET reset_token = ${token}, reset_token_expires = to_timestamp(${tokenExpirationTime})
                WHERE email = ${parsedCredentials.data.email}
                RETURNING id
            `;

            if (user) {
                const res = await fetch(`${process.env.DOMAIN_URL}/api/reset-mail`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ emailsToSend: [parsedCredentials.data.email], token }),
                });

                if (res.ok) {
                    return {
                        type: 'success',
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
                    resultCode: 'Invalid Email'
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
        const newPassword = formData.get('password');
        const ConfirmPassword = formData.get('cpassword');

        const parsedCredentials = z
            .object({
                token: z.string().uuid(),
                password: z.string().min(8, "Password must be at least 8 characters long"),
                ConfirmPassword: z.string().min(8, "ConfirmPassword must be at least 8 characters long"),
            })
            .safeParse({
                token,
                password: newPassword,
                ConfirmPassword
            });

        if (parsedCredentials.data?.ConfirmPassword !== parsedCredentials.data?.password) {
            return {
                type: 'error',
                resultCode: 'Password do not match',
            };
        }
        if (!parsedCredentials.success) {
            return {
                type: 'error',
                resultCode: parsedCredentials.error.message,
            };
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const [user] = await sql`
            SELECT id, reset_token_expires
            FROM users 
            WHERE reset_token = ${parsedCredentials.data.token}
            AND reset_token_expires > to_timestamp(${currentTime})
        `;

        if (!user) {
            return {
                type: 'error',
                resultCode: 'Invalid or expired token',
            };
        }

        // Hash the new password
        const hashedPassword = await hash(parsedCredentials.data.password, 10);

        // Update the user's password and clear the reset token
        await sql`
            UPDATE users
            SET password = ${hashedPassword},
                reset_token = NULL,
                reset_token_expires = NULL
            WHERE id = ${user.id}
        `;

        return {
            type: 'success',
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
