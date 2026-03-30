"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  FileText,
  ImageIcon,
  Mic,
  Video,
  LinkIcon,
  Shield,
  Search,
  CheckCircle2,
  ArrowRight,
  Github,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 animate-fade-in-up">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground text-balance animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            AI‑Powered Multimodal Fake News Verification
          </h2>
          <p
            className="text-xl md:text-2xl text-muted-foreground text-pretty animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Upload any content—text, image, audio, video, web links—and get AI‑driven evidence, provenance, and
            contradictions.
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Link href="/upload">
                Start Verifying <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Upload Content",
                desc: "Submit text, images, audio, video, or web links for analysis",
              },
              {
                icon: Search,
                title: "AI Analysis",
                desc: "Our AI extracts claims and searches for evidence across multiple sources",
              },
              {
                icon: CheckCircle2,
                title: "Get Results",
                desc: "Review detailed verdicts with confidence scores and supporting evidence",
              },
            ].map((step, idx) => (
              <Card
                key={idx}
                className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center transition-all duration-300 hover:bg-primary/20">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-card-foreground">{step.title}</h4>
                <p className="text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Modalities Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Supported Modalities</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: FileText, label: "Text", color: "text-chart-1" },
              { icon: ImageIcon, label: "Images", color: "text-chart-2" },
              { icon: Mic, label: "Audio", color: "text-chart-3" },
              { icon: Video, label: "Video", color: "text-chart-4" },
              { icon: LinkIcon, label: "Web Links", color: "text-chart-5" },
            ].map((modality, idx) => (
              <Card
                key={idx}
                className="p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-110 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <modality.icon className={`h-10 w-10 ${modality.color} transition-all duration-300`} />
                <span className="font-medium text-card-foreground">{modality.label}</span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer to push footer down */}
      <div className="flex-1" />

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">FalsifyNot</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered multimodal fake news verification system for researchers and fact-checkers.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/upload" className="text-muted-foreground hover:text-foreground transition-colors">
                    Upload Content
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/research" className="text-muted-foreground hover:text-foreground transition-colors">
                    Research Paper
                  </Link>
                </li>
                <li>
                  <Link href="/methodology" className="text-muted-foreground hover:text-foreground transition-colors">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

            {/* Code */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Code</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-4 pt-2">
                  <a
                    href="https://github.com/codrug/FalsifyNot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 FalsifyNot. Capstone project for multimodal fake news verification.</p>
            <p>Built with AI-powered verification technology</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
