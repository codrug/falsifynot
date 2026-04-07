# FalsifyNot Backend API

FastAPI-based backend for the FalsifyNot fact-checking application.

CheckThat! dataset link:
``` https://gitlab.com/checkthat_lab/clef2024-checkthat-lab/-/blob/main/task1/data/CT24_checkworthy_english.zip ```

## API Documentation

### Endpoints

#### `POST /api/v1/analyze`
Analyze a new claim and receive comprehensive fact-checking results.

**Request Body:** `multipart/form-data`
- `text` (optional): Raw input text to analyze
- `image` (optional): Image file (.jpg, .png) for multimodal analysis
- `source_name` (optional): Original source label or file name

**Response:** `AnalyzeResponse` (201 Created)

#### `GET /api/v1/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-15T12:00:00",
  "version": "1.0.0"
}
```

## API Contract

### Pydantic Models

#### `ExtractedClaim`
```python
{
  "id": str,                    # Unique claim identifier
  "text": str,                  # The claim text
  "confidence": float,          # Extraction confidence (0-1)
  "claim_type": str,            # Claim type: Statistical, Causal, Opinion
  "verdict": str,               # Analysis verdict: SUPPORTS, REFUTES, NEUTRAL
  "evidence": List[EvidenceResult],  # Retrieved evidence
  "provenance": Dict,           # Provenance graph data
  "explainability": Dict,       # Explainability data
  "visual_context": Optional[VisualContext],  # Visual context from image
  "multimodal_contribution": Optional[MultimodalContribution],  # Multimodal comparison
  "external_evidence": ExternalEvidence,  # External web/video links
  "input_source": InputSourceInfo  # Original input source info
}
```

#### `EvidenceResult`
```python
{
  "text": str,                  # Text of the evidence document
  "score": float,               # Relevance score
  "source": str,                # Evidence source page/title
  "matched_terms": List[str],   # Lexical overlap terms
  "verdict": str,               # Verdict from NLI model
  "confidence": float,          # Confidence in the verdict
  "quality_score": float,       # Combined evidence quality score
  "highlight_text": str         # Most relevant evidence snippet
}
```

#### `AnalyzeResponse`
```python
{
  "claims": List[ExtractedClaim],  # Extracted claims with evidence
  "processing_meta": Optional[Dict]  # Processing diagnostics
}
```

## 🔧 Configuration

Environment variables (`.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | FalsifyNot API | Application name |
| `APP_VERSION` | 1.0.0 | API version |
| `HOST` | 0.0.0.0 | Server host |
| `PORT` | 8000 | Server port |
| `DEBUG` | True | Debug mode |
| `LOG_LEVEL` | INFO | Logging level |
| `LOG_FORMAT` | json | Log format (json/text) |
| `CORS_ORIGINS` | http://localhost:3000 | Allowed CORS origins |

## 📝 Logging

The backend uses structured logging with support for both JSON and text formats.

**JSON Format** (default):
```json
{
  "timestamp": "2024-02-15T12:00:00",
  "level": "INFO",
  "logger": "app.api.routes",
  "message": "Received analysis request",
  "module": "routes",
  "function": "analyze_claim"
}
```

**Text Format:**
```
2024-02-15 12:00:00 - app.api.routes - INFO - Received analysis request
```

### Frontend Integration

### Example Usage (TypeScript/React)

```typescript
// Analyze text with optional image
const formData = new FormData();
formData.append('text', 'Earth temperature has risen by 1.1°C since 1880.');
formData.append('image', imageFile); // Optional

const response = await fetch('http://localhost:8000/api/v1/analyze', {
  method: 'POST',
  body: formData
});

const analysis: AnalyzeResponse = await response.json();
console.log(analysis.claims[0].verdict); // "SUPPORTS"
console.log(analysis.claims[0].evidence.length); // 3
```

### TypeScript Types

```typescript
interface ExtractedClaim {
  id: string;
  text: string;
  confidence: number;
  claim_type?: string;
  verdict?: string;
  evidence: EvidenceResult[];
  provenance?: any;
  explainability?: any;
  visual_context?: VisualContext;
  multimodal_contribution?: MultimodalContribution;
  external_evidence?: ExternalEvidence;
  input_source?: InputSourceInfo;
}

interface EvidenceResult {
  text: string;
  score: number;
  source?: string;
  matched_terms: string[];
  verdict?: string;
  confidence?: number;
  quality_score?: number;
  highlight_text?: string;
}

interface AnalyzeResponse {
  claims: ExtractedClaim[];
  processing_meta?: any;
}
```
