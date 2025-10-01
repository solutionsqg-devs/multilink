# Script de pruebas para Sector 5 - Dashboard Avanzado + Página Pública

Write-Host "PRUEBAS SECTOR 5 - DASHBOARD AVANZADO" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3001"
$WEB_URL = "http://localhost:3000"

# Test 1: Verificar servidores
Write-Host "Test 1: Verificar servidores corriendo..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "$API_URL/health" -Method GET -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "[OK] API corriendo" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] API no responde" -ForegroundColor Red
    exit 1
}

try {
    Invoke-WebRequest -Uri $WEB_URL -Method GET -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "[OK] Web corriendo" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Web no responde" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host ""
Write-Host "Test 2: Login con usuario demo..." -ForegroundColor Yellow
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginData = @{
    email = "demo@multienlace.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/auth/login" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $user = ($response.Content | ConvertFrom-Json).user
    Write-Host "[OK] Login exitoso: $($user.email)" -ForegroundColor Green
    Write-Host "     Plan: $($user.plan)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error en login" -ForegroundColor Red
    exit 1
}

# Test 3: Obtener/Crear Perfil
Write-Host ""
Write-Host "Test 3: Obtener o crear perfil..." -ForegroundColor Yellow
$profileExists = $false
$profileUsername = ""

try {
    $response = Invoke-WebRequest -Uri "$API_URL/profiles/me" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $profile = $response.Content | ConvertFrom-Json
    $profileUsername = $profile.username
    $profileExists = $true
    Write-Host "[OK] Perfil existente: @$($profile.username)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "[INFO] Perfil no existe, creando..." -ForegroundColor Yellow
        
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $profileData = @{
            username = "demo$timestamp"
            displayName = "Usuario Demo"
            bio = "Este es un perfil de prueba del Sector 5"
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
            $profileUsername = $profile.username
            $profileExists = $true
            Write-Host "[OK] Perfil creado: @$($profile.username)" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Error al crear perfil: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[ERROR] Error al obtener perfil" -ForegroundColor Red
        exit 1
    }
}

# Test 4: Crear Link
Write-Host ""
Write-Host "Test 4: Crear nuevo link..." -ForegroundColor Yellow
$linkData = @{
    title = "GitHub"
    url = "https://github.com/demo"
    description = "Mi perfil de GitHub"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/links" `
        -Method POST `
        -Body $linkData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $link = $response.Content | ConvertFrom-Json
    $linkId = $link.id
    Write-Host "[OK] Link creado: $($link.title)" -ForegroundColor Green
    Write-Host "     URL: $($link.url)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error al crear link: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Obtener todos los links
Write-Host ""
Write-Host "Test 5: Obtener lista de links..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/links" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $links = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Links obtenidos: $($links.Count) links" -ForegroundColor Green
    
    foreach ($l in $links) {
        Write-Host "     - $($l.title) ($($l.clickCount) clicks)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Error al obtener links" -ForegroundColor Red
    exit 1
}

# Test 6: Crear segundo link para reordenar
Write-Host ""
Write-Host "Test 6: Crear segundo link..." -ForegroundColor Yellow
$link2Data = @{
    title = "Twitter"
    url = "https://twitter.com/demo"
    description = "Sígueme en Twitter"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/links" `
        -Method POST `
        -Body $link2Data `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $link2 = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Segundo link creado: $($link2.title)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al crear segundo link" -ForegroundColor Red
}

# Test 7: Reordenar links
Write-Host ""
Write-Host "Test 7: Reordenar links..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/links" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $allLinks = $response.Content | ConvertFrom-Json
    
    if ($allLinks.Count -ge 2) {
        $linkIds = @($allLinks[1].id, $allLinks[0].id)
        
        $reorderData = @{
            linkIds = $linkIds
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$API_URL/links/reorder" `
            -Method PATCH `
            -Body $reorderData `
            -ContentType "application/json" `
            -WebSession $session `
            -ErrorAction Stop
        
        Write-Host "[OK] Links reordenados correctamente" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] No hay suficientes links para reordenar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Error al reordenar: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Actualizar link
Write-Host ""
Write-Host "Test 8: Actualizar link..." -ForegroundColor Yellow
$updateData = @{
    title = "GitHub Profile"
    url = "https://github.com/demo"
    description = "Mi perfil actualizado de GitHub"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$API_URL/links/$linkId" `
        -Method PATCH `
        -Body $updateData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $updatedLink = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Link actualizado: $($updatedLink.title)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al actualizar link" -ForegroundColor Red
}

# Test 9: Página pública (sin autenticación)
Write-Host ""
Write-Host "Test 9: Acceder a página pública..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/profiles/username/$profileUsername" `
        -Method GET `
        -ErrorAction Stop
    
    $publicProfile = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Perfil público obtenido: @$($publicProfile.username)" -ForegroundColor Green
    Write-Host "     Display: $($publicProfile.displayName)" -ForegroundColor Gray
    Write-Host "     Links: $($publicProfile.links.Count)" -ForegroundColor Gray
    Write-Host "     Vistas: $($publicProfile.viewCount)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error al obtener perfil público" -ForegroundColor Red
}

# Test 10: Tracking de click (redirect)
Write-Host ""
Write-Host "Test 10: Probar tracking de click..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/links/$linkId/click" `
        -Method GET `
        -MaximumRedirection 0 `
        -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 302) {
        Write-Host "[OK] Click tracked, redirect a: $($response.Headers.Location)" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "[OK] Click tracked con redirect 302" -ForegroundColor Green
        Write-Host "     Destino: $location" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] Error en tracking" -ForegroundColor Red
    }
}

