import { auth, signIn } from '@/auth'
import { Button } from '@/components/ui/button'
import { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import * as React from "react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Link from 'next/link'
import SignupForm from '@/components/signup-form'
import ResetForm from '@/components/reset-pass-form'
import { ForgetPassForm } from '@/components/Forget-passwordForm'



export default async function ResetPassPage({ searchParams }: { searchParams: { token: string } }) {
    const session = (await auth()) as Session

    if (session) {
        redirect('/')
    }

    return (
        <div className="flex flex-col mt-16 h-screen items-center">
            <Card className="w-[400px]">
                <CardHeader className='pb-0'>
                    <CardTitle >Reset Password</CardTitle>
                    <CardDescription>Reset password with token to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResetForm token={searchParams.token} />
                </CardContent>
            </Card>
            <div className="flex items-center gap-1 mt-4 text-sm text-zinc-400">
                Expired Token? <div className="font-semibold underline"><ForgetPassForm btnText='Resend'/></div>
            </div>
        </div>
    )
}