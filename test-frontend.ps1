# Script de pruebas para Sector 4 - Frontend Auth + Dashboard
# Requiere que tanto API (3001) como Web (3000) esten corriendo

Write-Host "PRUEBAS SECTOR 4 - FRONTEND AUTH + DASHBOARD" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion
$API_URL = "http://localhost:3001"
$WEB_URL = "http://localhost:3000"

# Test 1: Verificar que API este corriendo
Write-Host "Test 1: Verificar API corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] API corriendo en $API_URL" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] API no responde en $API_URL" -ForegroundColor Red
    Write-Host "Inicia la API: cd apps/api; pnpm run dev" -ForegroundColor Gray
    exit 1
}

# Test 2: Verificar que Web este corriendo
Write-Host "Test 2: Verificar Web corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $WEB_URL -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Web corriendo en $WEB_URL" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Web no responde en $WEB_URL" -ForegroundColor Red
    Write-Host "Inicia el frontend: cd apps/web; pnpm run dev" -ForegroundColor Gray
    exit 1
}

# Test 3: Registro de nuevo usuario
Write-Host ""
Write-Host "Test 3: Registro de usuario..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUser = @{
    email = "test$timestamp@test.com"
    password = "password123"
    name = "Usuario Test"
} | ConvertTo-Json

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $response = Invoke-WebRequest -Uri "$API_URL/auth/register" `
        -Method POST `
        -Body $testUser `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $user = ($response.Content | ConvertFrom-Json).user
    Write-Host "[OK] Usuario registrado: $($user.email)" -ForegroundColor Green
    Write-Host "     Plan: $($user.plan)" -ForegroundColor Gray
    
    # Verificar cookies
    $cookies = $session.Cookies.GetCookies($API_URL)
    $hasAccessToken = $cookies | Where-Object { $_.Name -eq "accessToken" }
    $hasRefreshToken = $cookies | Where-Object { $_.Name -eq "refreshToken" }
    
    if ($hasAccessToken -and $hasRefreshToken) {
        Write-Host "[OK] Cookies httpOnly seteadas correctamente" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Faltan cookies de autenticacion" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Error en registro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Login
Write-Host ""
Write-Host "Test 4: Login de usuario..." -ForegroundColor Yellow
$loginData = @{
    email = "test$timestamp@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $response = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $user = ($response.Content | ConvertFrom-Json).user
    Write-Host "[OK] Login exitoso: $($user.email)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Obtener usuario actual
Write-Host ""
Write-Host "Test 5: Obtener usuario actual..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/me" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $user = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Usuario obtenido: $($user.email)" -ForegroundColor Green
    Write-Host "     Nombre: $($user.name)" -ForegroundColor Gray
    Write-Host "     Plan: $($user.plan)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error al obtener usuario: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 6: Refresh token
Write-Host ""
Write-Host "Test 6: Refresh token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/refresh" `
        -Method POST `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "[OK] Token refrescado correctamente" -ForegroundColor Green
    
    # Verificar nueva cookie accessToken
    $cookies = $session.Cookies.GetCookies($API_URL)
    $hasAccessToken = $cookies | Where-Object { $_.Name -eq "accessToken" }
    if ($hasAccessToken) {
        Write-Host "[OK] Nueva cookie accessToken generada" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Error en refresh: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 7: Crear perfil
Write-Host ""
Write-Host "Test 7: Crear perfil..." -ForegroundColor Yellow
$profileData = @{
    username = "testuser$timestamp"
    displayName = "Usuario de Prueba"
    bio = "Bio de prueba"
    theme = "default"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/profiles" `
        -Method POST `
        -Body $profileData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $profile = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Perfil creado: @$($profile.username)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al crear perfil: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 8: Crear link
Write-Host ""
Write-Host "Test 8: Crear link..." -ForegroundColor Yellow
$linkData = @{
    title = "Mi GitHub"
    url = "https://github.com/testuser"
    position = 0
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/links" `
        -Method POST `
        -Body $linkData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $link = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Link creado: $($link.title)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al crear link: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 9: Obtener perfil publico
Write-Host ""
Write-Host "Test 9: Obtener perfil publico..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/profiles/username/testuser$timestamp" -Method GET -ErrorAction Stop
    $profile = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Perfil publico obtenido: @$($profile.username)" -ForegroundColor Green
    Write-Host "     Enlaces: $($profile.links.Count)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error al obtener perfil publico: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 10: Logout
Write-Host ""
Write-Host "Test 10: Logout..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/logout" `
        -Method POST `
        -WebSession $session `
        -ErrorAction Stop
    
    Write-Host "[OK] Logout exitoso" -ForegroundColor Green
    
    # Intentar acceder a /auth/me (deberia fallar)
    try {
        Invoke-WebRequest -Uri "$API_URL/auth/me" -Method GET -WebSession $session -ErrorAction Stop
        Write-Host "[WARNING] Aun tiene acceso despues de logout" -ForegroundColor Yellow
    } catch {
        Write-Host "[OK] Sesion cerrada correctamente (401)" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Error en logout: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 11: Login con usuario de prueba
Write-Host ""
Write-Host "Test 11: Login con usuario de prueba (demo)..." -ForegroundColor Yellow
$demoLogin = @{
    email = "demo@multienlace.com"
    password = "password123"
} | ConvertTo-Json

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $response = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method POST `
        -Body $demoLogin `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $user = ($response.Content | ConvertFrom-Json).user
    Write-Host "[OK] Login demo exitoso: $($user.email)" -ForegroundColor Green
    Write-Host "     Plan: $($user.plan)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error en login demo: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[INFO] Ejecutaste los seeds? pnpm prisma db seed" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pruebas manuales en el navegador:" -ForegroundColor Yellow
Write-Host "  1. Ir a http://localhost:3000" -ForegroundColor Gray
Write-Host "  2. Registrarse con un nuevo usuario" -ForegroundColor Gray
Write-Host "  3. Verificar redireccion a /dashboard" -ForegroundColor Gray
Write-Host "  4. Verificar datos en el header" -ForegroundColor Gray
Write-Host "  5. Hacer logout y login de nuevo" -ForegroundColor Gray
Write-Host "  6. Verificar proteccion de rutas (ir a /dashboard sin login)" -ForegroundColor Gray
Write-Host ""
Write-Host "DevTools para verificar:" -ForegroundColor Yellow
Write-Host "  - Application > Cookies > accessToken y refreshToken (httpOnly)" -ForegroundColor Gray
Write-Host "  - Network > Requests > Headers (Set-Cookie)" -ForegroundColor Gray
Write-Host ""
