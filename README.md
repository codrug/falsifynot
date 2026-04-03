<div align="center">

<br />

# FalsifyNot

### **A Fake News Verification System**

</div>

---

## What is FalsifyNot?

FalsifyNot is a multimodal fact-checking system that takes **text, images, web links, or YouTube videos**, extracts check-worthy claims, retrieves evidence from a Wikipedia-scale knowledge base, verifies them using NLI (Natural Language Inference), and presents a rich, explainable verdict — complete with multimodal impact analysis and clickable external evidence links.

---

## Pipeline

```
Text/Image/URL/Video Input
        │
        ├──► OCR / Web Scraping / Transcript Extraction
        │
        └──► Claim Extraction
                ├──► Evidence Retrieval ──► NLI Verification ──► Verdict
                │
                ├──► Wikipedia Links + YouTube Links
                └──► Visual Context + Multimodal Impact Analysis
```

---

## Features

| Feature | Description |
|---|---|
| **Multi-Source Input**| Verifies direct text, images (OCR via EasyOCR), web articles (newspaper3k), and video (youtube-transcript-api) |
| **Claim Extraction** | Fine-tuned BERT model identifies check-worthy sentences |
| **Semantic Retrieval** | FAISS + BGE embeddings search a Wikipedia-scale corpus |
| **NLI Verification** | DeBERTa v3 classifies each claim-evidence pair as SUPPORTS / REFUTES / NEUTRAL |
| **External Evidence** | Auto-generates Wikipedia links and YouTube search links for every claim |
| **Multimodal Impact Analysis** | Compares text-only verdicts vs. image-augmented results to show visual influence |
| **Explainability** | Highlights key terms, confidence breakdown, and model reasoning |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python 3.11**
- A Python virtual environment already created in `backend/venv`

> To create the venv (first time only):
> ```bash
> cd backend
> py -3.11 -m venv venv
> ```

---

### 1. Setup (run once, or after pulling new dependencies)

```bash
npm run setup
```

This single command will:
- Install all Node.js packages (`npm install`)
- Activate the backend Python venv
- Install all Python dependencies (`pip install -r requirements.txt`)

---

### 2. Start the development server

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend** → [http://localhost:3000](http://localhost:3000)
- **Backend API** → [http://localhost:8000](http://localhost:8000) | [Swagger Docs](http://localhost:8000/docs)

---

## Project Structure

```
falsifynot/
├── app/                  # Next.js pages (upload, dashboard, docs…)
├── components/           # UI components (analysis-panel, upload-panel…)
├── lib/
│   └── api.ts            # Typed API client (text + multimodal)
├── backend/
│   ├── app/
│   │   ├── api/routes/   # FastAPI endpoints (/analyze, /health)
│   │   ├── ml/           # ML modules
│   │   │   ├── claim_inference.py
│   │   │   ├── retriever.py
│   │   │   ├── verifier.py
│   │   │   ├── ocr_service.py   # EasyOCR
│   │   │   ├── clip_service.py  # CLIP similarity
│   │   │   └── link_service.py  # Wikipedia + YouTube links
│   │   ├── models/       # Pydantic schemas + responses
│   │   └── services/     # Claim, retrieval, verification services
│   └── data/
│       ├── wiki_faiss.index
│       └── wiki_corpus_metadata.csv
└── package.json
```

---

## API

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/analyze` | Analyze text + optional image (`multipart/form-data`) |
| `GET` | `/api/v1/health` | API health check |
| `GET` | `/docs` | Interactive Swagger UI |

**Example request with image:**
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -F "text=Earth's average temperature has risen by 1.1°C since 1880." \
  -F "image=@/path/to/screenshot.png"
```

---

## License

Copyright © 2025 FalsifyNot. All Rights Reserved.  
This code is for viewing purposes only. No part of this repository may be reproduced, distributed, or modified without prior written permission.
