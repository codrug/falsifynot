"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { FileText, ImageIcon, Video, Mic } from "lucide-react"

const mockClaims = [
  {
    id: 1,
    text: "Climate change is causing increased hurricane activity in the Atlantic Ocean",
    modalities: ["text", "image"],
    verdict: "supported",
    fileId: "file-1",
    hasMedia: true,
    hasVideo: false,
    hasAudio: false,
    hasOCR: false,
  },
  {
    id: 2,
    text: "Eating carrots improves night vision significantly",
    modalities: ["text"],
    verdict: "refuted",
    fileId: "file-2",
    hasMedia: false,
    hasVideo: false,
    hasAudio: false,
    hasOCR: false,
  },
  {
    id: 3,
    text: "The Great Wall of China is visible from space",
    modalities: ["text", "image", "video"],
    verdict: "mixed",
    fileId: "file-3",
    hasMedia: true,
    hasVideo: true,
    hasAudio: false,
    hasOCR: true, // Video with text overlay
  },
  {
    id: 4,
    text: "Coffee consumption reduces risk of type 2 diabetes",
    modalities: ["text"],
    verdict: "supported",
    fileId: "file-1",
    hasMedia: false,
    hasVideo: false,
    hasAudio: false,
    hasOCR: false,
  },
  {
    id: 5,
    text: "5G networks cause health problems in humans",
    modalities: ["text", "audio"],
    verdict: "refuted",
    fileId: "file-4",
    hasMedia: false,
    hasVideo: false,
    hasAudio: true,
    hasOCR: false,
  },
]

interface ClaimListProps {
  selectedClaim: number
  setSelectedClaim: (index: number) => void
  selectedFile: string
}

export function ClaimList({ selectedClaim, setSelectedClaim, selectedFile }: ClaimListProps) {
  const filteredClaims =
    selectedFile === "all" ? mockClaims : mockClaims.filter((claim) => claim.fileId === selectedFile)

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case "text":
        return FileText
      case "image":
        return ImageIcon
      case "video":
        return Video
      case "audio":
        return Mic
      default:
        return FileText
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "supported":
        return "bg-chart-4/20 text-chart-4 border-chart-4/50"
      case "refuted":
        return "bg-destructive/20 text-destructive border-destructive/50"
      case "mixed":
        return "bg-chart-5/20 text-chart-5 border-chart-5/50"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/50"
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6 animate-fade-in">
        <h2 className="text-xl font-bold text-foreground mb-2">Extracted Claims</h2>
        <p className="text-sm text-muted-foreground">
          {selectedFile === "all"
            ? `Showing all ${filteredClaims.length} claims`
            : `Showing ${filteredClaims.length} claim${filteredClaims.length !== 1 ? "s" : ""} from selected file`}
        </p>
      </div>

      {filteredClaims.map((claim, index) => (
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
            <div className="flex items-center gap-2 flex-wrap">
              {claim.modalities.map((modality, idx) => {
                const Icon = getModalityIcon(modality)
                return (
                  <Badge key={idx} variant="secondary" className="gap-1 transition-all duration-300 hover:scale-110">
                    <Icon className="h-3 w-3" />
                    {modality}
                  </Badge>
                )
              })}
            </div>
            <Badge className={`${getVerdictColor(claim.verdict)} border capitalize`}>{claim.verdict}</Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}

export { mockClaims }
