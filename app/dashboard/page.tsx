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
