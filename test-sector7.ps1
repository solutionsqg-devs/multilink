# Test Sector 7: Analytics
# Prueba las funcionalidades de analiticas FREE vs PRO

$API_URL = "http://localhost:3001"
$WEB_URL = "http://localhost:3000"

Write-Host "Testing Sector 7: Analytics" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Login como usuario existente
Write-Host "1. Iniciando sesion..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"quimey@test.com","password":"password123"}' `
    -SessionVariable session

if ($loginResponse.StatusCode -eq 200) {
    Write-Host "[OK] Login exitoso" -ForegroundColor Green
    
    $cookies = $session.Cookies.GetCookies($API_URL)
    $accessToken = ($cookies | Where-Object { $_.Name -eq "access_token" }).Value
    $refreshToken = ($cookies | Where-Object { $_.Name -eq "refresh_token" }).Value
    
    Write-Host "   Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "[ERROR] Error en login" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Obtener analytics overview
Write-Host "2. Obteniendo analytics overview..." -ForegroundColor Yellow
$overviewResponse = Invoke-WebRequest -Uri "$API_URL/analytics/overview" `
    -Method GET `
    -WebSession $session

if ($overviewResponse.StatusCode -eq 200) {
    Write-Host "[OK] Analytics overview obtenido" -ForegroundColor Green
    $overview = $overviewResponse.Content | ConvertFrom-Json
    
    Write-Host "   Total Links: $($overview.totalLinks)" -ForegroundColor Gray
    Write-Host "   Total Clicks: $($overview.totalClicks)" -ForegroundColor Gray
    
    if ($overview.profileViews) {
        Write-Host "   Profile Views (PRO): $($overview.profileViews)" -ForegroundColor Magenta
    }
    
    if ($overview.clicksLast7Days) {
        Write-Host "   Clicks Last 7 Days (PRO): $($overview.clicksLast7Days)" -ForegroundColor Magenta
    }
    
    Write-Host "   Top Links:" -ForegroundColor Gray
    foreach ($link in $overview.topLinks | Select-Object -First 3) {
        Write-Host "     - $($link.title): $($link.clickCount) clicks" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERROR] Error al obtener overview" -ForegroundColor Red
}

Write-Host ""

# 3. Obtener lista de links
Write-Host "3. Obteniendo lista de links..." -ForegroundColor Yellow
$linksResponse = Invoke-WebRequest -Uri "$API_URL/links" `
    -Method GET `
    -WebSession $session

if ($linksResponse.StatusCode -eq 200) {
    $links = $linksResponse.Content | ConvertFrom-Json
    
    if ($links.Count -gt 0) {
        $firstLink = $links[0]
        Write-Host "[OK] Links obtenidos ($($links.Count) total)" -ForegroundColor Green
        Write-Host "   Primer link: $($firstLink.title) (ID: $($firstLink.id))" -ForegroundColor Gray
        
        # 4. Obtener analytics de un link especifico
        Write-Host ""
        Write-Host "4. Obteniendo analytics del link '$($firstLink.title)'..." -ForegroundColor Yellow
        $linkAnalyticsResponse = Invoke-WebRequest -Uri "$API_URL/analytics/link/$($firstLink.id)" `
            -Method GET `
            -WebSession $session
        
        if ($linkAnalyticsResponse.StatusCode -eq 200) {
            Write-Host "[OK] Analytics del link obtenido" -ForegroundColor Green
            $linkAnalytics = $linkAnalyticsResponse.Content | ConvertFrom-Json
            
            Write-Host "   Total Clicks: $($linkAnalytics.totalClicks)" -ForegroundColor Gray
            
            if ($linkAnalytics.clicksByDay) {
                Write-Host "   Clicks By Day (PRO): $($linkAnalytics.clicksByDay.Count) dias" -ForegroundColor Magenta
            }
            
            if ($linkAnalytics.topReferrers) {
                Write-Host "   Top Referrers (PRO): $($linkAnalytics.topReferrers.Count) referrers" -ForegroundColor Magenta
            }
            
            if ($linkAnalytics.devices) {
                Write-Host "   Devices (PRO):" -ForegroundColor Magenta
                Write-Host "     - Mobile: $($linkAnalytics.devices.mobile)" -ForegroundColor Gray
                Write-Host "     - Desktop: $($linkAnalytics.devices.desktop)" -ForegroundColor Gray
                Write-Host "     - Tablet: $($linkAnalytics.devices.tablet)" -ForegroundColor Gray
            }
        } else {
            Write-Host "[ERROR] Error al obtener analytics del link" -ForegroundColor Red
        }
    } else {
        Write-Host "[WARNING] No hay links para analizar" -ForegroundColor Yellow
        Write-Host "   Crea algunos links en $WEB_URL/dashboard/links" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERROR] Error al obtener links" -ForegroundColor Red
}

Write-Host ""

# 5. Simular un click
if ($links.Count -gt 0) {
    $linkToClick = $links[0]
    Write-Host "5. Simulando click en '$($linkToClick.title)'..." -ForegroundColor Yellow
    
    try {
        $clickResponse = Invoke-WebRequest -Uri "$API_URL/links/$($linkToClick.id)/click" `
            -Method GET `
            -MaximumRedirection 0 `
            -ErrorAction SilentlyContinue
        
        Write-Host "[OK] Click registrado (redirect a $($linkToClick.url))" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 302) {
            Write-Host "[OK] Click registrado (redirect exitoso)" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Error al registrar click: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Visita $WEB_URL/dashboard/analytics para ver la pagina de analytics" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[OK] Todas las pruebas completadas!" -ForegroundColor Green
