'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authenticate } from '@/lib/action'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { ForgetPassForm } from './Forget-passwordForm'
import { Input } from './ui/input'

export default function LoginForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(authenticate, undefined)

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
    // className="flex flex-col items-center gap-4 space-y-3"
    >
      <label
        className="mb-3 block text-xs font-medium text-zinc-400"
        htmlFor="email"
      >
        Email
      </label>
      <div className="relative">
        <Input
          className="peer block w-full valid:border-green-500 rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email address"
          required
        />
      </div>
      <div className='mt-3 mb-1 flex justify-between items-center'>
        <label
          className="block text-xs font-medium text-zinc-400"
          htmlFor="password"
        >
          Password
        </label>
        <ForgetPassForm btnText='Forget Password?'/>
      </div>
      <Input
        className="peer valid:border-green-500 block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
        id="password"
        type="password"
        name="password"
        placeholder="Enter password"
        required
        minLength={6}
      />
      <LoginButton />
    </form>
  )
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      className="w-full mt-4"
      aria-disabled={pending}
      variant={'default'}
    >
      {pending ? <Loader className='animate-spin' /> : 'Log in'}
    </Button>
  )
}
