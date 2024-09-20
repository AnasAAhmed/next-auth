'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { resetPassRequest } from "@/lib/action"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Loader } from "lucide-react"
import { useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"

export function ForgetPassForm({ btnText }: { btnText: string }) {
    const [result, dispatch] = useFormState(resetPassRequest, undefined)

    useEffect(() => {
        if (result) {
            if (result.type === 'error') {
                toast.error(result.resultCode)
            } else {
                toast.success(result.resultCode)
            }
        }
    }, [result])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size={'sm'} variant="link" className="px-0 text-zinc-500">{btnText}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Forget password?</DialogTitle>
                    <DialogDescription>
                        We will send you the email for password reset.
                        <div className="bg-yellow-200 flex px-3 gap-3 items-center mt-4 h-8 w-full rounded-md">
                            <ExclamationTriangleIcon /><p className="text-primary">This feature is disabled in production.</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <form
                    action={dispatch}
                    className="items-center">
                    <label htmlFor="email" className="mb-3 valid:border-green-500 mt-2 block text-sm font-medium text-zinc-400">
                        Email
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={process.env.NODE_ENV === 'production'}
                        placeholder="Enter your email address"
                        className="col-span-3 focus:outline-none"
                    />
                    <ReqBtn />
                </form>
            </DialogContent>
        </Dialog>
    )
}
function ReqBtn() {
    const { pending } = useFormStatus()

    return (
        <Button
            className="w-full mt-4"
            disabled={pending || process.env.NODE_ENV === 'production'}
            type="submit"
        >
            {pending ? <Loader className='animate-spin' /> : 'Send email request'}
        </Button>
    )
}