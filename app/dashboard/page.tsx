"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClaimList, mockClaims } from "@/components/claim-list"
import { AnalysisPanel } from "@/components/analysis-panel"
import { RightPanel } from "@/components/right-panel"
import { Shield, Files, FileText, ImageIcon, Video, Mic } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockUploadedFiles = [
  { id: "file-1", name: "climate-article.pdf", type: "text", claimIds: [1, 4] },
  { id: "file-2", name: "food-myths.txt", type: "text", claimIds: [2] },
  { id: "file-3", name: "space-documentary.mp4", type: "video", claimIds: [3] },
  { id: "file-4", name: "health-podcast.mp3", type: "audio", claimIds: [5] },
]

export default function DashboardPage() {
  const [selectedClaim, setSelectedClaim] = useState(0)
  const [selectedFile, setSelectedFile] = useState<string>("all")

  const filteredClaims =
    selectedFile === "all" ? mockClaims : mockClaims.filter((claim) => claim.fileId === selectedFile)
  const currentClaim = filteredClaims[selectedClaim]

  const getFileIcon = (type: string) => {
    switch (type) {
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
          <div className="p-4 border-b border-border sticky top-0 bg-card/80 backdrop-blur-sm z-10">
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger className="w-full transition-all duration-300 hover:border-primary">
                <SelectValue placeholder="Select file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Files className="h-4 w-4" />
                    <span>All Files</span>
                  </div>
                </SelectItem>
                {mockUploadedFiles.map((file) => {
                  const Icon = getFileIcon(file.type)
                  return (
                    <SelectItem key={file.id} value={file.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <ClaimList selectedClaim={selectedClaim} setSelectedClaim={setSelectedClaim} selectedFile={selectedFile} />
        </aside>

        {/* Center Panel - Analysis */}
        <main className="flex-1 overflow-y-auto">
          <AnalysisPanel claimIndex={selectedClaim} />
        </main>

        {/* Right Panel - Tabs */}
        <aside className="w-96 border-l border-border bg-card/30 overflow-y-auto">
          <RightPanel claimIndex={selectedClaim} claimData={currentClaim} />
        </aside>
      </div>
    </div>
  )
}
