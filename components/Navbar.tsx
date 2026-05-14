"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "./ui/button"

function Navbar() {
    let {data:session} = useSession()
  return (
    <nav className="border-b bg-background">
        <div className="flex max-w-7xl mx-auto justify-between h-16 items-center px-6">
            <Link href="/">
                <span className="text-2xl font-bold text-primary tracking-tight">skillPeak</span>
            </Link>
            
            <div className="flex items-center gap-4">
                {session ? (
                    <>
                        <span className="text-sm font-medium text-muted-foreground">
                            Welcome, {session.user.userName || session.user.email}
                        </span>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => signOut()}
                        >
                            Sign out
                        </Button>
                    </>
                ) : (
                    <Link href="/sign-in">
                        <Button variant="default" size="sm">
                            Sign in
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    </nav>
  )
}

export default Navbar
