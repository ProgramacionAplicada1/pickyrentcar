"use client"

import * as React from "react"
import Link from "next/link"

type Props = {
  href: string
  children: React.ReactNode
  className?: string
}

export function ScrollToSection({ href, children, className }: Props) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!href.startsWith("#")) return

    e.preventDefault()
    const id = href.slice(1)
    const el = document.getElementById(id)
    if (!el) return

    const stickyHeader = document.querySelector(
      "header.sticky",
    ) as HTMLElement | null
    const headerOffset = stickyHeader?.offsetHeight ?? 0
    const top =
      el.getBoundingClientRect().top + window.scrollY - headerOffset

    window.scrollTo({ top, behavior: "smooth" })
    history.replaceState(null, "", href)
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}