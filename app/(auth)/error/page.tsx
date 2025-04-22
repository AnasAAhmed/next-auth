
import AuthError from '@/components/Error'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'

const Error = () => {
    return (
        <Suspense fallback={<div className='min-h-[90vh] flex justify-center items-center'><Loader size={'5rem'}/></div>}>
            <AuthError />
        </Suspense>
    )
}

export default Error
