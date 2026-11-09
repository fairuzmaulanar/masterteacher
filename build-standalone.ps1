# Master Teacher Planner - Compile & Sync Modular Templates & Modals
$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$viewsDir = Join-Path $baseDir "views"
$modalsPath = Join-Path $baseDir "modals\modals.html"

# 1. Compile & synchronize views/templates.js (CORS-free in-memory cache)
$templatesObj = [ordered]@{}
$viewFiles = [ordered]@{
    "view-planner"    = "planner.html"
    "view-timetable"  = "timetable.html"
    "view-gradebook"  = "gradebook.html"
    "view-classroom"  = "classroom.html"
    "view-tasks"      = "tasks.html"
    "view-ai-export"  = "ai-export.html"
    "view-repository"     = "repository.html"
    "view-questions"      = "questions.html"
    "view-student-detail" = "student-detail.html"
    "view-school-profile" = "school-profile.html"
}
foreach ($key in $viewFiles.Keys) {
    $vFile = Join-Path $viewsDir $viewFiles[$key]
    if (Test-Path $vFile) {
        $templatesObj[$key] = [System.IO.File]::ReadAllText($vFile, [System.Text.Encoding]::UTF8)
    }
}
$templatesJson = $templatesObj | ConvertTo-Json -Compress
$templatesJsContent = "// MASTER TEACHER PLANNER - MODULAR VIEW TEMPLATES`r`n// CORS-Free In-Memory Cache for file://, http://, and PWA`r`nwindow.MTP_TEMPLATES = $templatesJson;`r`n"
$templatesJsPath = Join-Path $viewsDir "templates.js"
[System.IO.File]::WriteAllText($templatesJsPath, $templatesJsContent, [System.Text.Encoding]::UTF8)
Write-Host "Tersinkronisasi: $templatesJsPath" -ForegroundColor Green

# 2. Compile & synchronize modals/modals.js
if (Test-Path $modalsPath) {
    $modalsRaw = [System.IO.File]::ReadAllText($modalsPath, [System.Text.Encoding]::UTF8)
    $modalsJson = $modalsRaw | ConvertTo-Json -Compress
    $modalsJsContent = "// MASTER TEACHER PLANNER - MODULAR DIALOG MODALS`r`n// CORS-Free In-Memory Cache for file://, http://, and PWA`r`nwindow.MTP_MODALS = $modalsJson;`r`n"
    $modalsJsPath = Join-Path $baseDir "modals\modals.js"
    [System.IO.File]::WriteAllText($modalsJsPath, $modalsJsContent, [System.Text.Encoding]::UTF8)
    Write-Host "Tersinkronisasi: $modalsJsPath" -ForegroundColor Green
}

Write-Host "SELURUH TEMPLATE & MODAL BERHASIL DISINKRONKAN!" -ForegroundColor Green
