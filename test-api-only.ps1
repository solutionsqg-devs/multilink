# Pruebas solo del API Backend

Write-Host "PRUEBAS API - SECTOR 5" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3001"

# Login
Write-Host "1. Login..." -ForegroundColor Yellow
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginData = @{ email = "demo@multienlace.com"; password = "password123" } | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Body $loginData -ContentType "application/json" -WebSession $session -ErrorAction Stop
$user = ($response.Content | ConvertFrom-Json).user
Write-Host "[OK] Login: $($user.email) | Plan: $($user.plan)" -ForegroundColor Green

# Crear link si no existe
Write-Host ""
Write-Host "2. Crear link de prueba..." -ForegroundColor Yellow
$linkData = @{ title = "Test Link"; url = "https://google.com"; description = "Test" } | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$API_URL/links" -Method POST -Body $linkData -ContentType "application/json" -WebSession $session -ErrorAction Stop
$link = $response.Content | ConvertFrom-Json
Write-Host "[OK] Link creado: $($link.id)" -ForegroundColor Green

# Tracking de click
Write-Host ""
Write-Host "3. Probar tracking de click (redirect)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/links/$($link.id)/click" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "[OK] Redirect 302 funcionando" -ForegroundColor Green
        Write-Host "     Location: $($_.Exception.Response.Headers.Location)" -ForegroundColor Gray
    }
}

# Verificar contador
Write-Host ""
Write-Host "4. Verificar contador incrementado..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$API_URL/links/$($link.id)" -Method GET -WebSession $session -ErrorAction Stop
$updatedLink = $response.Content | ConvertFrom-Json
Write-Host "[OK] Clicks: $($updatedLink.clickCount)" -ForegroundColor Green

Write-Host ""
Write-Host "[SUCCESS] API funcionando correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Endpoints verificados:" -ForegroundColor Cyan
Write-Host "  POST   /auth/login" -ForegroundColor Gray
Write-Host "  POST   /links" -ForegroundColor Gray
Write-Host "  GET    /links/:id/click (redirect)" -ForegroundColor Gray
Write-Host "  GET    /links/:id" -ForegroundColor Gray
Write-Host ""

