"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react"

interface VerdictCardProps {
  verdict: string
  confidence: number
}

export function VerdictCard({ verdict, confidence }: VerdictCardProps) {
  const getVerdictConfig = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case "supported":
      case "supports":
        return {
          icon: CheckCircle2,
          label: "Supported",
          color: "text-chart-4",
          bg: "bg-chart-4/10",
          border: "border-chart-4/50",
        }
      case "refuted":
      case "refutes":
        return {
          icon: XCircle,
          label: "Refuted",
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/50",
        }
      case "mixed":
      case "neutral":
        return {
          icon: AlertCircle,
          label: "Neutral / Mixed",
          color: "text-chart-5",
          bg: "bg-chart-5/10",
          border: "border-chart-5/50",
        }
      default:
        return {
          icon: HelpCircle,
          label: "Unverified",
          color: "text-muted-foreground",
          bg: "bg-muted/10",
          border: "border-muted/50",
        }
    }
  }

  const config = getVerdictConfig(verdict)
  const Icon = config.icon

  return (
    <Card
      className={`p-8 ${config.bg} border-2 ${config.border} transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
    >
      <div className="flex items-center gap-6">
        <div
          className={`h-16 w-16 rounded-full ${config.bg} flex items-center justify-center transition-all duration-300 hover:scale-110`}
        >
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Verdict</p>
          <h3 className={`text-3xl font-bold ${config.color}`}>{config.label}</h3>
        </div>
      </div>
    </Card>
  )
}
