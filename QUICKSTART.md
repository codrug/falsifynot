# FalsifyNot Quick Start Guide

## 🚀 Running the Full Stack

### Option 1: Local Development (Recommended for Development)

#### Backend
```bash
# Terminal 1: Start Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.main
```

Backend will run on: **http://localhost:8000**

#### Frontend
```bash
# Terminal 2: Start Frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

### Option 2: Docker Compose (Full Stack)

```bash
# From project root
docker-compose up

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📡 API Endpoints

- **Health Check:** http://localhost:8000/api/v1/health
- **Interactive Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Analyze Claim:** POST http://localhost:8000/api/v1/analyze
- **Get Claim:** GET http://localhost:8000/api/v1/analyze/claim/{id}

---

## 🧪 Testing the API

### Using PowerShell

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health"

# Analyze a claim
$body = @{
    claim_text = "The earth is round"
    include_evidence = $true
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:8000/api/v1/analyze" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Using the Test Script

```powershell
cd backend
.\test_api.ps1
```

### Using cURL (if installed)

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Analyze claim
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"claim_text":"The earth is round","include_evidence":true}'
```

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```env
# Application  
APP_NAME=FalsifyNot API
APP_VERSION=1.0.0

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Frontend Configuration

Add to your `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📚 Documentation

- **API Contract:** See `API_CONTRACT.md`
- **Backend README:** See `backend/README.md`
- **Acceptance Criteria:** See `ACCEPTANCE_CRITERIA.md`
- **Interactive Docs:** http://localhost:8000/docs (when server is running)

---

## 🐛 Troubleshooting

### Backend won't start

1. **Check Python version:** `python --version` (should be 3.11+)
2. **Reinstall dependencies:**
   ```bash
   cd backend
   rm -rf venv
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. **Check port 8000 is free:**
   ```powershell
   Get-NetTCPConnection -LocalPort 8000
   ```

### CORS errors

1. Verify `CORS_ORIGINS` includes your frontend URL
2. Check frontend is using `http://localhost:8000` as API base URL
3. Restart both frontend and backend

### Docker issues

1. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

2. **Check logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Health endpoint returns 200: http://localhost:8000/api/v1/health
- [ ] Swagger docs accessible: http://localhost:8000/docs
- [ ] Frontend can make requests to backend (no CORS errors)
- [ ] Analyze endpoint returns mock data
- [ ] Logs show structured JSON format

---

## 🎯 Next Steps

### Frontend Development
1. Copy TypeScript types from `API_CONTRACT.md`
2. Create API client service
3. Build UI components for claim analysis
4. Implement result visualization

### Backend Development
1. Replace mock data with actual AI/ML models
2. Add database for persistence
3. Implement authentication
4. Add caching layer

---

## 📖 Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- Pydantic Documentation: https://docs.pydantic.dev/
- Next.js Documentation: https://nextjs.org/docs
- Docker Compose: https://docs.docker.com/compose/

---

**Happy Coding! 🚀**
