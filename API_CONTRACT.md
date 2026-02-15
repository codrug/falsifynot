# FalsifyNot API Contract

**Version:** 1.0.0  
**Last Updated:** 2024-02-15  
**Status:** ✅ Locked - Ready for Frontend Integration

---

## 🎯 Overview

This document defines the **locked API contract** between the FalsifyNot frontend and backend. Both teams must adhere to these specifications to ensure seamless integration.

## 🌐 Base URL

- **Development:** `http://localhost:8000`
- **API Prefix:** `/api/v1`

---

## 📡 Endpoints

### 1. Analyze Claim

**POST** `/api/v1/analyze`

Submit a claim for fact-checking analysis.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "claim_text": "string (required, 1-1000 chars)",
  "include_evidence": "boolean (optional, default: true)"
}
```

**Example:**
```json
{
  "claim_text": "The earth is round",
  "include_evidence": true
}
```

#### Response

**Status:** `201 Created`

**Body:** `AnalysisResponse`

```json
{
  "claim": {
    "id": "claim_abc123def456",
    "claim_text": "The earth is round",
    "verdict": "mostly_true",
    "confidence_score": 0.85,
    "summary": "Based on available evidence...",
    "created_at": "2024-02-15T12:00:00Z"
  },
  "evidence": [
    {
      "id": "ev_12345678",
      "source": "https://www.scientificjournal.com/article-1",
      "title": "Peer-Reviewed Study on the Topic",
      "snippet": "Research indicates...",
      "relevance_score": 0.92,
      "credibility_score": 0.88,
      "stance": "supports",
      "published_date": "2024-01-15"
    }
  ],
  "methodology": "Multi-source verification using...",
  "limitations": [
    "Analysis limited to English-language sources",
    "Real-time events may not be fully represented"
  ]
}
```

#### Error Responses

**400 Bad Request:**
```json
{
  "detail": [
    {
      "loc": ["body", "claim_text"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**422 Unprocessable Entity:**
```json
{
  "detail": "Invalid request format"
}
```

---

### 2. Get Claim Analysis

**GET** `/api/v1/analyze/claim/{claim_id}`

Retrieve a previously analyzed claim.

#### Parameters

- `claim_id` (path, required): Unique claim identifier (e.g., `claim_abc123def456`)

#### Response

**Status:** `200 OK`

**Body:** `AnalysisResponse` (same structure as POST /analyze)

#### Error Responses

**404 Not Found:**
```json
{
  "detail": "Claim with ID 'claim_xyz' not found"
}
```

---

### 3. Health Check

**GET** `/api/v1/health`

Check API health and status.

#### Response

**Status:** `200 OK`

```json
{
  "status": "healthy",
  "timestamp": "2024-02-15T12:00:00Z",
  "version": "1.0.0"
}
```

---

## 📦 Data Models

### ClaimResponse

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | string | Unique claim identifier | Format: `claim_[12 hex chars]` |
| `claim_text` | string | Original claim text | 1-1000 characters |
| `verdict` | string | Analysis verdict | Enum: see below |
| `confidence_score` | number | Confidence level | 0.0 - 1.0 |
| `summary` | string | Analysis summary | - |
| `created_at` | datetime | Analysis timestamp | ISO 8601 format |

**Verdict Enum:**
- `true` - Claim is accurate
- `mostly_true` - Claim is largely accurate
- `mixed` - Claim has both true and false elements
- `mostly_false` - Claim is largely inaccurate
- `false` - Claim is inaccurate
- `unverifiable` - Insufficient evidence

---

### EvidenceResponse

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | string | Unique evidence identifier | Format: `ev_[8 hex chars]` |
| `source` | string | Source URL | Valid URL |
| `title` | string | Source title | - |
| `snippet` | string | Relevant excerpt | - |
| `relevance_score` | number | Relevance to claim | 0.0 - 1.0 |
| `credibility_score` | number | Source credibility | 0.0 - 1.0 |
| `stance` | string | Evidence position | Enum: `supports`, `refutes`, `neutral` |
| `published_date` | string (optional) | Publication date | YYYY-MM-DD format |

---

### AnalysisResponse

| Field | Type | Description |
|-------|------|-------------|
| `claim` | ClaimResponse | The analyzed claim |
| `evidence` | EvidenceResponse[] | List of evidence items |
| `methodology` | string | Description of analysis method |
| `limitations` | string[] | Known limitations |

---

## 🔒 CORS Configuration

**Allowed Origins:**
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`

**Allowed Methods:** `GET`, `POST`, `OPTIONS`  
**Allowed Headers:** `*`  
**Credentials:** Enabled

---

## 🎨 Frontend Integration Requirements

### 1. TypeScript Types

```typescript
// Copy these type definitions to your frontend

export type Verdict = 
  | 'true' 
  | 'mostly_true' 
  | 'mixed' 
  | 'mostly_false' 
  | 'false' 
  | 'unverifiable';

export type Stance = 'supports' | 'refutes' | 'neutral';

export interface ClaimResponse {
  id: string;
  claim_text: string;
  verdict: Verdict;
  confidence_score: number;
  summary: string;
  created_at: string;
}

export interface EvidenceResponse {
  id: string;
  source: string;
  title: string;
  snippet: string;
  relevance_score: number;
  credibility_score: number;
  stance: Stance;
  published_date?: string;
}

export interface AnalysisResponse {
  claim: ClaimResponse;
  evidence: EvidenceResponse[];
  methodology: string;
  limitations: string[];
}

export interface AnalyzeRequest {
  claim_text: string;
  include_evidence?: boolean;
}
```

### 2. API Client Example

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeClaim(
  claimText: string,
  includeEvidence: boolean = true
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      claim_text: claimText,
      include_evidence: includeEvidence,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getClaimAnalysis(
  claimId: string
): Promise<AnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/analyze/claim/${claimId}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Claim not found');
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

---

## ✅ Acceptance Criteria Verification

### Backend Requirements

- [x] FastAPI server running on port 8000
- [x] All Pydantic models defined (ClaimResponse, EvidenceResponse, AnalysisResponse)
- [x] POST /api/v1/analyze endpoint implemented
- [x] GET /api/v1/analyze/claim/{id} endpoint implemented
- [x] Mock responses return valid data
- [x] CORS configured for frontend origins
- [x] Structured logging implemented
- [x] Docker configuration created
- [x] API documentation complete

### Frontend Integration Checklist

- [ ] TypeScript types copied to frontend
- [ ] API client functions implemented
- [ ] Environment variable `NEXT_PUBLIC_API_URL` configured
- [ ] Error handling for 400, 404, 422, 500 responses
- [ ] Loading states during API calls
- [ ] Display of analysis results
- [ ] Evidence listing with scores
- [ ] Verdict visualization

### Testing Checklist

- [ ] POST /analyze returns 201 with valid response
- [ ] GET /analyze/claim/{id} returns 200 for existing claims
- [ ] GET /analyze/claim/{id} returns 404 for non-existent claims
- [ ] Invalid claim_text returns 400/422
- [ ] CORS headers present in responses
- [ ] Frontend successfully renders API responses
- [ ] No schema mismatches between frontend and backend

---

## 📝 Mock Data Note

**⚠️ Current Status:** All endpoints return **mock data** for frontend integration and testing.

The backend structure is production-ready, but actual AI/ML integration is pending. This allows:
- Frontend development to proceed independently
- API contract validation
- Integration testing
- UI/UX refinement

---

## 🔄 Versioning

**Current Version:** `1.0.0`

Any breaking changes to this contract will result in a major version bump and require coordination between frontend and backend teams.

### Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2024-02-15 | 1.0.0 | Initial API contract lock |

---

## 📞 Support

For API contract questions or issues:
- Check `/docs` endpoint for interactive API documentation
- Review backend README: `backend/README.md`
- Verify health endpoint: `/api/v1/health`

---

**Contract Status:** ✅ **LOCKED**  
**Ready for Integration:** ✅ **YES**
