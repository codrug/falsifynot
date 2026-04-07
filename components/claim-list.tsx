"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { InputProcessingSummary, StoredClaim } from "@/lib/api"

interface ClaimListProps {
  claims: StoredClaim[]
  allClaims: StoredClaim[]
  totalClaims: number
  inputSummaries: InputProcessingSummary[]
  selectedClaimId: string | null
  setSelectedClaimId: (claimId: string) => void
  sourceTypeFilters: string[]
  fileTypeFilters: string[]
  onToggleSourceType: (tag: string) => void
  onToggleFileType: (tag: string) => void
  onClearFilters: () => void
}

export function ClaimList({
  claims,
  allClaims,
  totalClaims,
  inputSummaries,
  selectedClaimId,
  setSelectedClaimId,
  sourceTypeFilters,
  fileTypeFilters,
  onToggleSourceType,
  onToggleFileType,
  onClearFilters,
}: ClaimListProps) {
  const sourceTypeOptions = Array.from(
    new Set(
      allClaims.flatMap((claim) => getSourceTypeTokens(claim)).filter(Boolean),
    ),
  ).sort()

  const fileTypeOptions = Array.from(
    new Set(
      allClaims
        .map((claim) => normalizeFileTag(claim.sourceFileExtension || claim.input_source?.source_extension || ""))
        .filter(Boolean),
    ),
  ).sort()

  const hasActiveFilters = sourceTypeFilters.length > 0 || fileTypeFilters.length > 0

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6 animate-fade-in">
        <h2 className="text-xl font-bold text-foreground mb-2">Extracted Claims</h2>
        <p className="text-sm text-muted-foreground">
          Showing {claims.length} of {totalClaims} claim{totalClaims !== 1 ? "s" : ""}
        </p>
      </div>

      {inputSummaries.length > 0 && (
        <Card className="p-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Processed inputs</p>
            <Badge variant="secondary">{inputSummaries.length}</Badge>
          </div>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
            {inputSummaries.map((summary) => (
              <div key={summary.id} className="rounded-md border border-border/60 px-2 py-2 space-y-1 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-card-foreground truncate">{summary.label}</p>
                  <Badge variant={getSummaryVariant(summary.status)} className="text-[10px] uppercase">
                    {getSummaryLabel(summary.status)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {labelSourceTag(summary.sourceKind)}
                  </Badge>
                  {normalizeFileTag(summary.sourceExtension) && (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      .{normalizeFileTag(summary.sourceExtension)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {summary.claimsCount} claim{summary.claimsCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {summary.errorMessage ? <p className="text-[10px] text-destructive line-clamp-2">{summary.errorMessage}</p> : null}
                {!summary.errorMessage && summary.reasonMessage ? (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{summary.reasonMessage}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      )}

      {(sourceTypeOptions.length > 0 || fileTypeOptions.length > 0) && (
        <Card className="p-3 space-y-3 animate-fade-in">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter by source type</p>
            <div className="flex flex-wrap gap-2">
              {sourceTypeOptions.map((tag) => {
                const isActive = sourceTypeFilters.includes(tag)
                return (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => onToggleSourceType(tag)}
                  >
                    {labelSourceTag(tag)}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter by file type</p>
            <div className="flex flex-wrap gap-2">
              {fileTypeOptions.length === 0 && (
                <span className="text-xs text-muted-foreground">No file extension tags available</span>
              )}
              {fileTypeOptions.map((tag) => {
                const isActive = fileTypeFilters.includes(tag)
                return (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="h-7 px-2 text-xs uppercase"
                    onClick={() => onToggleFileType(tag)}
                  >
                    .{tag}
                  </Button>
                )
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </Card>
      )}

      {claims.length === 0 && (
        <Card className="p-4 text-sm text-muted-foreground">No claims match the current filters.</Card>
      )}

      {claims.map((claim, index) => (
        <Card
          key={claim.id}
          className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in ${
            selectedClaimId === claim.id ? "ring-2 ring-primary shadow-lg" : ""
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => setSelectedClaimId(claim.id)}
        >
          <div className="space-y-3">
            <p className="text-sm text-card-foreground line-clamp-3">{claim.text}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{claim.sourceInputLabel || claim.sourceTextId}</Badge>
              {getSourceTypeTokens(claim).map((tag) => (
                <Badge key={`${claim.id}-${tag}`} variant="outline">
                  {labelSourceTag(tag)}
                </Badge>
              ))}
              {normalizeFileTag(claim.sourceFileExtension || claim.input_source?.source_extension || "") && (
                <Badge variant="outline" className="uppercase">
                  .{normalizeFileTag(claim.sourceFileExtension || claim.input_source?.source_extension || "")}
                </Badge>
              )}
              <Badge variant="outline" className="border">
                {(claim.confidence * 100).toFixed(1)}%
              </Badge>
              {claim.claim_type ? <Badge variant="outline">{claim.claim_type}</Badge> : null}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function getSourceTypeTokens(claim: StoredClaim): string[] {
  const fromInput = claim.sourceInputKind
  const fromBackend = claim.input_source?.source_type || ""
  const composite = fromBackend
    .split("+")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)

  if (fromInput && !composite.includes(fromInput)) {
    composite.unshift(fromInput)
  }

  return Array.from(new Set(composite))
}

function labelSourceTag(tag: string): string {
  const normalized = tag.toLowerCase()
  if (normalized === "url") return "URL"
  if (normalized === "web") return "Web"
  if (normalized === "video") return "Video"
  if (normalized === "image") return "Image"
  if (normalized === "file") return "File"
  if (normalized === "text") return "Text"
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

function normalizeFileTag(tag: string): string {
  return tag.replace(/^\./, "").trim().toLowerCase()
}

function getSummaryLabel(status: InputProcessingSummary["status"]): string {
  if (status === "claims") return "Claims"
  if (status === "no-claims") return "No claims"
  if (status === "error") return "Failed"
  return "Not found"
}

function getSummaryVariant(status: InputProcessingSummary["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "claims") return "default"
  if (status === "no-claims") return "secondary"
  if (status === "error") return "destructive"
  return "outline"
}
