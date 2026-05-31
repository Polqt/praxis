'use client'

import { createContext, useContext, useState } from 'react'
import type { User } from '@praxis/shared'

interface UserContextValue {
  user: User
  setUsername: (username: string) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  user: initialUser,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User>(initialUser)

  function setUsername(username: string) {
    setUser((prev) => ({ ...prev, username }))
  }

  return (
    <UserContext.Provider value={{ user, setUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): User {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx.user
}

export function useSetUsername(): (username: string) => void {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useSetUsername must be used within UserProvider')
  return ctx.setUsername
}
