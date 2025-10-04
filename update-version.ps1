# Script para incrementar la versión automáticamente
$indexPath = "index.html"
$content = Get-Content $indexPath -Raw

# Buscar la versión actual
if ($content -match '\?v=(\d+\.\d+)') {
    $currentVersion = $matches[1]
    $parts = $currentVersion.Split('.')
    $newMinor = [int]$parts[1] + 1
    $newVersion = "$($parts[0]).$newMinor"

    # Reemplazar todas las versiones
    $content = $content -replace '\?v=\d+\.\d+', "?v=$newVersion"

    # Guardar el archivo
    Set-Content -Path $indexPath -Value $content -NoNewline

    Write-Host "Versión actualizada de $currentVersion a $newVersion" -ForegroundColor Green
    Write-Host "Archivos actualizados: styles.css?v=$newVersion y script.js?v=$newVersion" -ForegroundColor Cyan
} else {
    Write-Host "No se encontró patrón de versión" -ForegroundColor Red
}
