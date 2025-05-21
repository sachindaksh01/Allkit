# Directories to remove
$dirsToRemove = @(
    "frontend/src/app/tools/pdf-tools",
    "frontend/src/app/tools/calculators-converters",
    "frontend/src/app/tools/qr-barcode",
    "frontend/src/app/tools/security",
    "frontend/src/app/tools/calculators-and-converters",
    "frontend/src/app/tools/qr-and-barcode-tools",
    "frontend/src/app/tools/security-and-crypto-tools",
    "frontend/src/app/tools/network-and-web-tools",
    "frontend/src/app/tools/code-and-dev-tools",
    "frontend/src/app/tools/data-converters",
    "frontend/src/app/tools/text-and-string-tools",
    "frontend/src/app/tools/document-convert",
    "frontend/src/app/tools/audio-processing-tools",
    "frontend/src/app/tools/video-processing-tools",
    "frontend/src/app/tools/image-tools"
)

# Remove directories
foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "Removed directory: $dir"
    }
}

Write-Host "Cleanup completed!" 