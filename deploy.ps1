#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Deploy Octopets application to Azure Container Apps
.DESCRIPTION
    This script automates the deployment of the Octopets application using Azure Developer CLI (azd).
    It validates prerequisites, sets up the environment, and deploys all services.
.PARAMETER EnvironmentName
    Name of the azd environment to create/use (e.g., dev, staging, prod)
.PARAMETER Location
    Azure region for deployment (e.g., eastus, westus2)
.PARAMETER OpenAIEndpoint
    Azure AI Foundry endpoint URL
.PARAMETER SkipValidation
    Skip Docker and azd prerequisite checks
.EXAMPLE
    .\deploy.ps1 -EnvironmentName dev -Location eastus -OpenAIEndpoint "https://your-foundry.services.ai.azure.com/..."
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$EnvironmentName = "dev",
    
    [Parameter(Mandatory = $false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory = $false)]
    [string]$OpenAIEndpoint = "",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

# Color output helpers
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Octopets Azure Deployment Script  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Validate prerequisites
if (-not $SkipValidation) {
    Write-Info "Checking prerequisites..."
    
    # Check Azure CLI
    try {
        $azVersion = az version --output json | ConvertFrom-Json
        Write-Success "Azure CLI installed: $($azVersion.'azure-cli')"
    }
    catch {
        Write-Error "Azure CLI not found. Install from: https://learn.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    }
    
    # Check azd
    try {
        $azdVersion = azd version
        Write-Success "Azure Developer CLI installed: $azdVersion"
    }
    catch {
        Write-Error "Azure Developer CLI (azd) not found. Install from: https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd"
        exit 1
    }
    
    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Success "Docker installed: $dockerVersion"
    }
    catch {
        Write-Error "Docker not found. Install from: https://docs.docker.com/get-docker/"
        exit 1
    }
    
    Write-Host ""
}

# Check Azure login
Write-Info "Checking Azure authentication..."
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Success "Logged in to Azure as: $($account.user.name)"
    Write-Info "Subscription: $($account.name) ($($account.id))"
}
catch {
    Write-Warning "Not logged in to Azure"
    Write-Info "Logging in..."
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Azure login failed"
        exit 1
    }
}

Write-Host ""

# Get subscription ID
$subscriptionId = az account show --query id -o tsv
if ([string]::IsNullOrEmpty($subscriptionId)) {
    Write-Error "Could not determine Azure subscription ID"
    exit 1
}

# Get principal ID
$principalId = az ad signed-in-user show --query id -o tsv
if ([string]::IsNullOrEmpty($principalId)) {
    Write-Warning "Could not determine principal ID. You may need to set AZURE_PRINCIPAL_ID manually."
    $principalId = Read-Host "Enter your Azure AD principal ID (or press Enter to skip)"
}

# Prompt for OpenAI endpoint if not provided
if ([string]::IsNullOrEmpty($OpenAIEndpoint)) {
    Write-Warning "Azure OpenAI endpoint not provided"
    Write-Info "You can find this in your Azure AI Foundry project settings"
    Write-Info "Format: https://YOUR_PROJECT.services.ai.azure.com/api/projects/YOUR_PROJECT_ID"
    $OpenAIEndpoint = Read-Host "Enter Azure OpenAI endpoint URL"
    
    if ([string]::IsNullOrEmpty($OpenAIEndpoint)) {
        Write-Error "Azure OpenAI endpoint is required"
        exit 1
    }
}

Write-Host ""
Write-Info "Deployment Configuration:"
Write-Host "  Environment: $EnvironmentName" -ForegroundColor White
Write-Host "  Location: $Location" -ForegroundColor White
Write-Host "  Subscription: $subscriptionId" -ForegroundColor White
Write-Host "  OpenAI Endpoint: $OpenAIEndpoint" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Proceed with deployment? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Warning "Deployment cancelled"
    exit 0
}

Write-Host ""
Write-Info "Creating azd environment: $EnvironmentName"

# Create or select environment
try {
    azd env new $EnvironmentName
    Write-Success "Environment created"
}
catch {
    # Environment might already exist
    Write-Warning "Environment may already exist, selecting it..."
    azd env select $EnvironmentName
}

Write-Host ""
Write-Info "Configuring environment variables..."

# Set environment variables
azd env set AZURE_SUBSCRIPTION_ID $subscriptionId
azd env set AZURE_LOCATION $Location
azd env set AZURE_OPENAI_ENDPOINT $OpenAIEndpoint
azd env set AZURE_OPENAI_DEPLOYMENT "gpt-4o-mini"

if (-not [string]::IsNullOrEmpty($principalId)) {
    azd env set AZURE_PRINCIPAL_ID $principalId
}

Write-Success "Environment configured"
Write-Host ""

# Preview infrastructure
Write-Info "Previewing infrastructure (dry run)..."
Write-Warning "This may take a few minutes..."
Write-Host ""

azd provision --preview --no-prompt

if ($LASTEXITCODE -ne 0) {
    Write-Error "Infrastructure preview failed. Check the errors above."
    exit 1
}

Write-Host ""
$confirmDeploy = Read-Host "Infrastructure preview complete. Deploy now? (y/n)"
if ($confirmDeploy -ne 'y' -and $confirmDeploy -ne 'Y') {
    Write-Warning "Deployment cancelled. You can deploy later with: azd up"
    exit 0
}

Write-Host ""
Write-Info "Starting deployment..."
Write-Warning "This will take 10-15 minutes. Building and pushing Docker images..."
Write-Host ""

# Deploy
azd up --no-prompt

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed. Check the errors above."
    Write-Info "View logs with: azd monitor --logs"
    exit 1
}

Write-Host ""
Write-Success "Deployment completed successfully!"
Write-Host ""

# Get endpoints
Write-Info "Application endpoints:"
Write-Host ""

$envValues = azd env get-values | Out-String

if ($envValues -match 'FRONTEND_URI="([^"]+)"') {
    Write-Host "  Frontend:     " -NoNewline
    Write-Host $matches[1] -ForegroundColor Green
}

if ($envValues -match 'BACKEND_URI="([^"]+)"') {
    Write-Host "  Backend API:  " -NoNewline
    Write-Host $matches[1] -ForegroundColor Green
}

if ($envValues -match 'ORCHESTRATOR_URI="([^"]+)"') {
    Write-Host "  Orchestrator: " -NoNewline
    Write-Host $matches[1] -ForegroundColor Green
}

Write-Host ""
Write-Info "Next steps:"
Write-Host "  1. Open the frontend URL in your browser"
Write-Host "  2. Grant the managed identity access to your AI Foundry project"
Write-Host "  3. Monitor application: azd monitor --logs"
Write-Host "  4. Update deployment: azd deploy"
Write-Host ""
Write-Success "Happy coding! 🚀"
Write-Host ""
