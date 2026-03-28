"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Upload, X, Plus } from "lucide-react"

interface TextItem {
  id: string
  content: string
}

interface UrlItem {
  id: string
  url: string
}

interface UploadPanelProps {
  files: File[]
  setFiles: (files: File[]) => void
  textItems: TextItem[]
  setTextItems: (items: TextItem[]) => void
  urlItems: UrlItem[]
  setUrlItems: (items: UrlItem[]) => void
}

export function UploadPanel({ files, setFiles, textItems, setTextItems, urlItems, setUrlItems }: UploadPanelProps) {
  const [dragActive, setDragActive] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFiles = Array.from(e.dataTransfer.files)
        setFiles(mergeFiles(files, droppedFiles))
      }
    },
    [files, setFiles],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(mergeFiles(files, selectedFiles))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const addTextItem = () => {
    if (currentText.trim()) {
      setTextItems([...textItems, { id: crypto.randomUUID(), content: currentText }])
      setCurrentText("")
    }
  }

  const removeTextItem = (id: string) => {
    setTextItems(textItems.filter((item) => item.id !== id))
  }

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addTextItem()
    }
  }

  const addUrlItem = () => {
    if (currentUrl.trim()) {
      setUrlItems([...urlItems, { id: crypto.randomUUID(), url: currentUrl }])
      setCurrentUrl("")
    }
  }

  const removeUrlItem = (id: string) => {
    setUrlItems(urlItems.filter((item) => item.id !== id))
  }

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addUrlItem()
    }
  }

  const imageCount = files.filter((file) => isImageFile(file)).length
  const otherFileCount = files.length - imageCount

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card
        className={`p-12 border-2 border-dashed transition-all duration-300 ${
          dragActive ? "border-primary bg-primary/5 scale-102" : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center gap-4 cursor-pointer">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-card-foreground">Drop files and images here or click to browse</p>
            <p className="text-sm text-muted-foreground">Supports: .txt, .jpg, .jpeg, .png, .mp3, .wav, .mp4</p>
            {(imageCount > 0 || otherFileCount > 0) && (
              <p className="text-xs text-muted-foreground">
                {imageCount} image{imageCount !== 1 ? "s" : ""} and {otherFileCount} other file{otherFileCount !== 1 ? "s" : ""} queued
              </p>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept=".txt,.jpg,.jpeg,.png,.mp3,.wav,.mp4"
          />
        </label>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-6 animate-fade-in-up">
          <h3 className="font-semibold mb-4 text-card-foreground">Uploaded Files</h3>
          <div className="space-y-3">
            {files.map((file, index) => {
              const extension = getFileExtension(file.name)
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 hover:bg-muted animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="flex-1 text-sm truncate text-card-foreground">{file.name}</span>
                  <Badge variant="outline" className="uppercase">
                    {extension || "file"}
                  </Badge>
                  <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-all duration-300 hover:scale-110"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Text Input - Added support for multiple text items */}
      <Card className="p-6 transition-all duration-300 hover:shadow-lg">
        <div className="space-y-4">
          <h3 className="font-semibold text-card-foreground">Paste Text</h3>

          {textItems.length > 0 && (
            <div className="space-y-2 mb-4">
              {textItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 hover:bg-muted animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <p className="flex-1 text-sm text-card-foreground line-clamp-3">{item.content}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-all duration-300 hover:scale-110 flex-shrink-0"
                    onClick={() => removeTextItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Paste text content to verify... (Ctrl+Enter to add)"
              className="min-h-32 resize-none transition-all duration-300 focus:scale-[1.02]"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              onKeyDown={handleTextKeyDown}
            />
            <Button
              size="icon"
              className="h-10 w-10 flex-shrink-0 transition-all duration-300 hover:scale-110"
              onClick={addTextItem}
              disabled={!currentText.trim()}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Ctrl+Enter or click + to add multiple text items</p>
        </div>
      </Card>

      {/* URL Input - Added support for multiple URLs */}
      <Card className="p-6 transition-all duration-300 hover:shadow-lg">
        <div className="space-y-4">
          <h3 className="font-semibold text-card-foreground">Paste URL</h3>

          {urlItems.length > 0 && (
            <div className="space-y-2 mb-4">
              {urlItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all duration-300 hover:bg-muted animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="flex-1 text-sm truncate text-card-foreground">{item.url}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-all duration-300 hover:scale-110 flex-shrink-0"
                    onClick={() => removeUrlItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="https://example.com or YouTube link... (Enter to add)"
              className="transition-all duration-300 focus:scale-[1.02]"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyDown={handleUrlKeyDown}
            />
            <Button
              size="icon"
              className="h-10 w-10 flex-shrink-0 transition-all duration-300 hover:scale-110"
              onClick={addUrlItem}
              disabled={!currentUrl.trim()}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter or click + to add multiple URLs</p>
        </div>
      </Card>
    </div>
  )
}

function mergeFiles(existingFiles: File[], incomingFiles: File[]): File[] {
  const unique = new Map(existingFiles.map((file) => [buildFileKey(file), file]))
  for (const file of incomingFiles) {
    unique.set(buildFileKey(file), file)
  }
  return Array.from(unique.values())
}

function buildFileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
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
