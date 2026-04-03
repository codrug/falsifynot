# FalsifyNot Backend API

FastAPI-based backend for the FalsifyNot fact-checking application.

CheckThat! dataset link:
``` https://gitlab.com/checkthat_lab/clef2024-checkthat-lab/-/blob/main/task1/data/CT24_checkworthy_english.zip ```

## API Documentation

### Endpoints

#### `POST /api/v1/analyze`
Analyze a new claim and receive comprehensive fact-checking results.

**Request Body:**
```json
{
  "claim_text": "The earth is round",
  "include_evidence": true
}
```

**Response:** `AnalysisResponse` (201 Created)

#### `GET /api/v1/analyze/claim/{claim_id}`
Retrieve a previously analyzed claim by ID.

**Response:** `AnalysisResponse` (200 OK)

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

#### `ClaimResponse`
```python
{
  "id": str,                    # Unique claim identifier
  "claim_text": str,            # Original claim text
  "verdict": str,               # true|mostly_true|mixed|mostly_false|false|unverifiable
  "confidence_score": float,    # 0.0 - 1.0
  "summary": str,               # Analysis summary
  "created_at": datetime        # Timestamp
}
```

#### `EvidenceResponse`
```python
{
  "id": str,                    # Unique evidence identifier
  "source": str,                # Source URL
  "title": str,                 # Source title
  "snippet": str,               # Relevant excerpt
  "relevance_score": float,     # 0.0 - 1.0
  "credibility_score": float,   # 0.0 - 1.0
  "stance": str,                # supports|refutes|neutral
  "published_date": str         # Optional publication date
}
```

#### `AnalysisResponse`
```python
{
  "claim": ClaimResponse,
  "evidence": List[EvidenceResponse],
  "methodology": str,
  "limitations": List[str]
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

## 🔗 Frontend Integration

### Example Usage (TypeScript/React)

```typescript
// Analyze a claim
const response = await fetch('http://localhost:8000/api/v1/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    claim_text: 'The earth is round',
    include_evidence: true
  })
});

const analysis: AnalysisResponse = await response.json();
console.log(analysis.claim.verdict); // "mostly_true"
console.log(analysis.evidence.length); // 3
```

### TypeScript Types

```typescript
interface ClaimResponse {
  id: string;
  claim_text: string;
  verdict: 'true' | 'mostly_true' | 'mixed' | 'mostly_false' | 'false' | 'unverifiable';
  confidence_score: number;
  summary: string;
  created_at: string;
}

interface EvidenceResponse {
  id: string;
  source: string;
  title: string;
  snippet: string;
  relevance_score: number;
  credibility_score: number;
  stance: 'supports' | 'refutes' | 'neutral';
  published_date?: string;
}

interface AnalysisResponse {
  claim: ClaimResponse;
  evidence: EvidenceResponse[];
  methodology: string;
  limitations: string[];
}
```
