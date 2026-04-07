"use client"

import Link from "next/link"
import { Shield, Upload, LayoutDashboard, BookOpen, Code2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 animate-fade-in hover:opacity-80 transition-opacity">
          <Shield className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold text-foreground">FalsifyNot</h1>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/upload"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </Link>
          <Link
            href="/api-access"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
