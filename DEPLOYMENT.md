# Octopets Azure Deployment Guide

This guide will help you deploy the Octopets application to Azure Container Apps using Azure Developer CLI (azd).

## Prerequisites

1. **Azure CLI** - [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
2. **Azure Developer CLI (azd)** - [Install azd](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd)
3. **Docker** - [Install Docker](https://docs.docker.com/get-docker/)
4. **Azure Subscription** - Active Azure subscription
5. **Azure AI Foundry** - Pre-configured Azure AI Foundry project with agents

## Architecture Overview

The application consists of 5 services deployed as Azure Container Apps:

1. **Backend API** (.NET 9.0) - ASP.NET Core REST API
2. **Frontend** (React 18) - Static web application served by nginx
3. **Sitter Agent** (Python) - AI agent for pet sitter recommendations
4. **Orchestrator Agent** (Python) - Multi-agent coordination
5. **Booking Agent** (Python) - Booking assistance AI agent

### Azure Resources Created

- **Azure Container Apps** - 5 container apps (one per service)
- **Container Apps Environment** - Shared environment for all apps
- **Azure Container Registry** - Private registry for container images
- **Log Analytics Workspace** - Centralized logging
- **Application Insights** - Application performance monitoring
- **User-Assigned Managed Identity** - For secure Azure resource access

## Step-by-Step Deployment

### 1. Login to Azure

```bash
# Login to Azure CLI
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Login to azd
azd auth login
```

### 2. Initialize azd Environment

```bash
# Create a new environment (replace 'dev' with your environment name)
azd env new dev

# This creates .azure/dev/.env file for environment variables
```

### 3. Configure Environment Variables

Set the required environment variables:

```bash
# Required: Azure subscription ID
azd env set AZURE_SUBSCRIPTION_ID "0e9d74fe-17e8-456f-a6e2-bd7602010688"

# Required: Azure location (e.g., eastus, westus2, etc.)
azd env set AZURE_LOCATION "eastus"

# Required: Your Azure AD user/service principal ID
azd env set AZURE_PRINCIPAL_ID $(az ad signed-in-user show --query id -o tsv)

# Required: Azure AI Foundry endpoint
azd env set AZURE_OPENAI_ENDPOINT "https://YOUR_FOUNDRY_PROJECT.services.ai.azure.com/api/projects/YOUR_PROJECT"

# Optional: AI model deployment name (defaults to gpt-4o-mini)
azd env set AZURE_OPENAI_DEPLOYMENT "gpt-4o-mini"
```

### 4. Create Resource Group (Optional)

If you want to use a specific resource group:

```bash
# Create resource group
az group create --name rg-octopets-dev --location eastus

# Set in environment
azd env set AZURE_RESOURCE_GROUP "rg-octopets-dev"
```

### 5. Preview Infrastructure

Dry run to validate Bicep templates:

```bash
azd provision --preview --no-prompt
```

This will show you what resources will be created without actually creating them.

### 6. Deploy to Azure

Deploy everything (infrastructure + application):

```bash
azd up --no-prompt
```

This command will:
1. Provision all Azure resources (Container Apps, ACR, monitoring, etc.)
2. Build Docker images for all 5 services
3. Push images to Azure Container Registry
4. Deploy container apps with the images
5. Configure environment variables and networking

**Deployment typically takes 10-15 minutes.**

### 7. Verify Deployment

Check the deployment status:

```bash
# Get app logs
azd monitor --logs

# Get service endpoints
azd env get-values
```

Access the application:
- Frontend URL will be displayed in the output as `FRONTEND_URI`
- Backend API URL will be `BACKEND_URI`
- Orchestrator Agent URL will be `ORCHESTRATOR_URI`

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_LOCATION` | Azure region for deployment | `eastus` |
| `AZURE_PRINCIPAL_ID` | Your Azure AD user/principal ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_OPENAI_ENDPOINT` | Azure AI Foundry project endpoint | `https://YOUR_FOUNDRY.services.ai.azure.com/...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_OPENAI_DEPLOYMENT` | AI model deployment name | `gpt-4o-mini` |
| `AZURE_ENV_NAME` | Environment name | Prompted during `azd env new` |
| `AZURE_RESOURCE_GROUP` | Resource group name | Auto-generated: `rg-{envName}` |

## Connecting to Azure AI Foundry

Your Python agents require access to Azure AI Foundry. Ensure:

1. **Agent is created in Azure AI Foundry** - Use the Azure AI Foundry portal
2. **Managed Identity has access** - Grant the user-assigned managed identity access to your AI Foundry project
3. **Endpoint is correct** - Use the full project endpoint URL including `/api/projects/{projectId}`

### Grant Managed Identity Access

After deployment, grant the managed identity access to AI Foundry:

```bash
# Get the managed identity principal ID
IDENTITY_PRINCIPAL_ID=$(az identity show \
  --name $(azd env get-values | grep AZURE_CONTAINER_REGISTRY_NAME | cut -d'=' -f2 | xargs)-identity \
  --resource-group $(azd env get-values | grep AZURE_RESOURCE_GROUP | cut -d'=' -f2) \
  --query principalId -o tsv)

# Assign "Cognitive Services OpenAI User" role
az role assignment create \
  --assignee $IDENTITY_PRINCIPAL_ID \
  --role "Cognitive Services OpenAI User" \
  --scope "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_AI_FOUNDRY_RG/providers/Microsoft.CognitiveServices/accounts/YOUR_AI_FOUNDRY_ACCOUNT"
```

## Updating the Application

To update after making code changes:

```bash
# Rebuild and redeploy all services
azd deploy
```

To update specific service only:

```bash
# Deploy only backend
azd deploy backend

# Deploy only frontend
azd deploy frontend
```

## Monitoring and Troubleshooting

### View Application Logs

```bash
# Live logs from all services
azd monitor --logs

# Logs from specific service
az containerapp logs show \
  --name ca-backend-XXXXX \
  --resource-group rg-octopets-dev \
  --follow
```

### View Application Insights

```bash
# Open Application Insights in browser
azd monitor
```

### Common Issues

**Issue: Container fails to start**
- Check logs: `azd monitor --logs`
- Verify environment variables are set correctly
- Ensure Docker images built successfully

**Issue: Python agents can't access AI Foundry**
- Verify `AZURE_OPENAI_ENDPOINT` is correct
- Check managed identity has "Cognitive Services OpenAI User" role
- Ensure AI Foundry project allows managed identity access

**Issue: Frontend can't reach backend**
- Check CORS configuration in backend
- Verify `REACT_APP_API_URL` environment variable
- Check backend container app is running

## Cleanup

To delete all Azure resources:

```bash
# Delete everything
azd down --force --purge --no-prompt
```

## Cost Optimization

For development/testing:
- Container Apps: Free tier available (0.5 vCPU, 1 GB memory)
- Container Registry: Basic tier ($0.167/day)
- Log Analytics: First 5 GB/month free
- Application Insights: First 5 GB/month free

**Estimated monthly cost: $10-30 for dev/test workloads**

For production:
- Scale Container Apps based on load (auto-scaling enabled)
- Consider Azure OpenAI pricing based on token usage
- Monitor costs with Azure Cost Management

## Next Steps

1. **Configure Custom Domain** - Add custom domain to frontend Container App
2. **Enable Authentication** - Add Azure AD B2C authentication
3. **Set up CI/CD** - Automate deployment with GitHub Actions
4. **Production Database** - Replace in-memory DB with PostgreSQL or Cosmos DB
5. **Enable HTTPS** - Configure TLS certificates for custom domains

## Support

For issues or questions:
- Check Azure Container Apps documentation: https://learn.microsoft.com/azure/container-apps/
- Check azd documentation: https://learn.microsoft.com/azure/developer/azure-developer-cli/
- Review Application Insights for errors and performance issues
