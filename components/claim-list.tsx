"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import type { StoredClaim } from "@/lib/api"

interface ClaimListProps {
  claims: StoredClaim[]
  selectedClaim: number
  setSelectedClaim: (index: number) => void
}

export function ClaimList({ claims, selectedClaim, setSelectedClaim }: ClaimListProps) {

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6 animate-fade-in">
        <h2 className="text-xl font-bold text-foreground mb-2">Extracted Claims</h2>
        <p className="text-sm text-muted-foreground">Showing {claims.length} claim{claims.length !== 1 ? "s" : ""}</p>
      </div>

      {claims.map((claim, index) => (
        <Card
          key={claim.id}
          className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in ${
            selectedClaim === index ? "ring-2 ring-primary shadow-lg" : ""
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => setSelectedClaim(index)}
        >
          <div className="space-y-3">
            <p className="text-sm text-card-foreground line-clamp-3">{claim.text}</p>
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" />
              {claim.sourceTextId}
            </Badge>
            <Badge variant="outline" className="border">
              {(claim.confidence * 100).toFixed(1)}%
            </Badge>
            {claim.claim_type ? <Badge variant="outline">{claim.claim_type}</Badge> : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
