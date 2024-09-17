'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signup } from '@/lib/action'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { Input } from './ui/input'

export default function SignupForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(signup, undefined)

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
        className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
        htmlFor="email"
      >
        Email
      </label>

      <Input
        className="peer block w-full valid:border-green-500 rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
        id="email"
        type="email"
        name="email"
        placeholder="Enter your email address"
        required
      />

      <label
        className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
        htmlFor="password"
      >
        Password
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
      variant={'outline'}
    >
      {pending ? <Loader className='animate-spin' /> : 'Sign up'}
    </Button>
  )
}
