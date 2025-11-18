#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Test Docker builds locally before deploying to Azure
.DESCRIPTION
    This script builds all Docker images locally to validate Dockerfiles and catch issues early.
.EXAMPLE
    .\test-docker-builds.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Octopets Local Docker Build Test     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
try {
    docker --version | Out-Null
    Write-Success "Docker is running"
}
catch {
    Write-Error "Docker not found or not running"
    exit 1
}

Write-Host ""
Write-Info "Building Docker images..."
Write-Host ""

# Define services
$services = @(
    @{ Name = "backend"; Path = "backend"; Tag = "octopets/backend:test" },
    @{ Name = "frontend"; Path = "frontend"; Tag = "octopets/frontend:test" },
    @{ Name = "sitter-agent"; Path = "sitter-agent"; Tag = "octopets/sitter-agent:test" },
    @{ Name = "orchestrator-agent"; Path = "orchestrator-agent"; Tag = "octopets/orchestrator-agent:test" },
    @{ Name = "booking-agent"; Path = "booking-agent"; Tag = "octopets/booking-agent:test" }
)

$successful = 0
$failed = 0

foreach ($service in $services) {
    Write-Host "Building $($service.Name)..." -ForegroundColor Yellow
    
    try {
        $buildOutput = docker build -t $service.Tag $service.Path 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$($service.Name) built successfully"
            $successful++
        }
        else {
            Write-Error "$($service.Name) build failed"
            Write-Host $buildOutput
            $failed++
        }
    }
    catch {
        Write-Error "$($service.Name) build failed: $_"
        $failed++
    }
    
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Successful: $successful" -ForegroundColor Green
Write-Host "Failed:     $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failed -eq 0) {
    Write-Success "All Docker images built successfully!"
    Write-Info "You can now deploy to Azure with: .\deploy.ps1"
    Write-Host ""
    
    # List images
    Write-Info "Built images:"
    docker images | Select-String "octopets"
    Write-Host ""
    
    # Optional: Test run containers
    $testRun = Read-Host "Test run containers locally? (y/n)"
    if ($testRun -eq 'y' -or $testRun -eq 'Y') {
        Write-Host ""
        Write-Info "Testing backend container..."
        
        try {
            # Run backend in background
            docker run -d -p 8080:8080 --name octopets-backend-test octopets/backend:test
            Start-Sleep -Seconds 5
            
            # Check if container is running
            $running = docker ps --filter "name=octopets-backend-test" --format "{{.Status}}"
            if ($running) {
                Write-Success "Backend container is running"
                Write-Info "Test endpoint: http://localhost:8080/health"
                
                # Try to hit health endpoint
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 5
                    Write-Success "Health check passed: $($response.StatusCode)"
                }
                catch {
                    Write-Warning "Health check endpoint not responding (may need a moment to start)"
                }
            }
            else {
                Write-Error "Backend container failed to start"
                docker logs octopets-backend-test
            }
            
            # Cleanup
            Write-Info "Cleaning up test container..."
            docker stop octopets-backend-test | Out-Null
            docker rm octopets-backend-test | Out-Null
            Write-Success "Cleanup complete"
        }
        catch {
            Write-Error "Container test failed: $_"
            docker stop octopets-backend-test 2>&1 | Out-Null
            docker rm octopets-backend-test 2>&1 | Out-Null
        }
        
        Write-Host ""
    }
}
else {
    Write-Error "Some Docker builds failed. Fix the errors before deploying."
    exit 1
}

Write-Host ""
