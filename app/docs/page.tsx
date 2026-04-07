"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Shield,
  Home,
  BookOpen,
  FileText,
  ImageIcon,
  Video,
  Mic,
  LinkIcon,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Github,
} from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 animate-fade-in-up">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Documentation</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Learn how to use FalsifyNot for multimodal fake news verification. This guide covers all features, supported
            formats, and best practices.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-muted/30">
            <h3 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h3>
            <nav className="space-y-2">
              {[
                { href: "#getting-started", label: "Getting Started" },
                { href: "#supported-formats", label: "Supported Formats" },
                { href: "#verification-process", label: "Verification Process" },
                { href: "#understanding-results", label: "Understanding Results" },
                { href: "#best-practices", label: "Best Practices" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </Card>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Getting Started</h3>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed">
              FalsifyNot is a research-grade AI system designed to verify claims across multiple media types. Whether
              you're fact-checking a news article, analyzing a viral video, or investigating audio recordings, our
              platform provides comprehensive verification tools.
            </p>

            <Card className="p-6 space-y-4">
              <h4 className="text-xl font-semibold text-card-foreground">Quick Start Guide</h4>
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    1
                  </span>
                  <div>
                    <strong className="text-foreground">Navigate to Upload</strong>
                    <p>Click the "Upload" button in the header or go to the Upload page.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    2
                  </span>
                  <div>
                    <strong className="text-foreground">Add Your Content</strong>
                    <p>
                      Upload files, paste text, or provide URLs. You can add multiple items of different types in a
                      single session.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    3
                  </span>
                  <div>
                    <strong className="text-foreground">Analyze</strong>
                    <p>Click "Analyze Content" to begin the verification process.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    4
                  </span>
                  <div>
                    <strong className="text-foreground">Review Results</strong>
                    <p>
                      Explore the dashboard to see extracted claims, evidence, provenance graphs, and AI explanations.
                    </p>
                  </div>
                </li>
              </ol>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section id="supported-formats" className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Supported Formats</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: FileText,
                title: "Text",
                formats: ["Plain text (.txt)", "PDF documents", "Word documents (.docx)", "Markdown files"],
                description: "Articles, news reports, social media posts, and written claims.",
              },
              {
                icon: ImageIcon,
                title: "Images",
                formats: ["JPEG / JPG", "PNG", "WebP", "GIF (static analysis)"],
                description: "Photos, screenshots, infographics, and visual content.",
              },
              {
                icon: Video,
                title: "Video",
                formats: ["MP4", "WebM", "MOV", "AVI"],
                description: "News clips, social media videos, and recorded content.",
              },
              {
                icon: Mic,
                title: "Audio",
                formats: ["MP3", "WAV", "M4A", "OGG"],
                description: "Podcasts, interviews, voice recordings, and audio clips.",
              },
              {
                icon: LinkIcon,
                title: "Web Links",
                formats: ["News articles", "Social media posts", "Blog posts", "Any public URL"],
                description: "URLs are fetched and analyzed for content and claims.",
              },
            ].map((format, idx) => (
              <Card key={idx} className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <format.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-card-foreground">{format.title}</h4>
                </div>
                <p className="text-muted-foreground">{format.description}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {format.formats.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section id="verification-process" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Verification Process</h3>
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg">
              FalsifyNot uses a multi-stage AI pipeline to analyze and verify content:
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "Content Extraction",
                  description:
                    "Media is processed to extract text, audio transcripts, video frames, and metadata. OCR is applied to images and video frames with text.",
                },
                {
                  title: "Claim Detection",
                  description:
                    "AI models identify verifiable claims within the content. Each claim is isolated for independent verification.",
                },
                {
                  title: "Evidence Retrieval",
                  description:
                    "The system searches trusted databases, fact-checking organizations, and web sources for relevant evidence.",
                },
                {
                  title: "Provenance Analysis",
                  description:
                    "Tracks the origin and spread of content across platforms, identifying potential manipulation or context changes.",
                },
                {
                  title: "Verdict Generation",
                  description:
                    "AI synthesizes all evidence to produce a verdict with confidence scores and detailed explanations.",
                },
              ].map((step, idx) => (
                <Card key={idx} className="p-6 flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Results */}
      <section id="understanding-results" className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Understanding Results</h3>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h4 className="text-xl font-semibold text-card-foreground">Verdict Types</h4>
              <div className="space-y-3">
                {[
                  { verdict: "True", color: "text-green-600", description: "Claim is verified as accurate" },
                  { verdict: "False", color: "text-red-600", description: "Claim is demonstrably false" },
                  {
                    verdict: "Partially True",
                    color: "text-yellow-600",
                    description: "Claim contains some truth but is misleading",
                  },
                  { verdict: "Unverified", color: "text-blue-600", description: "Insufficient evidence to verify" },
                ].map((v, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <span className={`font-semibold ${v.color}`}>{v.verdict}</span>
                    <span className="text-muted-foreground">{v.description}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h4 className="text-xl font-semibold text-card-foreground">Confidence Scores</h4>
              <p className="text-muted-foreground">
                Each verdict includes a confidence score from 0-100% indicating how certain the AI is about its
                assessment. Higher scores indicate stronger evidence support.
              </p>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Scores below 60% should be treated with caution and may require manual review.
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Best Practices</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3 border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <h4 className="font-semibold">Do</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>Upload original, uncompressed content when possible</li>
                <li>Include context about where the content was found</li>
                <li>Review multiple claims from a single source</li>
                <li>Cross-reference with the provided evidence sources</li>
                <li>Use the provenance graph to understand content spread</li>
              </ul>
            </Card>

            <Card className="p-6 space-y-3 border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-semibold">Avoid</h4>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>Relying solely on AI verdicts without reviewing evidence</li>
                <li>Uploading heavily edited or compressed files</li>
                <li>Ignoring low confidence scores</li>
                <li>Treating unverified claims as false</li>
                <li>Skipping the explainability section</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Ready to Start Verifying?</h3>
          <p className="text-muted-foreground">Upload your content and get AI-powered verification results.</p>
          <Button asChild size="lg" className="transition-all duration-300 hover:scale-105">
            <Link href="/upload">
              Start Verifying <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">FalsifyNot</span>
            </Link>
            <p>© 2025 FalsifyNot. AI multimodal fake news verification.</p>
            <a
              href="https://github.com/codrug/FalsifyNot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
