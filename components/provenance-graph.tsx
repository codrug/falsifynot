"use client"

import { Card } from "@/components/ui/card"
import { GitFork } from "lucide-react"

export function ProvenanceGraphPlaceholder() {
  return (
    <Card className="p-10 min-h-96 flex flex-col items-center justify-center space-y-6 bg-muted/30 transition-all duration-300 hover:shadow-lg animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
        <GitFork className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center space-y-3">
        <h4 className="font-semibold text-lg text-card-foreground">Provenance Graph</h4>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Interactive network visualization showing content origin, modifications, and distribution paths
        </p>
      </div>
      <svg className="w-full h-64 opacity-20 mt-4" viewBox="0 0 400 300">
        <circle cx="200" cy="150" r="20" fill="currentColor" className="text-primary animate-pulse" />
        <circle cx="100" cy="80" r="15" fill="currentColor" className="text-accent" />
        <circle cx="300" cy="80" r="15" fill="currentColor" className="text-accent" />
        <circle cx="100" cy="220" r="15" fill="currentColor" className="text-accent" />
        <circle cx="300" cy="220" r="15" fill="currentColor" className="text-accent" />
        <line x1="200" y1="150" x2="100" y2="80" stroke="currentColor" strokeWidth="2" className="text-border" />
        <line x1="200" y1="150" x2="300" y2="80" stroke="currentColor" strokeWidth="2" className="text-border" />
        <line x1="200" y1="150" x2="100" y2="220" stroke="currentColor" strokeWidth="2" className="text-border" />
        <line x1="200" y1="150" x2="300" y2="220" stroke="currentColor" strokeWidth="2" className="text-border" />
      </svg>
    </Card>
  )
}
