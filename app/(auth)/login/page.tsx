import { auth, signIn } from '@/auth'
import LoginForm from '@/components/login-form'
import { Button } from '@/components/ui/button'
import { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from 'next/link'



export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <div className="flex flex-col  mt-3 h-screen items-center">
      <Link
        href="/"
        className="flex flex-row gap-1 text-sm self-start px-3 mb-8 text-primary"
      >
        &larr;<div className="font-semibold underline">Back</div>
      </Link>
      <Card className="w-[400px]">
        <CardHeader className='pb-0'>
          <CardTitle >Login</CardTitle>
          <CardDescription>Login with your account to continue.</CardDescription>
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
              Log in with Google
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
              Log in with Github
            </Button>
          </form>
          <div className="text-md text-zinc-400 flex justify-center">or</div>
          <LoginForm />
        </CardContent>
      </Card>
      <Link
        href="/sign-up"
        className="flex flex-row gap-1 mt-4 text-sm text-zinc-400"
      >
        No account yet? <div className="font-semibold underline">Sign up</div>
      </Link>
    </div>
  )
}