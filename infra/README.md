# Octopets Infrastructure

This directory contains the Azure infrastructure-as-code (IaC) using Bicep templates for deploying Octopets to Azure Container Apps.

## Structure

```
infra/
├── main.bicep                              # Main infrastructure template
├── main.parameters.json                    # Environment parameters
├── abbreviations.json                      # Azure resource naming conventions
└── core/                                   # Reusable Bicep modules
    ├── host/
    │   ├── container-app.bicep            # Container App module
    │   ├── container-apps-environment.bicep # Container Apps Environment
    │   └── container-registry.bicep       # Azure Container Registry
    ├── monitor/
    │   └── monitoring.bicep               # Log Analytics + App Insights
    ├── identity/
    │   └── useridentity.bicep             # User-assigned Managed Identity
    └── security/
        └── role.bicep                      # RBAC role assignments
```

## Resources Created

### Compute
- **Azure Container Apps Environment** - Shared environment for all container apps
- **5 Container Apps**:
  - `backend` - .NET 9.0 API (1.0 CPU, 2Gi memory, external)
  - `frontend` - React SPA with nginx (0.5 CPU, 1Gi memory, external)
  - `sitter-agent` - Python AI agent (0.5 CPU, 1Gi memory, internal)
  - `orchestrator-agent` - Python orchestrator (0.5 CPU, 1Gi memory, external)
  - `booking-agent` - Python AI agent (0.5 CPU, 1Gi memory, internal)

### Container Registry
- **Azure Container Registry (Basic)** - Private registry for container images
- **User-Assigned Managed Identity** - For secure ACR authentication (no admin credentials)

### Monitoring
- **Log Analytics Workspace** - Centralized logging (PerGB2018 SKU, 30-day retention)
- **Application Insights** - APM for all services (connected to Log Analytics)

### Networking
- CORS configured on all Container Apps (allow all origins by default)
- External ingress: `backend`, `frontend`, `orchestrator-agent`
- Internal ingress: `sitter-agent`, `booking-agent`

### Scaling
- HTTP-based autoscaling: 10 concurrent requests trigger scale-out
- Min replicas: 1
- Max replicas: 10

## Parameters

Configure these in `.azure/{environment}/.env` or set via `azd env set`:

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `AZURE_ENV_NAME` | Yes | Environment name | `dev` |
| `AZURE_LOCATION` | Yes | Azure region | `eastus` |
| `AZURE_SUBSCRIPTION_ID` | Yes | Azure subscription ID | `xxxxxxxx-...` |
| `AZURE_PRINCIPAL_ID` | Yes | Your Azure AD principal ID | `xxxxxxxx-...` |
| `AZURE_OPENAI_ENDPOINT` | Yes | Azure AI Foundry endpoint | `https://...` |
| `AZURE_OPENAI_DEPLOYMENT` | No | AI model deployment | `gpt-4o-mini` |

## Deployment

### Using azd (Recommended)

```bash
# Initialize environment
azd env new dev

# Set required parameters
azd env set AZURE_SUBSCRIPTION_ID "YOUR_SUBSCRIPTION_ID"
azd env set AZURE_LOCATION "eastus"
azd env set AZURE_OPENAI_ENDPOINT "YOUR_FOUNDRY_ENDPOINT"

# Deploy
azd up
```

### Using Azure CLI

```bash
# Create resource group
az group create --name rg-octopets-dev --location eastus

# Deploy Bicep template
az deployment group create \
  --resource-group rg-octopets-dev \
  --template-file main.bicep \
  --parameters main.parameters.json \
  --parameters azureOpenAiEndpoint="YOUR_ENDPOINT"
```

## Cost Estimation

**Development/Testing** (estimated monthly):
- Container Apps: Free tier eligible (0.5 vCPU, 1GB memory)
- Container Registry Basic: ~$5/month
- Log Analytics: First 5GB/month free
- Application Insights: First 5GB/month free

