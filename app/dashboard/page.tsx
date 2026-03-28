"use client"

import { useEffect, useState } from "react"
import { ClaimList } from "@/components/claim-list"
import { AnalysisPanel } from "@/components/analysis-panel"
import type { StoredClaim } from "@/lib/api"

export default function DashboardPage() {
  const [claims, setClaims] = useState<StoredClaim[]>([])
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [sourceTypeFilters, setSourceTypeFilters] = useState<string[]>([])
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([])

  useEffect(() => {
    const serialized = sessionStorage.getItem("falsifynot.claims")
    if (!serialized) {
      setClaims([])
      return
    }

    try {
      const parsed = JSON.parse(serialized)
      if (Array.isArray(parsed)) {
        const loadedClaims = parsed as StoredClaim[]
        setClaims(loadedClaims)
        setSelectedClaimId(loadedClaims[0]?.id ?? null)
      }
    } catch {
      setClaims([])
    }
  }, [])

  const filteredClaims = claims.filter((claim) => {
    const sourceTags = getSourceTypeTokens(claim)
    const fileTag = normalizeFileTag(claim.sourceFileExtension || claim.input_source?.source_extension || "")

    if (sourceTypeFilters.length > 0 && !sourceTypeFilters.some((tag) => sourceTags.includes(tag))) {
      return false
    }

    if (fileTypeFilters.length > 0 && !fileTypeFilters.includes(fileTag)) {
      return false
    }

    return true
  })

  useEffect(() => {
    if (filteredClaims.length === 0) {
      setSelectedClaimId(null)
      return
    }

    if (!selectedClaimId || !filteredClaims.some((claim) => claim.id === selectedClaimId)) {
      setSelectedClaimId(filteredClaims[0].id)
    }
  }, [filteredClaims, selectedClaimId])

  const selectedClaimIndex = filteredClaims.findIndex((claim) => claim.id === selectedClaimId)
  const currentClaim = selectedClaimIndex >= 0 ? filteredClaims[selectedClaimIndex] : undefined

  const toggleSourceType = (tag: string) => {
    setSourceTypeFilters((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const toggleFileType = (tag: string) => {
    setFileTypeFilters((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const clearFilters = () => {
    setSourceTypeFilters([])
    setFileTypeFilters([])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Claims List */}
        <aside className="w-80 border-r border-border bg-card/30 overflow-y-auto">
          <ClaimList
            claims={filteredClaims}
            allClaims={claims}
            totalClaims={claims.length}
            selectedClaimId={selectedClaimId}
            setSelectedClaimId={setSelectedClaimId}
            sourceTypeFilters={sourceTypeFilters}
            fileTypeFilters={fileTypeFilters}
            onToggleSourceType={toggleSourceType}
            onToggleFileType={toggleFileType}
            onClearFilters={clearFilters}
          />
        </aside>

        {/* Center Panel - Analysis + Evidence/Explainability Sections */}
        <main className="flex-1 overflow-y-auto">
          <AnalysisPanel claim={currentClaim} claimIndex={selectedClaimIndex >= 0 ? selectedClaimIndex : 0} />
        </main>
      </div>
    </div>
  )
}

function getSourceTypeTokens(claim: StoredClaim): string[] {
  const tokens = (claim.input_source?.source_type || "")
    .split("+")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)

  if (claim.sourceInputKind && !tokens.includes(claim.sourceInputKind)) {
    tokens.unshift(claim.sourceInputKind)
  }

  return Array.from(new Set(tokens))
}

function normalizeFileTag(tag: string): string {
  return tag.replace(/^\./, "").trim().toLowerCase()
}
