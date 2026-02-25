"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, ArrowLeft, Lock, Eye, Database, Trash2, Bell, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-muted-foreground leading-relaxed">
            At FalsifyNot, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our multimodal fake news verification platform. Please read this
            policy carefully to understand our practices regarding your data.
          </p>
        </Card>

        {/* Sections */}
        <div className="space-y-8">
          {/* Data Collection */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
            </div>
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Content You Submit</h3>
                <p className="text-sm text-muted-foreground">
                  When you upload content for verification (text, images, audio, video, or URLs), we temporarily process
                  this data to provide our verification services. Uploaded content is processed in real-time and is not
                  permanently stored unless you explicitly save your analysis.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Usage Information</h3>
                <p className="text-sm text-muted-foreground">
                  We collect anonymous usage statistics including pages visited, features used, and aggregate
                  verification metrics to improve our service. This data cannot be used to identify individual users.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Technical Data</h3>
                <p className="text-sm text-muted-foreground">
                  We automatically collect certain technical information including browser type, device information, and
                  IP address for security and service optimization purposes.
                </p>
              </div>
            </Card>
          </section>

          {/* Data Usage */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
            </div>
            <Card className="p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>To provide and maintain our verification services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>To improve and optimize our AI models and analysis accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>To detect and prevent technical issues or abuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>To conduct research on misinformation patterns (anonymized data only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>To communicate with you about service updates if you opt-in</span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Data Retention */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Data Retention & Deletion</h2>
            </div>
            <Card className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                We retain uploaded content only for the duration needed to complete your verification request. By
                default, all uploaded content is automatically deleted within 24 hours of processing.
              </p>
              <p className="text-sm text-muted-foreground">
                You may request immediate deletion of your data at any time by contacting us. Anonymized aggregate data
                used for research purposes may be retained indefinitely.
              </p>
            </Card>
          </section>

          {/* Third Parties */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
            </div>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Our service may interact with third-party APIs and databases for evidence retrieval:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Fact-checking databases for claim verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Cloud infrastructure providers for data processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Analytics services (anonymized data only)</span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Contact */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
            </div>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">
                If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us
                at{" "}
                <a href="mailto:privacy@falsifynot.com" className="text-primary hover:underline">
                  privacy@falsifynot.com
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
