"use client"
import { SessionProvider, useSession } from 'next-auth/react';
import React from 'react'

function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
        <SessionProvider>
            {children}
        </SessionProvider>
    </div>
  )
}

export default AuthProvider
