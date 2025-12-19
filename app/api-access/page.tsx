"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, Home, Code2, Key, Zap, Lock, Copy, CheckCircle2, Github } from "lucide-react"
import { useState } from "react"

export default function ApiAccessPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const codeExamples = {
    curl: `curl -X POST https://api.falsifynot.ai/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Climate change is a hoax invented by scientists.",
    "type": "text"
  }'`,
    python: `import requests

response = requests.post(
    "https://api.falsifynot.ai/v1/verify",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "content": "Climate change is a hoax invented by scientists.",
        "type": "text"
    }
)

result = response.json()
print(result["verdict"], result["confidence"])`,
    javascript: `const response = await fetch("https://api.falsifynot.ai/v1/verify", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    content: "Climate change is a hoax invented by scientists.",
    type: "text"
  })
});

const result = await response.json();
console.log(result.verdict, result.confidence);`,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="transition-all duration-300 hover:scale-110">
              <Link href="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">FalsifyNot</h1>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 animate-fade-in-up">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code2 className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">API Access</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Integrate FalsifyNot's powerful verification capabilities directly into your applications with our REST API.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Fast & Reliable",
                description: "Average response time under 2 seconds with 99.9% uptime guarantee.",
              },
              {
                icon: Lock,
                title: "Secure",
                description: "Enterprise-grade security with encrypted connections and API key authentication.",
              },
              {
                icon: Key,
                title: "Easy Integration",
                description: "Simple REST API with SDKs available for Python, JavaScript, and more.",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 space-y-3 transition-all duration-300 hover:shadow-lg">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Authentication</h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              All API requests require authentication using an API key. Include your key in the Authorization header:
            </p>
            <Card className="p-4 bg-background font-mono text-sm">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </Card>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Keep your API key secure and never expose it in client-side code.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Endpoints</h3>

          <Card className="overflow-hidden">
            <div className="p-4 bg-primary/10 border-b border-border flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold">POST</span>
              <code className="font-mono text-foreground">/v1/verify</code>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Submit content for verification. Supports text, URLs, and base64-encoded media.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Request Body</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-foreground">Parameter</th>
                        <th className="text-left py-2 text-foreground">Type</th>
                        <th className="text-left py-2 text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">content</td>
                        <td className="py-2">string</td>
                        <td className="py-2">Text content, URL, or base64-encoded media</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 font-mono">type</td>
                        <td className="py-2">string</td>
                        <td className="py-2">One of: text, image, video, audio, url</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">options</td>
                        <td className="py-2">object</td>
                        <td className="py-2">Optional configuration (detailed analysis, etc.)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Response</h4>
                <Card className="p-4 bg-muted/50 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "id": "ver_abc123",
  "claims": [
    {
      "text": "Climate change is a hoax...",
      "verdict": "False",
      "confidence": 0.94,
      "evidence": [...],
      "explanation": "..."
    }
  ],
  "processing_time_ms": 1842
}`}</pre>
                </Card>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 bg-primary/10 border-b border-border flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold">GET</span>
              <code className="font-mono text-foreground">/v1/status/:id</code>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Check the status of a verification request. Useful for long-running analyses of large media files.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Code Examples */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Code Examples</h3>

          <div className="space-y-6">
            {Object.entries(codeExamples).map(([lang, code]) => (
              <Card key={lang} className="overflow-hidden">
                <div className="p-3 bg-card border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-card-foreground capitalize">{lang}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, lang)}
                    className="transition-all duration-300"
                  >
                    {copied === lang ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-4 bg-background overflow-x-auto">
                  <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">{code}</pre>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <h3 className="text-3xl font-bold text-foreground">Rate Limits</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-foreground">Plan</th>
                  <th className="text-left py-3 text-foreground">Requests/min</th>
                  <th className="text-left py-3 text-foreground">Requests/day</th>
                  <th className="text-left py-3 text-foreground">Max File Size</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3">Free</td>
                  <td className="py-3">10</td>
                  <td className="py-3">100</td>
                  <td className="py-3">10 MB</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3">Pro</td>
                  <td className="py-3">60</td>
                  <td className="py-3">5,000</td>
                  <td className="py-3">100 MB</td>
                </tr>
                <tr>
                  <td className="py-3">Enterprise</td>
                  <td className="py-3">Unlimited</td>
                  <td className="py-3">Unlimited</td>
                  <td className="py-3">1 GB</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Get Your API Key</h3>
          <p className="text-muted-foreground">Start integrating FalsifyNot into your applications today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="transition-all duration-300 hover:scale-105">
              Request API Access
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <Link href="/docs">Read Documentation</Link>
            </Button>
          </div>
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
