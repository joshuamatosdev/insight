<# 
.SYNOPSIS
    SAMGov Development Helper Script for Windows
.DESCRIPTION
    PowerShell script to manage the SAMGov development environment.
    Equivalent to Makefile commands but native to Windows.
.EXAMPLE
    .\dev.ps1 start      # Start all services
    .\dev.ps1 stop       # Stop all services
    .\dev.ps1 status     # Check service status
#>

param(
    [Parameter(Position=0)]
    [ValidateSet(
        "help", "setup", "start", "stop", "restart", "status",
        "infra", "start-backend", "start-frontend", 
        "stop-backend", "stop-frontend",
        "logs-backend", "logs-frontend",
        "test", "test-backend", "test-frontend",
        "lint", "typecheck", "check",
        "build", "build-backend", "build-frontend",
        "install", "clean", "urls", "env",
        "s3-init", "s3-list"
    )]
    [string]$Command = "help"
)

# Configuration
$BackendPort = 8081
$FrontendPort = 3000
$ProjectRoot = $PSScriptRoot

# Environment variables for local development
$env:REDIS_HOST = "localhost"
$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5433"
$env:ELASTICSEARCH_HOST = "localhost"
$env:SERVER_PORT = $BackendPort
$env:AWS_ENDPOINT_URL = "http://localhost:4566"
$env:AWS_REGION = "us-east-1"
$env:AWS_ACCESS_KEY_ID = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"

function Write-Header($text) {
    Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

function Write-Success($text) {
    Write-Host $text -ForegroundColor Green
}

function Write-Warning($text) {
    Write-Host $text -ForegroundColor Yellow
}

function Write-Error($text) {
    Write-Host $text -ForegroundColor Red
}

function Show-Help {
    Write-Host @"

SAMGov Development Commands (Windows)
=====================================

Quick Start:
  .\dev.ps1 setup          First-time setup
  .\dev.ps1 start          Start infra + backend + frontend
  .\dev.ps1 stop           Stop all services
  .\dev.ps1 status         Check service status

Services:
  .\dev.ps1 infra          Start infrastructure only (Docker)
  .\dev.ps1 start-backend  Start backend (foreground)
  .\dev.ps1 start-frontend Start frontend (foreground)
  .\dev.ps1 stop-backend   Stop backend
  .\dev.ps1 stop-frontend  Stop frontend

S3/Storage:
  .\dev.ps1 s3-init        Initialize S3 buckets in LocalStack
  .\dev.ps1 s3-list        List S3 buckets

Testing:
  .\dev.ps1 test           Run all tests
  .\dev.ps1 lint           Run linter
  .\dev.ps1 typecheck      Run TypeScript check
  .\dev.ps1 check          Run all checks

Build:
  .\dev.ps1 build          Build backend + frontend
  .\dev.ps1 install        Install dependencies

Other:
  .\dev.ps1 urls           Show service URLs
  .\dev.ps1 env            Show environment config
  .\dev.ps1 clean          Stop and clean up

"@ -ForegroundColor White
}

function Start-Infrastructure {
    Write-Header "Starting Infrastructure"
    docker-compose up -d postgres redis elasticsearch localstack
    Write-Success "Infrastructure running (including S3 via LocalStack)."
}

function Start-Backend {
    Write-Header "Starting Backend on port $BackendPort"
    Set-Location $ProjectRoot
    $env:SERVER_PORT = $BackendPort
    $env:REDIS_HOST = "localhost"
    & .\gradlew.bat bootRun --no-daemon
}

function Start-Frontend {
    Write-Header "Starting Frontend on port $FrontendPort"
    Set-Location "$ProjectRoot\sam-dashboard"
    npm run dev
}

function Stop-Backend {
    Write-Header "Stopping Backend"
    $processes = Get-Process -Name "java" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*bootRun*" -or $_.CommandLine -like "*samgov*" }
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Success "Backend stopped."
    } else {
        Write-Warning "No backend process found."
    }
}

function Stop-Frontend {
    Write-Header "Stopping Frontend"
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Success "Frontend stopped."
    } else {
        Write-Warning "No frontend process found."
    }
}

