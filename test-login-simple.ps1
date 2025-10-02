# ============================================
# TEST SIMPLE DE LOGIN
# ============================================

$API_URL = "http://localhost:3001"

Write-Host "`n=== PRUEBA SIMPLE DE LOGIN ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n1. Login con usuario demo..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$API_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"demo@multienlace.com","password":"password123"}' `
        -SessionVariable session

    Write-Host "✓ Login exitoso" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.email)" -ForegroundColor Green
    Write-Host "Plan: $($loginResponse.user.plan)" -ForegroundColor Green
    
    # Mostrar cookies
    Write-Host "`nCookies recibidas:" -ForegroundColor Cyan
    $session.Cookies.GetCookies($API_URL) | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Value.Substring(0, 20))..." -ForegroundColor Gray
    }
    
} catch {
    Write-Host "✗ Error en login: $_" -ForegroundColor Red
    exit 1
}

# 2. Verificar /auth/me
Write-Host "`n2. Verificando /auth/me con cookies..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-RestMethod `
        -Uri "$API_URL/auth/me" `
        -Method GET `
        -WebSession $session

    Write-Host "✓ /auth/me funciona correctamente" -ForegroundColor Green
    Write-Host "Email: $($meResponse.email)" -ForegroundColor Green
    Write-Host "Plan: $($meResponse.plan)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Error en /auth/me: $_" -ForegroundColor Red
    exit 1
}

# 3. Logout
Write-Host "`n3. Logout..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod `
        -Uri "$API_URL/auth/logout" `
        -Method POST `
        -WebSession $session

    Write-Host "✓ Logout exitoso" -ForegroundColor Green
    Write-Host "Mensaje: $($logoutResponse.message)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Error en logout: $_" -ForegroundColor Red
    exit 1
}

# 4. Verificar que /auth/me falla sin cookies
Write-Host "`n4. Verificando que /auth/me falla sin cookies..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-RestMethod `
        -Uri "$API_URL/auth/me" `
        -Method GET

    Write-Host "✗ /auth/me NO debería funcionar sin cookies" -ForegroundColor Red
    exit 1
    
} catch {
    Write-Host "✓ Correctamente rechazado (401)" -ForegroundColor Green
}

Write-Host "`n=== TODAS LAS PRUEBAS PASARON ===" -ForegroundColor Green

