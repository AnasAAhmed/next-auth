'use client'; // if App Router

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('message')||'';
  const provider = searchParams.get('provider')||'';

  let errorMessage = 'Something went wrong during sign in.';

  if (error === 'AccessDenied') {
    errorMessage = 'You do not have permission to sign in.';
  } else{
    errorMessage = decodeURIComponent(error);
  }

  return (
    <div className="flex flex-col items-center pt-24 min-h-screen">
    <h1 className="text3xl sm:text-5xl font-bold mb-4 dark:text-gray-200 capitalize">{provider} OAuth Sign In Error.</h1>
    <p className="text-2xl sm:text-3xl mb-4  dark:text-gray-200">{error}.</p>
    <div className='flex items-center gap-3'>
        <Link title='Go back to home page' href={'/'} className='p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Go back to the homepage</Link>
        <Link title='Go back to Login page' href={'/login'} className='p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Login</Link>
        <Link title='Go back to Sign-up page' href={'/sign-up'} className='p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md'>Sign-up</Link>
    </div>
</div>
  );
}