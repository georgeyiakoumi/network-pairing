'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Handshake } from 'lucide-react'

export function HeaderNavIcon({ connectionCount }: { connectionCount: number }) {
  const pathname = usePathname()
  const isConnections = pathname === '/connections'

  if (isConnections) {
    return (
      <Link href="/match" className="justify-self-start" aria-label="Matches">
        <Handshake className="size-5 text-muted-foreground" />
      </Link>
    )
  }

  return (
    <Link href="/connections" className="relative justify-self-start" aria-label={`Connections (${connectionCount})`}>
      <Users className="size-5 text-muted-foreground" />
      {connectionCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
          {connectionCount}
        </span>
      )}
    </Link>
  )
}
