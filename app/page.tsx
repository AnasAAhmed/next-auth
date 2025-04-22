import { auth, signOut } from '@/auth'
import PaginationControls from '@/components/Pagination'
import { sql } from '@/lib/action'
import { UserSignInHistory } from '@/lib/types'
import { Session } from 'next-auth'
import Link from 'next/link'
import React from 'react'

const Page = async ({ searchParams }: { searchParams: { page: string } }) => {
    const page = Number(searchParams.page || 1);
    const LIMIT = 8;
    const skip = LIMIT * (page - 1);

    const session = (await auth()) as Session;
    let userSignInHistory: UserSignInHistory[] = [];
    let totalCount = 0;

    if (session && session.user) {
        const countResult = await sql`
    SELECT COUNT(*) FROM user_signin_history WHERE userid = ${session.user.id}
  `;
        totalCount = Number(countResult[0].count);

        if (totalCount > 0) {
            const rows = await sql`
      SELECT * FROM user_signin_history
      WHERE userid = ${session.user.id}
      ORDER BY signed_in_at DESC
      LIMIT ${LIMIT}
      OFFSET ${skip}
    `;
            userSignInHistory = rows as UserSignInHistory[];
        }
    }
    const totalPages = Math.ceil(totalCount / LIMIT);
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Link href="/login">
                    <button className="px-6 py-2 bg-black text-white rounded hover:bg-zinc-800 transition">Login</button>
                </Link>
                <Link href="/sign-up">
                    <button className="px-4 py-2 border border-zinc-300 text-zinc-800 rounded hover:bg-zinc-100 transition">Sign-up</button>
                </Link>
            </div>
        )
    }

    const user = session.user

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
            {/* Profile Card */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-6 flex items-center gap-4">
                <img
                    src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}&w=16&q=75`}
                    alt="avatar"
                    //   width={100}
                    //   height={100}
                    className="w-16 h-16 rounded-full border border-zinc-200 object-cover"
                />
                <div className="flex-1">
                    <h2 className="text-lg font-semibold">{user?.name}</h2>
                    <p className="text-sm text-zinc-500">{user?.email}</p>
                    <p className="text-sm text-zinc-400 mt-1">Session expires: {new Date(session.expires).toLocaleString()}</p>
                </div>
                <form action={async () => { 'use server'; await signOut() }}>
                    <button className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
                        Sign Out
                    </button>
                </form>
            </div>

            {/* Sign-in History */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
                <div className="border-b border-zinc-200 p-4">
                    <h3 className="text-base font-medium">Recent Sign-in History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium text-zinc-600">Date</th>
                                <th className="text-left px-4 py-2 font-medium text-zinc-600">IP</th>
                                <th className="text-left px-4 py-2 font-medium text-zinc-600 hidden md:table-cell">Location</th>
                                <th className="text-left px-4 py-2 font-medium text-zinc-600 hidden md:table-cell">Device</th>
                                {/* <th className="text-left px-4 py-2 font-medium text-zinc-600 hidden md:table-cell">Device</th> */}
                                <th className="text-left px-4 py-2 font-medium text-zinc-600 hidden md:table-cell">OS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userSignInHistory.length > 0 ? userSignInHistory.map(entry => (
                                <tr key={entry.userid} className="hover:bg-zinc-50">
                                    <td className="px-4 py-2">{new Date(entry.signed_in_at).toLocaleString()}</td>
                                    <td className="px-4 py-2">{entry.ip}</td>
                                    <td className="px-4 py-2 hidden md:table-cell">{entry.country + ', ' + entry.city || 'Unknown'}</td>
                                    <td title={entry.user_agent} className="px-4 py-2 hidden md:table-cell truncate max-w-[200px]">{entry.user_agent}</td>
                                    <td className="px-4 py-2 hidden md:table-cell truncate max-w-[200px]">{entry.os}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td className="px-4 py-4 text-zinc-500 text-center" colSpan={4}>
                                        No sign-in history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <PaginationControls currentPage={Number(searchParams.page) || 1} totalPages={totalPages} />
        </div>
    )
}

export default Page
