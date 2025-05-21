# Frontend directories
$frontendDirs = @(
    "frontend/src/app/tools/pdf/convert/to-excel",
    "frontend/src/app/tools/pdf/convert/to-word",
    "frontend/src/app/tools/pdf/convert/to-powerpoint",
    "frontend/src/app/tools/pdf/convert/to-images",
    "frontend/src/app/tools/pdf/from/image",
    "frontend/src/app/tools/pdf/from/word",
    "frontend/src/app/tools/pdf/from/excel",
    "frontend/src/app/tools/pdf/from/powerpoint",
    "frontend/src/app/tools/pdf/compress",
    "frontend/src/app/tools/pdf/merge",
    "frontend/src/app/tools/pdf/split",
    "frontend/src/app/tools/pdf/organize",
    "frontend/src/app/tools/image/convert",
    "frontend/src/app/tools/image/remove-background",
    "frontend/src/app/tools/image/compress",
    "frontend/src/app/tools/image/resize",
    "frontend/src/app/tools/image/crop",
    "frontend/src/app/tools/image/rotate",
    "frontend/src/app/tools/calculator/data",
    "frontend/src/app/tools/calculator/health",
    "frontend/src/app/tools/calculator/finance",
    "frontend/src/app/tools/calculator/math"
)

# Python API directories
$pythonApiDirs = @(
    "api-python/src/pdf/convert",
    "api-python/src/pdf/from",
    "api-python/src/image",
    "api-python/src/utils",
    "api-python/src/config"
)

# Node.js API directories
$nodeApiDirs = @(
    "api-node/src/calculator",
    "api-node/src/auth",
    "api-node/src/user",
    "api-node/src/utils",
    "api-node/src/config"
)

# Create directories
foreach ($dir in $frontendDirs + $pythonApiDirs + $nodeApiDirs) {
    New-Item -ItemType Directory -Force -Path $dir
    Write-Host "Created directory: $dir"
}

Write-Host "Project structure setup completed!" 