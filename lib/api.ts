export interface EvidenceResult {
  text: string
  score: number
  source?: string | null
  matched_terms?: string[]
  verdict?: string | null
  confidence?: number | null
}

export interface ProvenanceNode {
  id: string
  type: string
  text?: string
  source?: string
  score?: number
}

export interface ProvenanceEdge {
  from: string
  to: string
  weight?: number
}

export interface ProvenanceGraphData {
  nodes: ProvenanceNode[]
  edges: ProvenanceEdge[]
}

export interface TextHighlight {
  text: string
  type: string
}

export interface ExplainabilityData {
  highlights: TextHighlight[]
  confidence_details?: Record<string, number>
}

export interface ExtractedClaim {
  id: string
  text: string
  confidence: number
  verdict?: string | null
  evidence?: EvidenceResult[]
  provenance?: ProvenanceGraphData
  explainability?: ExplainabilityData
}

export interface AnalyzeResponse {
  claims: ExtractedClaim[]
}

export interface TextAnalysis {
  textId: string
  inputText: string
  claims: ExtractedClaim[]
}

export interface StoredClaim extends ExtractedClaim {
  sourceTextId: string
  sourceText: string
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function analyzeText(text: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Analyze request failed with status ${response.status}`)
  }

  return (await response.json()) as AnalyzeResponse
}