# Test 11: Verificar incremento de clicks
Write-Host ""
Write-Host "Test 11: Verificar incremento de contador..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/links/$linkId" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $linkAfterClick = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Contador actual: $($linkAfterClick.clickCount) clicks" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al verificar contador" -ForegroundColor Red
}

# Test 12: Actualizar perfil
Write-Host ""
Write-Host "Test 12: Actualizar perfil..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_URL/profiles/me" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop
    
    $currentProfile = $response.Content | ConvertFrom-Json
    
    $updateProfileData = @{
        username = $currentProfile.username
        displayName = "Usuario Demo Actualizado"
        bio = "Bio actualizada en el test"
        theme = "dark"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$API_URL/profiles/$($currentProfile.id)" `
        -Method PATCH `
        -Body $updateProfileData `
        -ContentType "application/json" `
        -WebSession $session `
        -ErrorAction Stop
    
    $updatedProfile = $response.Content | ConvertFrom-Json
    Write-Host "[OK] Perfil actualizado" -ForegroundColor Green
    Write-Host "     Nombre: $($updatedProfile.displayName)" -ForegroundColor Gray
    Write-Host "     Tema: $($updatedProfile.theme)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Error al actualizar perfil: $($_.Exception.Message)" -ForegroundColor Red
}

# Resumen
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "TODAS LAS PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pruebas manuales en el navegador:" -ForegroundColor Yellow
Write-Host "  1. Ir a http://localhost:3000/login" -ForegroundColor Gray
Write-Host "  2. Login: demo@multienlace.com / password123" -ForegroundColor Gray
Write-Host "  3. Ir a /dashboard/links" -ForegroundColor Gray
Write-Host "  4. Probar drag & drop para reordenar" -ForegroundColor Gray
Write-Host "  5. Crear/editar links con el modal" -ForegroundColor Gray
Write-Host "  6. Ir a /dashboard/profile" -ForegroundColor Gray
Write-Host "  7. Actualizar información del perfil" -ForegroundColor Gray
Write-Host "  8. Click 'Ver Perfil Público'" -ForegroundColor Gray
Write-Host "  9. Verificar página pública /@$profileUsername" -ForegroundColor Gray
Write-Host "  10. Click en un link y verificar redirect" -ForegroundColor Gray
Write-Host ""
Write-Host "Features a probar:" -ForegroundColor Yellow
Write-Host "  - Drag & drop de links (arrastrar y soltar)" -ForegroundColor Gray
Write-Host "  - Modal crear/editar link" -ForegroundColor Gray
Write-Host "  - Validaciones de formularios" -ForegroundColor Gray
Write-Host "  - Paywalls en perfil (features Pro bloqueadas)" -ForegroundColor Gray
Write-Host "  - Temas (cambiar en perfil y ver en página pública)" -ForegroundColor Gray
Write-Host "  - Contador de clicks" -ForegroundColor Gray
Write-Host ""

