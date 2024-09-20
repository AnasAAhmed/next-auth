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



export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <div className="flex flex-col mt-3 h-screen items-center">
      <Link
        href="/"
        className="flex flex-row gap-1 text-sm self-start px-3 mb-8 text-primary"
      >
        &larr;<div className="font-semibold underline">Back</div>
      </Link>
      <Card className="w-[400px]">
        <CardHeader className='pb-0'>
          <CardTitle >Sign up</CardTitle>
          <CardDescription>Sign up with new account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn('google')
            }}
          >
            <Button className='w-full flex items-center gap-4 mt-4 mb-2' variant={'outline'}>
              <img loading="lazy" height="24" width="24" id="provider-logo" src="https://authjs.dev/img/providers/google.svg" />
              Sign up with Google
            </Button>
          </form>
          <form
            action={async () => {
              "use server"
              await signIn('github')
            }}
          >
            <Button className='w-full flex items-center gap-4 my-2' variant={'outline'}>
              <img loading="lazy" height="24" width="24" id="provider-logo" src="https://authjs.dev/img/providers/github.svg" />
              Sign up with Github
            </Button>
          </form>
          <div className="text-md text-zinc-400 flex justify-center">or</div>
          <SignupForm />
        </CardContent>
      </Card>
      <Link
        href="/login"
        className="flex flex-row gap-1 mt-4 text-sm text-zinc-400"
      >
        Already have an account? <div className="font-semibold underline">Login</div>
      </Link>
    </div>
  )
}