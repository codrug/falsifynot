"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UploadPanel } from "@/components/upload-panel"
import { ArrowRight } from "lucide-react"
import { analyzeContent, API_BASE_URL, type StoredClaim, type TextAnalysis } from "@/lib/api"

interface TextItem {
  id: string
  content: string
}

interface UrlItem {
  id: string
  url: string
}

type InputKind = "text" | "url" | "file" | "image"

interface AnalyzeInput {
  id: string
  content: string
  label: string
  sourceKind: InputKind
  sourceExtension?: string | null
  imageFile?: File | null
}

const LOADING_STAGES = [
  "Initialization",
  "Preparing content",
  "Extracting claims",
  "Retrieving evidence",
  "Analyzing verdicts",
]

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [urlItems, setUrlItems] = useState<UrlItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearLoadingInterval = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current)
      loadingIntervalRef.current = null
    }
  }

  const startLoadingStages = () => {
    clearLoadingInterval()
    setLoadingStage(0)
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStage((current) => (current < LOADING_STAGES.length - 1 ? current + 1 : current))
    }, 1400)
  }

  useEffect(() => {
    return () => clearLoadingInterval()
  }, [])

  const parseInputsFromFiles = async (inputFiles: File[]) => {
    const textInputs: AnalyzeInput[] = []
    const imageInputs: AnalyzeInput[] = []
    let skippedCount = 0

    for (const file of inputFiles) {
      const extension = getFileExtension(file.name)
      const isText = file.type === "text/plain" || extension === "txt"
      const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png"].includes(extension)

      if (isText) {
        const content = (await file.text()).trim()
        if (content) {
          textInputs.push({
            id: crypto.randomUUID(),
            content,
            label: file.name,
            sourceKind: "file",
            sourceExtension: extension,
          })
        }
        continue
      }

      if (isImage) {
        imageInputs.push({
          id: crypto.randomUUID(),
          content: "",
          label: file.name,
          sourceKind: "image",
          sourceExtension: extension,
          imageFile: file,
        })
        continue
      }

      skippedCount += 1
    }

    return {
      textInputs,
      imageInputs,
      skippedCount,
    }
  }

  const handleAnalyze = async () => {
    const trimmedTextInputs: AnalyzeInput[] = textItems
      .map((item) => ({
        id: item.id,
        content: item.content.trim(),
        label: `Pasted text ${item.id.slice(0, 8)}`,
        sourceKind: "text" as const,
      }))
      .filter((item) => item.content)

    const { textInputs: fileTextInputs, imageInputs, skippedCount } = await parseInputsFromFiles(files)

    const formattedUrlInputs: AnalyzeInput[] = urlItems
      .map((item) => ({
        id: item.id,
        content: item.url.trim(),
        label: item.url.trim(),
        sourceKind: "url" as const,
      }))
      .filter((item) => item.content)

    const inputsToAnalyze = [...trimmedTextInputs, ...fileTextInputs, ...formattedUrlInputs, ...imageInputs]

    if (inputsToAnalyze.length === 0) {
      const message = skippedCount > 0
        ? "Only .txt and .jpg/.jpeg/.png files can be analyzed right now. Add text, URLs, or supported files."
        : "Add at least one text item, URL, .txt file, or image to analyze."
      setErrorMessage(message)
      return
    }

    setIsAnalyzing(true)
    setErrorMessage(null)
    startLoadingStages()

    try {
      const analyses: TextAnalysis[] = await Promise.all(
        inputsToAnalyze.map(async (item) => {
          const result = await analyzeContent(item.content, item.imageFile ?? null, {
            sourceName: item.label,
            sourceExtension: item.sourceExtension || undefined,
          })
          return {
            textId: item.id,
            inputText: item.content,
            claims: result.claims,
          }
        }),
      )

      const flattenedClaims: StoredClaim[] = analyses.flatMap((analysis) =>
        analysis.claims.map((claim) => {
          const input = inputsToAnalyze.find((item) => item.id === analysis.textId)
          return {
            ...claim,
            sourceTextId: analysis.textId,
            sourceText: analysis.inputText,
            sourceInputKind: input?.sourceKind,
            sourceInputLabel: input?.label,
            sourceFileExtension: input?.sourceExtension ?? null,
          }
        }),
      )

      sessionStorage.setItem("falsifynot.inputTexts", JSON.stringify(inputsToAnalyze))
      sessionStorage.setItem("falsifynot.analyses", JSON.stringify(analyses))
      sessionStorage.setItem("falsifynot.claims", JSON.stringify(flattenedClaims))
      router.push("/dashboard")
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorMessage(`Failed to reach the API at ${API_BASE_URL}. Is the backend running?`)
        return
      }

      const message = error instanceof Error ? error.message : "Failed to analyze content"
      setErrorMessage(message)
    } finally {
      clearLoadingInterval()
      setIsAnalyzing(false)
    }
  }

  const hasContent = files.length > 0 || textItems.length > 0 || urlItems.length > 0
  const imageFiles = files.filter((file) => isImageFile(file))
  const nonImageFiles = files.filter((file) => !isImageFile(file))

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8">
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Upload Content for Verification</h2>
              <p className="text-lg text-muted-foreground">
                Upload files or images, paste text, or add URLs to analyze for misinformation
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

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div
                className="bg-card border border-border rounded-lg p-6 shadow-lg animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <h3 className="text-xl font-bold text-card-foreground mb-4">Content Queue</h3>

                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                  {!hasContent && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No content added yet. Upload files, paste text, or add URLs to get started.
                    </p>
                  )}

                  {imageFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Images ({imageFiles.length})
                      </h4>
                      {imageFiles.map((imageFile, index) => (
                        <div
                          key={`${imageFile.name}-${index}`}
                          className="text-sm p-2 rounded bg-primary/10 border border-primary/20 truncate transition-all duration-300 hover:bg-primary/15"
                        >
                          {imageFile.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {nonImageFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Files ({nonImageFiles.length})
                      </h4>
                      {nonImageFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
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

      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card/95 p-8 shadow-2xl space-y-6 animate-fade-in-up">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold text-card-foreground">Analyzing Your Content</h3>
              <p className="text-sm text-muted-foreground">Dynamic pipeline loading from initialization to analysis</p>
            </div>

            <div className="rounded-xl overflow-hidden border border-primary/20 bg-muted/30">
              <img
                src="/analysis-loader.gif"
                alt="Analysis loading animation"
                className="w-full h-44 object-cover"
              />
            </div>

            <div className="space-y-3">
              {LOADING_STAGES.map((stage, index) => {
                const active = index === loadingStage
                const complete = index < loadingStage
                return (
                  <div key={stage} className="flex items-center justify-between text-sm">
                    <span className={complete || active ? "text-card-foreground font-medium" : "text-muted-foreground"}>
                      {stage}
                    </span>
                    <span className={complete ? "text-primary" : active ? "text-chart-4" : "text-muted-foreground"}>
                      {complete ? "Done" : active ? "In progress" : "Pending"}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name)
}

function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".")
  if (index < 0 || index === fileName.length - 1) {
    return ""
  }
  return fileName.slice(index + 1).toLowerCase()
}
