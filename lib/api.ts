export interface EvidenceResult {
  text: string
  score: number
  source?: string | null
  matched_terms?: string[]
  verdict?: string | null
  confidence?: number | null
  quality_score?: number | null
  highlight_text?: string | null
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

// --- Multimodal types ---

export interface VisualContext {
  ocr_text: string
  image_text_similarity: number
  used_in_verification: boolean
}

export interface MultimodalContribution {
  text_only_verdict: string
  with_image_verdict: string
  image_impact: string
}

export interface WebSource {
  title: string
  url: string
}

export interface VideoSource {
  title: string
  url: string
}

export interface ExternalEvidence {
  web_sources: WebSource[]
  video_sources: VideoSource[]
}

// --- Core types ---

export interface ExtractedClaim {
  id: string
  text: string
  confidence: number
  claim_type?: string | null
  verdict?: string | null
  evidence?: EvidenceResult[]
  provenance?: ProvenanceGraphData
  explainability?: ExplainabilityData
  // Multimodal fields
  visual_context?: VisualContext | null
  multimodal_contribution?: MultimodalContribution | null
  external_evidence?: ExternalEvidence | null
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

/**
 * Analyze content with optional image for multimodal verification.
 * Sends multipart/form-data to the backend.
 */
export async function analyzeContent(text: string, imageFile?: File | null): Promise<AnalyzeResponse> {
  const formData = new FormData()
  formData.append("text", text)
  if (imageFile) {
    formData.append("image", imageFile)
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Analyze request failed with status ${response.status}`)
  }

  return (await response.json()) as AnalyzeResponse
}

/**
 * @deprecated Use analyzeContent() instead. Kept for backward compatibility.
 */
export async function analyzeText(text: string): Promise<AnalyzeResponse> {
  return analyzeContent(text)
}
