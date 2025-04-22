'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Eye, EyeOff, Loader } from 'lucide-react'
import { Input } from './ui/input'
import { signup } from '@/lib/auth.action'

export default function SignupForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(signup, undefined)
  const [showPassword, setShowPassword] = useState(false)

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
        className="mb-3 block text-xs font-medium text-zinc-400"
        htmlFor="username"
      >
        username <span className="text-red-500">*</span>
      </label>

      <Input
        className="peer block w-full valid:border-green-500 rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
        id="username"
        type="text"
        name="username"
        placeholder="Enter your username"
        required
      />
      <label
        className="my-3 block text-xs font-medium text-zinc-400"
        htmlFor="email"
      >
        Email <span className="text-red-500">*</span>
      </label>

      <Input
        className="peer block w-full valid:border-green-500 rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
        id="email"
        type="email"
        name="email"
        placeholder="Enter your email address"
        required
      />
      <div className="mb-6 relative">
        <div className="mt-3 mb-1 flex justify-between items-center">
          <label
            className="mb-2 block text-xs font-medium text-zinc-400"
            htmlFor="password"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            title={showPassword ? 'Hide Password' : 'Show Password'}
            onClick={() => setShowPassword(prev => !prev)}
            className="block text-small-medium text-zinc-400"
          >
            {showPassword ? <Eye size={'1rem'} /> : <EyeOff size={'1rem'} />}
          </button>
        </div>

        <Input
          className="peer invalid:border-red-500 block w-full rounded-md border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950"
          id="password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Enter password"
          minLength={6}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[#\$&]).{6,}$"
          title="Must be at least 6 characters and better to have include upper & lower case letters and a symbol (#, $, &)"
        // required
        />

        <div className="absolute z-10 hidden peer-invalid:block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs w-72 mt-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
          <div className="p-3 space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Must have at least 6 characters
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-1 bg-orange-300 dark:bg-orange-400"></div>
              <div className="h-1 bg-orange-300 dark:bg-orange-400"></div>
              <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
              <div className="h-1 bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <p>It's better to have:</p>
            <ul>
              <li className="flex items-center mb-1">
                Upper & lower case letters
              </li>
              <li className="flex items-center mb-1">A symbol (#$&)</li>
              <li className="flex items-center">
                A longer password (min. 12 chars.)
              </li>
            </ul>
          </div>
        </div>
      </div>
      <LoginButton />
    </form>
  )
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      className="w-full"
      aria-disabled={pending}
      variant={'default'}
      title='Sign-up with credentials'
    >
      {pending ? <Loader className='animate-spin' /> : 'Sign up'}
    </Button>
  )
}
