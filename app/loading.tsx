import { Loader } from 'lucide-react'
import React from 'react'

const loading = () => {
  return (
    <div className='min-h-[90vh] flex justify-center items-center'><Loader className='animate-spin' size={'5rem'}/></div>
  )
}

export default loading