function Stop-All {
    Write-Header "Stopping All Services"
    
    # Stop Node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop Java/Gradle processes
    Get-Process -Name "java" -ErrorAction SilentlyContinue | 
        Where-Object { $_.Path -like "*gradle*" -or $_.CommandLine -like "*bootRun*" } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop Docker services
    docker-compose stop
    
    Write-Success "All services stopped."
}

function Start-All {
    Write-Header "Starting All Services"
    
    # Start infrastructure
    Start-Infrastructure
    Start-Sleep -Seconds 3
    
    Write-Host "`nStarting backend and frontend..." -ForegroundColor Cyan
    Write-Host "Backend will start in a new terminal." -ForegroundColor Yellow
    Write-Host "Frontend will start in another terminal." -ForegroundColor Yellow
    
    # Start backend in new terminal
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot'; `$env:SERVER_PORT='$BackendPort'; `$env:REDIS_HOST='localhost'; .\gradlew.bat bootRun --no-daemon"
    
    # Start frontend in new terminal
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot\sam-dashboard'; npm run dev"
    
    Start-Sleep -Seconds 2
    
    Write-Success "`nAll services starting!"
    Show-Urls
}

function Show-Status {
    Write-Header "Service Status"
    
    Write-Host "`nDocker Services:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host "`nLocal Processes:" -ForegroundColor Cyan
    
    $java = Get-Process -Name "java" -ErrorAction SilentlyContinue
    if ($java) {
        Write-Host "  Backend:  Running (Java)" -ForegroundColor Green
    } else {
        Write-Host "  Backend:  Not running" -ForegroundColor Yellow
    }
    
    $node = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($node) {
        Write-Host "  Frontend: Running (Node)" -ForegroundColor Green
    } else {
        Write-Host "  Frontend: Not running" -ForegroundColor Yellow
    }
}

function Show-Urls {
    Write-Host @"

Service URLs:
  Frontend:      http://localhost:$FrontendPort
  Backend API:   http://localhost:$BackendPort
  PostgreSQL:    localhost:5433
  Redis:         localhost:6379
  Elasticsearch: localhost:9200
  LocalStack/S3: http://localhost:4566

"@ -ForegroundColor Cyan
}

function Show-Env {
    Write-Host @"

Environment Configuration:
  BACKEND_PORT:       $BackendPort
  FRONTEND_PORT:      $FrontendPort
  REDIS_HOST:         $env:REDIS_HOST
  POSTGRES_HOST:      $env:POSTGRES_HOST
  POSTGRES_PORT:      $env:POSTGRES_PORT
  ELASTICSEARCH_HOST: $env:ELASTICSEARCH_HOST

"@ -ForegroundColor Cyan
}

function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    Set-Location $ProjectRoot
    Write-Host "Installing Gradle dependencies..." -ForegroundColor Cyan
    & .\gradlew.bat dependencies --quiet
    
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    Set-Location "$ProjectRoot\sam-dashboard"
    npm install
    
    Set-Location $ProjectRoot
    Write-Success "Dependencies installed."
}

function Invoke-Setup {
    Write-Header "Setting Up SAMGov Development Environment"
    
    Set-Location $ProjectRoot
    
    # Copy .env if needed
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example" -ForegroundColor Green
    }
    
    # Install dependencies
    Install-Dependencies
    
    # Start infrastructure
    Start-Infrastructure
    
    Write-Host "`nWaiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Initialize S3 buckets
    Write-Host "Initializing S3 buckets..." -ForegroundColor Cyan
    docker-compose exec -T localstack awslocal s3 mb s3://samgov-documents 2>$null
    docker-compose exec -T localstack awslocal s3 mb s3://samgov-attachments 2>$null
    docker-compose exec -T localstack awslocal s3 mb s3://samgov-exports 2>$null
    
    Write-Success "`nSetup complete!"
    Write-Host @"

Services running:
  PostgreSQL:    localhost:5433
  Redis:         localhost:6379
  Elasticsearch: localhost:9200
  LocalStack/S3: localhost:4566

Next steps:
  .\dev.ps1 start          Start backend + frontend
  .\dev.ps1 start-backend  Start backend only
  .\dev.ps1 start-frontend Start frontend only

"@ -ForegroundColor Cyan
}

