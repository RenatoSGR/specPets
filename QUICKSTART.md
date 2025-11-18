# Octopets Deployment Quick Reference

## Prerequisites
- Azure CLI: `az --version`
- Azure Developer CLI: `azd version`
- Docker: `docker --version`
- Azure subscription with appropriate permissions

## Quick Start (5 Minutes)

### 1. Test Docker Builds (Optional)
```powershell
.\test-docker-builds.ps1
```

### 2. Deploy to Azure
```powershell
.\deploy.ps1 -EnvironmentName dev -Location eastus -OpenAIEndpoint "YOUR_FOUNDRY_ENDPOINT"
```

### 3. Grant AI Foundry Access
```bash
# Get managed identity principal ID
az identity list --resource-group rg-{envName} --query "[0].principalId" -o tsv

# Grant role (replace {principalId} and {foundryResourceId})
az role assignment create \
  --assignee {principalId} \
  --role "Cognitive Services OpenAI User" \
  --scope {foundryResourceId}
```

## Common Commands

### Deployment
```bash
# Full deployment (infrastructure + code)
azd up

# Infrastructure only
azd provision

# Code only
azd deploy

# Deploy specific service
azd deploy backend
azd deploy frontend
azd deploy sitter-agent
```

### Monitoring
```bash
# Live logs
azd monitor --logs

# Application Insights
azd monitor

# Specific service logs
az containerapp logs show \
  --name ca-backend-{suffix} \
  --resource-group rg-{envName} \
  --follow
```

### Environment Management
```bash
# Create new environment
azd env new prod

# Select environment
azd env select dev

# Set variables
azd env set AZURE_LOCATION "eastus"
azd env set AZURE_OPENAI_ENDPOINT "https://..."

# View all variables
azd env get-values
```

### Resource Management
```bash
# List resources
az resource list --resource-group rg-{envName} --output table

# View Container App details
az containerapp show \
  --name ca-backend-{suffix} \
  --resource-group rg-{envName}

# Scale Container App
az containerapp update \
  --name ca-backend-{suffix} \
  --resource-group rg-{envName} \
  --min-replicas 1 \
  --max-replicas 20
```

## Environment Variables

### Required
- `AZURE_SUBSCRIPTION_ID` - Your Azure subscription
- `AZURE_LOCATION` - Azure region (e.g., eastus)
- `AZURE_OPENAI_ENDPOINT` - AI Foundry endpoint
- `AZURE_PRINCIPAL_ID` - Your Azure AD principal ID

### Optional
- `AZURE_OPENAI_DEPLOYMENT` - AI model (default: gpt-4o-mini)
- `AZURE_ENV_NAME` - Environment name (default: dev)
- `AZURE_RESOURCE_GROUP` - Custom resource group name

## Service Endpoints

After deployment, get URLs:
```bash
azd env get-values | grep URI
```

- **Frontend**: `FRONTEND_URI` - Main web application
- **Backend**: `BACKEND_URI` - REST API
- **Orchestrator**: `ORCHESTRATOR_URI` - AI orchestrator

## Troubleshooting

### Check Service Health
```bash
# Frontend
curl https://{frontend-uri}

# Backend health endpoint
curl https://{backend-uri}/health

# Orchestrator health
curl https://{orchestrator-uri}/health
```

### View Container App Revisions
```bash
az containerapp revision list \
  --name ca-backend-{suffix} \
  --resource-group rg-{envName} \
  --output table
```

### Restart Container App
```bash
az containerapp revision restart \
  --name ca-backend-{suffix} \
  --resource-group rg-{envName} \
  --revision {revision-name}
```

### Check Container Registry
```bash
# List repositories
az acr repository list --name {registry-name}

# List tags for a repository
az acr repository show-tags \
  --name {registry-name} \
  --repository backend
```

## Cost Management

### View Current Costs
```bash
# Daily costs
az consumption usage list \
  --start-date $(date -d "30 days ago" +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --output table

# Budget alerts
az consumption budget list --output table
```

### Stop Services (Save Costs)
```bash
# Scale to zero (doesn't stop billing completely)
az containerapp update \
  --name ca-{service}-{suffix} \
  --resource-group rg-{envName} \
  --min-replicas 0 \
  --max-replicas 0
```

### Delete Everything
```bash
azd down --force --purge
```

## Local Development

### Run Backend Locally
```bash
cd backend
dotnet run
# Runs on http://localhost:8080
```

### Run Frontend Locally
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Run Python Agent Locally
```bash
cd sitter-agent
uv sync
uv run python app.py
# Runs on http://localhost:8000
```

## CI/CD Integration

### GitHub Actions (Recommended)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - uses: azure/azd-action@v1
        with:
          command: up
```

### Required Secrets
- `AZURE_CREDENTIALS` - Service principal JSON
- `AZURE_ENV_NAME` - Environment name
- `AZURE_LOCATION` - Azure region
- `AZURE_OPENAI_ENDPOINT` - AI Foundry endpoint

## Support Resources

- **Documentation**: See `DEPLOYMENT.md` for detailed guide
- **Infrastructure**: See `infra/README.md` for Bicep details
- **Azure Support**: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade
- **Community**: Stack Overflow (tag: azure-container-apps)

## Quick Reference Links

- [Azure Portal](https://portal.azure.com)
- [Azure Container Apps Docs](https://learn.microsoft.com/azure/container-apps/)
- [azd CLI Reference](https://learn.microsoft.com/azure/developer/azure-developer-cli/reference)
- [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure AI Foundry](https://ai.azure.com)
