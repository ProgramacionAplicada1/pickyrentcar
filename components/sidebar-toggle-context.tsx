"use client"

import * as React from "react"

type SidebarCtx = {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

const SidebarContext = React.createContext<SidebarCtx | null>(null)

export function SidebarToggleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(true)

  const value = React.useMemo<SidebarCtx>(
    () => ({
      isOpen,
      toggle: () => setIsOpen((v) => !v),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebarToggle(): SidebarCtx {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) {
    throw new Error("useSidebarToggle must be used within SidebarToggleProvider")
  }
  return ctx
}
