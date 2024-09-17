import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import { Session } from 'next-auth'
import Link from 'next/link'
import React from 'react'

const page = async () => {
    const session = (await auth() as Session)
    return (
        <div>
            {!session ? <>
                <Link href={'/login'}><Button>Login</Button></Link>
                <Link href={'/sign-up'}><Button>Sign-up</Button></Link>
            </> :
                <form
                    action={async () => {
                        "use server"
                        await signOut()
                    }}
                >
                    <Button variant={'default'}>Sign Out</Button>
                    {session.user?.id}
                </form>
                }
        </div>
    )
}

export default page
