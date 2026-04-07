"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, ArrowLeft, Cpu, Search, Brain, BarChart3, GitBranch, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Methodology</h1>
              <p className="text-muted-foreground">How FalsifyNot verifies content</p>
            </div>
          </div>
        </div>

        {/* Pipeline Overview */}
        <section className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Verification Pipeline</h2>
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { icon: Layers, label: "Input Processing" },
                { icon: Search, label: "Claim Extraction" },
                { icon: GitBranch, label: "Evidence Retrieval" },
                { icon: Brain, label: "AI Analysis" },
                { icon: BarChart3, label: "Verdict Generation" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{step.label}</span>
                  </div>
                  {idx < 4 && <div className="hidden md:block w-8 h-0.5 bg-border" />}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Detailed Steps */}
        <section className="space-y-8">
          {/* Step 1 */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              Input Processing
            </h3>
            <Card className="p-6 space-y-4">
              <p className="text-muted-foreground">
                FalsifyNot accepts multiple input modalities and preprocesses them for analysis:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Text:</strong> Tokenization, language detection, and semantic
                    parsing
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Images:</strong> OCR extraction, object detection, and reverse
                    image search preparation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Audio:</strong> Speech-to-text transcription using Whisper,
                    speaker diarization
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">Video:</strong> Frame extraction, audio separation, and scene
                    segmentation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    <strong className="text-foreground">URLs:</strong> Web scraping, metadata extraction, and content
                    archiving
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Step 2 */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              Claim Extraction
            </h3>
            <Card className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Our NLP pipeline identifies and extracts verifiable factual claims from processed content:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>
                    Named Entity Recognition (NER) for identifying people, organizations, locations, and dates
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Claim boundary detection using fine-tuned transformer models</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Verifiability scoring to prioritize claims that can be fact-checked</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Step 3 */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              Evidence Retrieval
            </h3>
            <Card className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Each claim is cross-referenced against multiple authoritative sources:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Fact-checking databases (Snopes, PolitiFact, FactCheck.org)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Academic publications and scientific journals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Government and official institutional sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>News archives with credibility ratings</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Step 4 */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                4
              </span>
              AI Analysis & Verdict
            </h3>
            <Card className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Our ensemble model analyzes evidence and generates explainable verdicts:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Stance detection between claims and evidence (supports, refutes, neutral)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Confidence scoring based on evidence quality and consensus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Attention-based explanation highlighting key evidence passages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Provenance graph construction showing claim origin and spread</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 FalsifyNot. AI multimodal fake news verification.</p>
        </div>
      </footer>
    </div>
  )
}
