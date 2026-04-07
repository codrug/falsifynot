"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, ArrowLeft, ScrollText, AlertTriangle, Scale, UserCheck, Ban, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms of Use</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to FalsifyNot. By accessing or using our multimodal fake news verification platform, you agree to be
            bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
          </p>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {/* Acceptance */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            </div>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using FalsifyNot, you acknowledge that you have read, understood, and agree to be bound by these
                Terms of Use and our Privacy Policy. We reserve the right to modify these terms at any time, and your
                continued use of the service constitutes acceptance of any changes.
              </p>
            </Card>
          </section>

          {/* Service Description */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">2. Service Description</h2>
            </div>
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                FalsifyNot provides AI-powered verification services for identifying potentially false or misleading
                content across multiple media types. Our services include:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Multimodal content analysis (text, image, audio, video)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Claim extraction and evidence retrieval</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Verdict generation with confidence scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Provenance tracking and explainability features</span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Disclaimer */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">3. Important Disclaimer</h2>
            </div>
            <Card className="p-6 border-destructive/20 bg-destructive/5">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">
                  FalsifyNot is a research tool and should not be considered the sole arbiter of truth.
                </strong>{" "}
                Our AI-generated verdicts are probabilistic assessments based on available evidence and should be used
                as one of many inputs in your fact-checking process.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We do not guarantee 100% accuracy. Users should exercise critical thinking and consult multiple sources
                before drawing conclusions. FalsifyNot is not liable for decisions made based on our verification
                results.
              </p>
            </Card>
          </section>

          {/* Prohibited Use */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ban className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">4. Prohibited Uses</h2>
            </div>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-4">You agree not to use FalsifyNot to:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span>Upload illegal, harmful, or malicious content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span>Attempt to reverse-engineer or exploit our AI systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span>Harass, abuse, or harm others using our platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span>Violate any applicable laws or regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                  <span>Overwhelm our systems with automated requests without API access</span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Intellectual Property */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileWarning className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
            </div>
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All content, features, and functionality of FalsifyNot—including but not limited to text, graphics,
                logos, and software—are owned by FalsifyNot and protected by intellectual property laws.
              </p>
              <p className="text-sm text-muted-foreground">
                You retain ownership of content you upload for verification. By uploading content, you grant FalsifyNot
                a limited license to process and analyze it for the purpose of providing our services.
              </p>
            </Card>
          </section>

          {/* Contact */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <Card className="p-6 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-2">Questions?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about these Terms of Use, please contact us at{" "}
                <a href="mailto:legal@falsifynot.com" className="text-primary hover:underline">
                  legal@falsifynot.com
                </a>
              </p>
            </Card>
          </section>
        </div>
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
