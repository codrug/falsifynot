"use client"

import { useEffect, useState } from "react"
import { ClaimList } from "@/components/claim-list"
import { AnalysisPanel } from "@/components/analysis-panel"
import type { InputProcessingSummary, StoredClaim } from "@/lib/api"

interface StoredInputItem {
  id: string
  content: string
  label?: string
  sourceKind?: string
  sourceExtension?: string | null
  previewDataUrl?: string | null
}

interface StoredAnalysisItem {
  textId: string
  claims?: unknown[]
  error?: string | null
  processingMeta?: {
    source_type?: string
    video_id?: string
    transcript_status?: string
    fallback_used?: string | null
    reason?: string | null
  } | null
}

export default function DashboardPage() {
  const [claims, setClaims] = useState<StoredClaim[]>([])
  const [inputSummaries, setInputSummaries] = useState<InputProcessingSummary[]>([])
  const [inputPreviewById, setInputPreviewById] = useState<Record<string, string>>({})
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [sourceTypeFilters, setSourceTypeFilters] = useState<string[]>([])
  const [fileTypeFilters, setFileTypeFilters] = useState<string[]>([])

  useEffect(() => {
    const serialized = sessionStorage.getItem("falsifynot.claims")
    const serializedInputs = sessionStorage.getItem("falsifynot.inputTexts")
    const serializedAnalyses = sessionStorage.getItem("falsifynot.analyses")

    setInputSummaries(buildInputSummaries(serializedInputs, serializedAnalyses))
    setInputPreviewById(buildInputPreviewMap(serializedInputs))

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
  const currentClaimWithPreview = currentClaim
    ? {
        ...currentClaim,
        sourcePreviewUrl:
          currentClaim.sourcePreviewUrl ||
          inputPreviewById[currentClaim.sourceTextId] ||
          null,
      }
    : undefined

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
            inputSummaries={inputSummaries}
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
          <AnalysisPanel claim={currentClaimWithPreview} claimIndex={selectedClaimIndex >= 0 ? selectedClaimIndex : 0} />
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

function buildInputSummaries(
  serializedInputs: string | null,
  serializedAnalyses: string | null,
): InputProcessingSummary[] {
  if (!serializedInputs) {
    return []
  }

  try {
    const parsedInputs = JSON.parse(serializedInputs)
    const parsedAnalyses = serializedAnalyses ? JSON.parse(serializedAnalyses) : []

    if (!Array.isArray(parsedInputs)) {
      return []
    }

    const analysisById = new Map<string, StoredAnalysisItem>()
    if (Array.isArray(parsedAnalyses)) {
      for (const analysis of parsedAnalyses as StoredAnalysisItem[]) {
        if (analysis?.textId) {
          analysisById.set(analysis.textId, analysis)
        }
      }
    }

    return (parsedInputs as StoredInputItem[]).map((input) => {
      const analysis = analysisById.get(input.id)
      const claimsCount = Array.isArray(analysis?.claims) ? analysis.claims.length : 0
      const errorMessage = typeof analysis?.error === "string" && analysis.error.trim() ? analysis.error.trim() : ""
      const reasonMessage = buildProcessingReason(input, analysis)

      let status: InputProcessingSummary["status"] = "missing"
      if (errorMessage) {
        status = "error"
      } else if (analysis) {
        status = claimsCount > 0 ? "claims" : "no-claims"
      }

      return {
        id: input.id,
        label: input.label || `Input ${input.id.slice(0, 8)}`,
        sourceKind: (input.sourceKind || "text").toString(),
        sourceExtension: (input.sourceExtension || "").toString(),
        claimsCount,
        status,
        errorMessage: errorMessage || undefined,
        reasonMessage,
      }
    })
  } catch {
    return []
  }
}

function buildProcessingReason(input: StoredInputItem, analysis?: StoredAnalysisItem): string | undefined {
  if (!analysis) {
    return undefined
  }

  if (typeof analysis.error === "string" && analysis.error.trim()) {
    return analysis.error.trim()
  }

  const meta = analysis.processingMeta
  if ((input.sourceKind || "").toLowerCase() !== "url" || !meta) {
    return undefined
  }

  const transcriptStatus = (meta.transcript_status || "").toLowerCase()
  const fallbackUsed = (meta.fallback_used || "").toLowerCase()
  const reason = (meta.reason || "").trim()

  if (fallbackUsed === "title") {
    if (transcriptStatus && transcriptStatus !== "ok") {
      return `Transcript unavailable (${transcriptStatus}); title fallback used.`
    }
    return "Transcript unavailable; title fallback used."
  }

  if (transcriptStatus && transcriptStatus !== "ok") {
    return reason ? `Transcript ${transcriptStatus}: ${reason}` : `Transcript ${transcriptStatus}.`
  }

  return undefined
}

function buildInputPreviewMap(serializedInputs: string | null): Record<string, string> {
  if (!serializedInputs) {
    return {}
  }

  try {
    const parsedInputs = JSON.parse(serializedInputs)
    if (!Array.isArray(parsedInputs)) {
      return {}
    }

    return (parsedInputs as StoredInputItem[]).reduce<Record<string, string>>((acc, input) => {
      if (input?.id && typeof input.previewDataUrl === "string" && input.previewDataUrl.trim()) {
        acc[input.id] = input.previewDataUrl
      }
      return acc
    }, {})
  } catch {
    return {}
  }
}