**Total: ~$5-10/month for dev/test**

**Production** (varies by usage):
- Container Apps: Pay per vCPU-second and GB-second
- Autoscaling: 1-10 replicas per service
- Azure OpenAI: Pay per token usage
- Monitoring: Pay for data ingestion beyond free tier

**Total: ~$50-200/month depending on traffic**

## Networking Details

### Service Communication

```
Frontend (port 80)
  ↓ REACT_APP_API_URL
Backend (port 8080)
  
Frontend (port 80)
  ↓ REACT_APP_ORCHESTRATOR_URL
Orchestrator Agent (port 8000)
  ↓ SITTER_AGENT_URL
  Sitter Agent (port 8000)
  ↓ BOOKING_AGENT_URL
  Booking Agent (port 8000)
    ↓ BACKEND_URL
    Backend (port 8080)
```

### Environment Variables Injected

**Backend:**
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

**Frontend:**
- `REACT_APP_API_URL` (backend URL)
- `REACT_APP_ORCHESTRATOR_URL` (orchestrator URL)
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

**Sitter Agent:**
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

**Orchestrator Agent:**
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `SITTER_AGENT_URL`
- `BOOKING_AGENT_URL`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

**Booking Agent:**
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `BACKEND_URL`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

## Security

### Managed Identity
- User-assigned managed identity created and assigned to all Container Apps
- Identity has `AcrPull` role on the Container Registry
- No admin credentials stored or used

### RBAC Roles
- **AcrPull** - Assigned to managed identity for pulling container images

### Recommended Additional Roles
After deployment, grant the managed identity access to Azure AI Foundry:

```bash
# Get managed identity principal ID
IDENTITY_ID=$(az identity show \
  --name <identity-name> \
  --resource-group <resource-group> \
  --query principalId -o tsv)

# Grant Cognitive Services OpenAI User role
az role assignment create \
  --assignee $IDENTITY_ID \
  --role "Cognitive Services OpenAI User" \
  --scope "/subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.CognitiveServices/accounts/{account}"
```

## Monitoring

### Application Insights
- Automatic instrumentation for all services
- Distributed tracing across microservices
- Custom metrics and logs

### Log Analytics
- Centralized logging for all container apps
- Query logs with Kusto Query Language (KQL)

### View Logs

```bash
# Via azd
azd monitor --logs

# Via Azure CLI
az containerapp logs show \
  --name ca-backend-{suffix} \
  --resource-group rg-{envName} \
  --follow
```

## Troubleshooting

### Container fails to start
1. Check logs: `azd monitor --logs`
2. Verify environment variables: `az containerapp show --name <app-name> --resource-group <rg> --query properties.configuration.secrets`
3. Check Docker image: Ensure image was pushed to ACR successfully

### Python agents can't access AI Foundry
1. Verify `AZURE_OPENAI_ENDPOINT` is correct
2. Check managed identity has "Cognitive Services OpenAI User" role
3. Ensure AI Foundry project allows managed identity authentication

### Frontend can't reach backend
1. Check CORS configuration in backend Container App
2. Verify `REACT_APP_API_URL` environment variable
3. Ensure backend Container App has external ingress enabled

## Updating Infrastructure

### Modify Bicep templates
1. Edit files in `infra/` directory
2. Test locally: `az bicep build --file infra/main.bicep`
3. Deploy changes: `azd provision` or `azd up`

### Add new service
1. Add service to `azure.yaml`
2. Add Container App module in `infra/main.bicep`
3. Create Dockerfile in service directory
4. Deploy: `azd up`

## Clean Up

### Delete all resources
```bash
azd down --force --purge
```

### Delete specific resource group
```bash
az group delete --name rg-octopets-dev --yes --no-wait
```

## References

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Developer CLI Documentation](https://learn.microsoft.com/azure/developer/azure-developer-cli/)
- [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure Naming Conventions](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming)
