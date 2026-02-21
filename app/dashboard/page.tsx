"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClaimList } from "@/components/claim-list"
import { AnalysisPanel } from "@/components/analysis-panel"
import { RightPanel } from "@/components/right-panel"
import { Shield } from "lucide-react"
import type { StoredClaim } from "@/lib/api"

export default function DashboardPage() {
  const [claims, setClaims] = useState<StoredClaim[]>([])
  const [selectedClaim, setSelectedClaim] = useState(0)

  useEffect(() => {
    const serialized = sessionStorage.getItem("falsifynot.claims")
    if (!serialized) {
      setClaims([])
      return
    }

    try {
      const parsed = JSON.parse(serialized)
      if (Array.isArray(parsed)) {
        setClaims(parsed as StoredClaim[])
      }
    } catch {
      setClaims([])
    }
  }, [])

  useEffect(() => {
    if (selectedClaim > 0 && selectedClaim >= claims.length) {
      setSelectedClaim(0)
    }
  }, [claims, selectedClaim])

  const currentClaim = claims[selectedClaim]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">FalsifyNot</h1>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Dashboard Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Claims List */}
        <aside className="w-80 border-r border-border bg-card/30 overflow-y-auto">
          <ClaimList claims={claims} selectedClaim={selectedClaim} setSelectedClaim={setSelectedClaim} />
        </aside>

        {/* Center Panel - Analysis */}
        <main className="flex-1 overflow-y-auto">
          <AnalysisPanel claim={currentClaim} claimIndex={selectedClaim} />
        </main>

        {/* Right Panel - Tabs */}
        <aside className="w-96 border-l border-border bg-card/30 overflow-y-auto">
          <RightPanel claimIndex={selectedClaim} claimData={{ hasMedia: false, hasVideo: false, hasAudio: false, hasOCR: false }} />
        </aside>
      </div>
    </div>
  )
}
