# Test script for FalsifyNot Backend API

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " FalsifyNot API Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"

# Test 1: Health Check
Write-Host "[Test 1] Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/health" -Method GET
    $content = $response.Content | ConvertFrom-Json
    Write-Host "PASS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($content | ConvertTo-Json)" -ForegroundColor Gray
}
catch {
    Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Analyze Claim
Write-Host "[Test 2] Analyze Claim (POST /analyze)" -ForegroundColor Yellow
try {
    $body = @{
        claim_text       = "The earth is round"
        include_evidence = $true
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/analyze" -Method POST -Body $body -ContentType "application/json"
    $content = $response.Content | ConvertFrom-Json
    
    Write-Host "PASS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Claim ID: $($content.claim.id)" -ForegroundColor Gray
    Write-Host "Verdict: $($content.claim.verdict)" -ForegroundColor Gray
    Write-Host "Confidence: $($content.claim.confidence_score)" -ForegroundColor Gray
    Write-Host "Evidence Count: $($content.evidence.Count)" -ForegroundColor Gray
    Write-Host "Full Response:" -ForegroundColor Gray
    Write-Host ($content | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
    
    # Save claim ID for next test
    $script:claimId = $content.claim.id
}
catch {
    Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Retrieve Claim by ID
if ($script:claimId) {
    Write-Host "[Test 3] Retrieve Claim by ID (GET /analyze/claim/{id})" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/analyze/claim/$($script:claimId)" -Method GET
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "PASS - Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Claim ID: $($content.claim.id)" -ForegroundColor Gray
        Write-Host "Verdict: $($content.claim.verdict)" -ForegroundColor Gray
    }
    catch {
        Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 4: Retrieve Non-existent Claim (Should 404)
Write-Host "[Test 4] Retrieve Non-existent Claim (Should 404)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v1/analyze/claim/nonexistent" -Method GET -ErrorAction Stop
    Write-Host "FAIL - Unexpected success: $($response.StatusCode)" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "PASS - Correctly returned 404" -ForegroundColor Green
    }
    else {
        Write-Host "FAIL - Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Root Endpoint
Write-Host "[Test 5] Root Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET
    $content = $response.Content | ConvertFrom-Json
    Write-Host "PASS - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Message: $($content.message)" -ForegroundColor Gray
    Write-Host "Version: $($content.version)" -ForegroundColor Gray
}
catch {
    Write-Host "FAIL - $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " API Docs Available at:" -ForegroundColor Cyan
Write-Host " - Interactive: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host " - ReDoc: http://localhost:8000/redoc" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
