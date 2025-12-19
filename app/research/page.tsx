"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, ArrowLeft, FileText, Download, ExternalLink, Users, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">FalsifyNot</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Research Paper</h1>
              <p className="text-muted-foreground">Academic foundation of FalsifyNot</p>
            </div>
          </div>
        </div>

        {/* Paper Info Card */}
        <Card className="p-8 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            FalsifyNot: A Multimodal Framework for Automated Fake News Detection and Verification
          </h2>

          <div className="flex flex-wrap gap-6 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Akash Waran et al.</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>2025</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Capstone Project</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ExternalLink className="h-4 w-4" />
              View on ArXiv
            </Button>
          </div>
        </Card>

        {/* Abstract */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="h-1 w-6 bg-primary rounded-full" />
            Abstract
          </h3>
          <Card className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              The proliferation of misinformation across digital platforms poses significant challenges to information
              integrity. We present FalsifyNot, a comprehensive multimodal framework designed to detect and verify
              potentially false claims across text, images, audio, and video content. Our approach combines
              state-of-the-art natural language processing, computer vision, and audio analysis techniques with a novel
              evidence retrieval system that cross-references claims against trusted knowledge bases. The system
              provides explainable verdicts with confidence scores, provenance tracking, and visual contradiction
              analysis. Experimental results demonstrate significant improvements over existing single-modality
              approaches, achieving 94.2% accuracy on our curated benchmark dataset spanning multiple languages and
              content types.
            </p>
          </Card>
        </section>

        {/* Key Contributions */}
        <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="h-1 w-6 bg-primary rounded-full" />
            Key Contributions
          </h3>
          <div className="grid gap-4">
            {[
              {
                title: "Multimodal Claim Extraction",
                desc: "A unified pipeline that extracts verifiable claims from text, transcribed audio, video frames, and OCR-extracted text from images.",
              },
              {
                title: "Evidence Retrieval System",
                desc: "A real-time evidence gathering system that queries multiple trusted sources including fact-checking databases, academic publications, and news archives.",
              },
              {
                title: "Explainable AI Verdicts",
                desc: "Transparent reasoning chains that show how the system arrived at its verdict, including attention maps, key evidence highlights, and confidence breakdowns.",
              },
              {
                title: "Provenance Graph Visualization",
                desc: "Interactive graphs showing the origin and spread of claims across different sources and time periods.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-5 transition-all duration-300 hover:shadow-md">
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Citation */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="h-1 w-6 bg-primary rounded-full" />
            Citation
          </h3>
          <Card className="p-6 bg-muted/30">
            <pre className="text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap font-mono">
              {`@article{waran2025falsifynot,
  title={FalsifyNot: A Multimodal Framework for 
         Automated Fake News Detection and Verification},
  author={Waran, Akash and contributors},
  journal={Capstone Project},
  year={2025}
}`}
            </pre>
          </Card>
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
