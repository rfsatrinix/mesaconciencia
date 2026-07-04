# Hook PreToolUse: copia archivos .md de src/content a BCK-src-content antes de modificarlos
# Recibe JSON via stdin con tool_name y tool_input.file_path

$inputData = [Console]::In.ReadToEnd()
if (-not $inputData) { exit 0 }

try {
    $json = $inputData | ConvertFrom-Json
} catch {
    exit 0
}

$filePath = $json.tool_input.file_path
if (-not $filePath) { exit 0 }

# Normalizar separadores
$filePath = $filePath -replace '/', '\'

# Solo archivos .md bajo src\content
if (-not ($filePath -match '\\src\\content\\')) { exit 0 }
if (-not ($filePath -match '\.md$')) { exit 0 }

# Solo si el archivo ya existe (Write puede crear archivos nuevos)
if (-not (Test-Path $filePath)) { exit 0 }

# Extraer raíz del proyecto y ruta relativa dentro de src\content
if ($filePath -match '^(.+)\\src\\content\\(.+)$') {
    $projectRoot = $Matches[1]
    $relativePath = $Matches[2]

    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $relDir = [System.IO.Path]::GetDirectoryName($relativePath)
    $fileName = [System.IO.Path]::GetFileName($relativePath)

    $destDir = Join-Path $projectRoot 'BCK-src-content'
    if ($relDir) {
        $destDir = Join-Path $destDir $relDir
    }

    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }

    $destFile = Join-Path $destDir "$timestamp $fileName"
    Copy-Item -Path $filePath -Destination $destFile
}

exit 0
