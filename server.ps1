# Master Teacher Planner - Lightweight Local PWA Server
$port = 8080
$prefix = "http://localhost:$port/"
$baseDir = $PSScriptRoot

if (-not $baseDir) {
    $baseDir = Get-Location
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " MASTER TEACHER PLANNER - LOCAL PWA SERVER AKTIF" -ForegroundColor Cyan
    Write-Host " URL: $prefix" -ForegroundColor Yellow
    Write-Host " Status: Service Worker & PWA Installation 100% Didukung" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Browser akan terbuka otomatis..."
    Write-Host "Tekan Ctrl + C di jendela ini untuk mematikan server."
    Write-Host ""
    
    Start-Process $prefix
}
catch {
    Write-Host "Port $port sedang digunakan atau izin ditolak. Mencoba port 8081..." -ForegroundColor Yellow
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Start-Process $prefix
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "index.html"
        }

        # Remove query parameters from path if any
        if ($rawPath.Contains("?")) {
            $rawPath = $rawPath.Substring(0, $rawPath.IndexOf("?"))
        }

        $filePath = Join-Path $baseDir $rawPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".webmanifest" { $response.ContentType = "application/manifest+json; charset=utf-8" }
                ".svg" { $response.ContentType = "image/svg+xml" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".ico" { $response.ContentType = "image/x-icon" }
                default { $response.ContentType = "application/octet-stream" }
            }

            # Security and Anti-Cache Headers (Instant Code Updates)
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Pragma", "no-cache")
            $response.AddHeader("Expires", "0")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        }
        else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $rawPath")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
    catch {
        # Catch client aborts or read errors silently
    }
}
