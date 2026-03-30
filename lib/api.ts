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

export interface InputSourceInfo {
  source_type: string
  source_url?: string | null
  source_title?: string | null
  source_extension?: string | null
  source_name?: string | null
}

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
  // Source tracking
  input_source?: InputSourceInfo | null
}

export interface AnalyzeResponse {
  claims: ExtractedClaim[]
  processing_meta?: {
    source_type?: string
    video_id?: string
    transcript_status?: string
    fallback_used?: string | null
    reason?: string | null
  } | null
}

export interface TextAnalysis {
  textId: string
  inputText: string
  claims: ExtractedClaim[]
  error?: string | null
  processingMeta?: AnalyzeResponse["processing_meta"]
}

export interface StoredClaim extends ExtractedClaim {
  sourceTextId: string
  sourceText: string
  sourceInputKind?: "text" | "url" | "file" | "image"
  sourceInputLabel?: string
  sourceFileExtension?: string | null
  sourcePreviewUrl?: string | null
}

export interface InputProcessingSummary {
  id: string
  label: string
  sourceKind: string
  sourceExtension: string
  claimsCount: number
  status: "claims" | "no-claims" | "error" | "missing"
  errorMessage?: string
  reasonMessage?: string
}

export interface AnalyzeContentOptions {
  sourceName?: string
  sourceExtension?: string
  signal?: AbortSignal
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Analyze content with optional image for multimodal verification.
 * Sends multipart/form-data to the backend.
 */
export async function analyzeContent(
  text: string,
  imageFile?: File | null,
  options?: AnalyzeContentOptions,
): Promise<AnalyzeResponse> {
  const formData = new FormData()
  const normalizedText = (text ?? "").trim()
  formData.append("text", normalizedText)
  if (options?.sourceName) {
    formData.append("source_name", options.sourceName)
  }
  if (options?.sourceExtension) {
    formData.append("source_extension", options.sourceExtension)
  }
  if (imageFile) {
    formData.append("image", imageFile)
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    body: formData,
    signal: options?.signal,
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