function Invoke-Tests {
    Write-Header "Running All Tests"
    
    Set-Location $ProjectRoot
    Write-Host "Running backend tests..." -ForegroundColor Cyan
    & .\gradlew.bat test
    
    Write-Host "Running frontend tests..." -ForegroundColor Cyan
    Set-Location "$ProjectRoot\sam-dashboard"
    npm test
    
    Set-Location $ProjectRoot
}

function Invoke-Lint {
    Write-Header "Running Linter"
    Set-Location "$ProjectRoot\sam-dashboard"
    npm run lint
    Set-Location $ProjectRoot
}

function Invoke-Typecheck {
    Write-Header "Running TypeScript Check"
    Set-Location "$ProjectRoot\sam-dashboard"
    npx tsc --noEmit
    Set-Location $ProjectRoot
}

function Invoke-Check {
    Invoke-Lint
    Invoke-Typecheck
    Invoke-Tests
}

function Invoke-Build {
    Write-Header "Building Project"
    
    Set-Location $ProjectRoot
    Write-Host "Building backend..." -ForegroundColor Cyan
    & .\gradlew.bat build -x test
    
    Write-Host "Building frontend..." -ForegroundColor Cyan
    Set-Location "$ProjectRoot\sam-dashboard"
    npm run build
    
    Set-Location $ProjectRoot
    Write-Success "Build complete."
}

function Invoke-Clean {
    Write-Header "Cleaning Up"
    Stop-All
    docker-compose down --remove-orphans
    Remove-Item -Path "logs\*.log" -ErrorAction SilentlyContinue
    Write-Success "Cleanup complete."
}

function Initialize-S3 {
    Write-Header "Initializing S3 Buckets"
    docker-compose exec -T localstack awslocal s3 mb s3://samgov-documents 2>$null
    docker-compose exec -T localstack awslocal s3 mb s3://samgov-attachments 2>$null
    docker-compose exec -T localstack awslocal s3 mb s3://samgov-exports 2>$null
    Write-Success "S3 buckets initialized."
    docker-compose exec localstack awslocal s3 ls
}

function Get-S3Buckets {
    Write-Header "S3 Buckets"
    docker-compose exec localstack awslocal s3 ls
}

# Main command router
switch ($Command) {
    "help"           { Show-Help }
    "setup"          { Invoke-Setup }
    "start"          { Start-All }
    "stop"           { Stop-All }
    "restart"        { Stop-All; Start-All }
    "status"         { Show-Status }
    "infra"          { Start-Infrastructure }
    "start-backend"  { Start-Backend }
    "start-frontend" { Start-Frontend }
    "stop-backend"   { Stop-Backend }
    "stop-frontend"  { Stop-Frontend }
    "logs-backend"   { Get-Content "logs\backend.log" -Wait -Tail 50 }
    "logs-frontend"  { Get-Content "logs\frontend.log" -Wait -Tail 50 }
    "test"           { Invoke-Tests }
    "test-backend"   { Set-Location $ProjectRoot; .\gradlew.bat test }
    "test-frontend"  { Set-Location "$ProjectRoot\sam-dashboard"; npm test }
    "lint"           { Invoke-Lint }
    "typecheck"      { Invoke-Typecheck }
    "check"          { Invoke-Check }
    "build"          { Invoke-Build }
    "build-backend"  { Set-Location $ProjectRoot; .\gradlew.bat build -x test }
    "build-frontend" { Set-Location "$ProjectRoot\sam-dashboard"; npm run build }
    "install"        { Install-Dependencies }
    "clean"          { Invoke-Clean }
    "urls"           { Show-Urls }
    "env"            { Show-Env }
    "s3-init"        { Initialize-S3 }
    "s3-list"        { Get-S3Buckets }
    default          { Show-Help }
}
