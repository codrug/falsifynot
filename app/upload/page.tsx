"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UploadPanel } from "@/components/upload-panel"
import { Shield, ArrowRight } from "lucide-react"
import { analyzeText, type StoredClaim, type TextAnalysis } from "@/lib/api"

interface TextItem {
  id: string
  content: string
}

interface UrlItem {
  id: string
  url: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [urlItems, setUrlItems] = useState<UrlItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAnalyze = async () => {
    const validTextItems = textItems.map((item) => ({ ...item, content: item.content.trim() })).filter((item) => item.content)
    if (validTextItems.length === 0) {
      setErrorMessage("Add at least one text item to analyze.")
      return
    }

    setIsAnalyzing(true)
    setErrorMessage(null)
    try {
      const analyses: TextAnalysis[] = []

      for (const item of validTextItems) {
        const result = await analyzeText(item.content)
        analyses.push({
          textId: item.id,
          inputText: item.content,
          claims: result.claims,
        })
      }

      const flattenedClaims: StoredClaim[] = analyses.flatMap((analysis) =>
        analysis.claims.map((claim) => ({
          ...claim,
          sourceTextId: analysis.textId,
          sourceText: analysis.inputText,
        })),
      )

      sessionStorage.setItem("falsifynot.inputTexts", JSON.stringify(validTextItems))
      sessionStorage.setItem("falsifynot.analyses", JSON.stringify(analyses))
      sessionStorage.setItem("falsifynot.claims", JSON.stringify(flattenedClaims))
      router.push("/dashboard")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze content"
      setErrorMessage(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const hasContent = files.length > 0 || textItems.length > 0 || urlItems.length > 0

  return (
    <div className="min-h-screen bg-background">

      {/* Main Content - Added two-column layout with fixed right panel */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8">
          {/* Left Column - Upload Forms */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Upload Content for Verification</h2>
              <p className="text-lg text-muted-foreground">
                Upload files, paste text, or provide URLs to analyze for misinformation
              </p>
            </div>

            <UploadPanel
              files={files}
              setFiles={setFiles}
              textItems={textItems}
              setTextItems={setTextItems}
              urlItems={urlItems}
              setUrlItems={setUrlItems}
            />

            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Button
                size="lg"
                className="px-12 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={handleAnalyze}
                disabled={!hasContent || isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Content"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
          </div>

          {/* Right Column - Fixed sidebar showing all uploaded content */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div
                className="bg-card border border-border rounded-lg p-6 shadow-lg animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Content Queue
                </h3>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                  {!hasContent && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No content added yet. Upload files, paste text, or add URLs to get started.
                    </p>
                  )}

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Files ({files.length})
                      </h4>
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="text-sm p-2 rounded bg-muted/50 truncate transition-all duration-300 hover:bg-muted"
                        >
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {textItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Text ({textItems.length})
                      </h4>
                      {textItems.map((item) => (
                        <div
                          key={item.id}
                          className="text-sm p-2 rounded bg-muted/50 line-clamp-2 transition-all duration-300 hover:bg-muted"
                        >
                          {item.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {urlItems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        URLs ({urlItems.length})
                      </h4>
                      {urlItems.map((item) => (
                        <div
                          key={item.id}
                          className="text-sm p-2 rounded bg-muted/50 truncate transition-all duration-300 hover:bg-muted"
                        >
                          {item.url}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
