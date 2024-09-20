'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/action'
import { Button } from './ui/button'
import { CheckCircleIcon, Loader } from 'lucide-react'
import { Input } from './ui/input'

export default function ResetForm({ token, email }: { token: string, email: string }) {
    const router = useRouter()
    const [result, dispatch] = useFormState(resetPassword, undefined)

    useEffect(() => {
        if (result) {
            if (result.type === 'error') {
                toast.error(result.resultCode)
            } else {
                toast.success(result.resultCode)
                router.refresh()
            }
        }
    }, [result, router])

    return (
        <form
            action={dispatch}
        >
            <label
                className="mb-3 hidden mt-5 bldock text-xs font-medium text-zinc-400"
                htmlFor="token"
            >
                Token
            </label>
            <Input
                className="peer  hidden w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="token"
                type="text"
                name="token"
                placeholder="Enter token from url"
                required
                defaultValue={token}
            />
            <label
                className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                htmlFor="email"
            >
                Requested Email
            </label>
            <Input
                className="peer block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="email"
                type="email"
                name="email"
                disabled
                placeholder="Enter email from url"
                required
                defaultValue={email}
            />
            <label
                className="block text-xs font-medium my-3 text-zinc-400"
                htmlFor="password"
            >
                New Password
            </label>
            <Input
                className="peer block w-full valid:border-green-500 rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
            />
            <label
                className="block text-xs font-medium my-3 text-zinc-400"
                htmlFor="cpassword"
            >
                Confirm Password
            </label>
            <Input
                className="peer block w-full valid:border-green-500 rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
                id="cpassword"
                type="password"
                name="cpassword"
                placeholder="Enter confirm password"
                required
                minLength={6}
            />
            <ResetBtn />
            {result && result.type === 'succes' && <div className="bg-green-200 flex px-3 gap-3 items-center mt-4 py-3 w-full rounded-md">
                <CheckCircleIcon />
                <p className="text-primary">
                    Password Reset successful you can close this tab.
                </p>
            </div>}
        </form>
    )
}

function ResetBtn() {
    const { pending } = useFormStatus()

    return (
        <Button
            className="w-full mt-4"
            aria-disabled={pending}
        >
            {pending ? <Loader className='animate-spin' /> : 'Confirm'}
        </Button>
    )
}
