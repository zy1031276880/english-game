"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
