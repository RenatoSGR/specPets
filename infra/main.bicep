targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the user or app to assign application roles')
param principalId string = ''

// Azure OpenAI parameters
@description('Azure OpenAI endpoint URL')
param azureOpenAiEndpoint string

@description('Azure OpenAI deployment name')
param azureOpenAiDeployment string = 'gpt-4o-mini'

// Tags that should be applied to all resources
var tags = {
  'azd-env-name': environmentName
  'project': 'octopets'
}

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

// Container apps environment
module containerAppsEnvironment './core/host/container-apps-environment.bicep' = {
  name: 'container-apps-environment'
  scope: rg
  params: {
    name: '${abbrs.appManagedEnvironments}${resourceToken}'
    location: location
    tags: tags
    logAnalyticsWorkspaceName: monitoring.outputs.logAnalyticsWorkspaceName
  }
}

// Monitoring (Application Insights, Log Analytics)
module monitoring './core/monitor/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    tags: tags
    logAnalyticsName: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: '${abbrs.insightsComponents}${resourceToken}'
  }
}

// Container registry
module containerRegistry './core/host/container-registry.bicep' = {
  name: 'container-registry'
  scope: rg
  params: {
    name: '${abbrs.containerRegistryRegistries}${resourceToken}'
    location: location
    tags: tags
  }
}

// User assigned managed identity
module userIdentity './core/identity/useridentity.bicep' = {
  name: 'useridentity'
  scope: rg
  params: {
    name: '${abbrs.managedIdentityUserAssignedIdentities}${resourceToken}'
    location: location
    tags: tags
  }
}

// Grant ACR pull permissions to the managed identity
module acrRoleAssignment './core/security/role.bicep' = {
  name: 'acr-role-assignment'
  scope: rg
  params: {
    principalId: userIdentity.outputs.principalId
    roleDefinitionId: '7f951dda-4ed3-4680-a7ca-43fe172d538d' // AcrPull role
    principalType: 'ServicePrincipal'
  }
}

// Backend API (ASP.NET Core)
module backend './core/host/container-app.bicep' = {
  name: 'backend'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}backend-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'backend' })
    containerAppsEnvironmentName: containerAppsEnvironment.outputs.name
    containerRegistryName: containerRegistry.outputs.name
    containerCpuCoreCount: '1.0'
    containerMemory: '2Gi'
    identityName: userIdentity.outputs.name
    env: [
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        value: monitoring.outputs.applicationInsightsConnectionString
      }
      {
        name: 'ASPNETCORE_ENVIRONMENT'
        value: 'Production'
      }
    ]
    targetPort: 8080
    external: true
  }
}

// Frontend (React)
module frontend './core/host/container-app.bicep' = {
  name: 'frontend'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}frontend-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'frontend' })
    containerAppsEnvironmentName: containerAppsEnvironment.outputs.name
    containerRegistryName: containerRegistry.outputs.name
    containerCpuCoreCount: '0.5'
    containerMemory: '1Gi'
    identityName: userIdentity.outputs.name
    env: [
      {
        name: 'REACT_APP_API_URL'
        value: backend.outputs.uri
      }
      {
        name: 'REACT_APP_USE_MOCK_DATA'
        value: 'false'
      }
    ]
    targetPort: 80
    external: true
  }
}

// Sitter Agent (Python FastAPI)
module sitterAgent './core/host/container-app.bicep' = {
  name: 'sitter-agent'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}sitter-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'sitter-agent' })
    containerAppsEnvironmentName: containerAppsEnvironment.outputs.name
    containerRegistryName: containerRegistry.outputs.name
    containerCpuCoreCount: '0.5'
    containerMemory: '1Gi'
    identityName: userIdentity.outputs.name
    env: [
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        value: azureOpenAiEndpoint
      }
      {
        name: 'AZURE_OPENAI_DEPLOYMENT'
        value: azureOpenAiDeployment
      }
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        value: monitoring.outputs.applicationInsightsConnectionString
      }
    ]
    targetPort: 8000
    external: false
  }
}

// Orchestrator Agent (Python FastAPI)
module orchestratorAgent './core/host/container-app.bicep' = {
  name: 'orchestrator-agent'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}orchestrator-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'orchestrator-agent' })
    containerAppsEnvironmentName: containerAppsEnvironment.outputs.name
    containerRegistryName: containerRegistry.outputs.name
    containerCpuCoreCount: '0.5'
    containerMemory: '1Gi'
    identityName: userIdentity.outputs.name
    env: [
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        value: azureOpenAiEndpoint
      }
      {
        name: 'AZURE_OPENAI_DEPLOYMENT'
        value: azureOpenAiDeployment
      }
      {
        name: 'SITTER_AGENT_URL'
        value: sitterAgent.outputs.uri
      }
      {
        name: 'BOOKING_AGENT_URL'
        value: bookingAgent.outputs.uri
      }
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        value: monitoring.outputs.applicationInsightsConnectionString
      }
    ]
    targetPort: 8000
    external: true
  }
}

// Booking Agent (Python FastAPI)
module bookingAgent './core/host/container-app.bicep' = {
  name: 'booking-agent'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}booking-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'booking-agent' })
    containerAppsEnvironmentName: containerAppsEnvironment.outputs.name
    containerRegistryName: containerRegistry.outputs.name
    containerCpuCoreCount: '0.5'
    containerMemory: '1Gi'
    identityName: userIdentity.outputs.name
    env: [
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        value: azureOpenAiEndpoint
      }
      {
        name: 'AZURE_OPENAI_DEPLOYMENT'
        value: azureOpenAiDeployment
      }
      {
        name: 'BACKEND_URL'
        value: backend.outputs.uri
      }
      {
        name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
        value: monitoring.outputs.applicationInsightsConnectionString
      }
    ]
    targetPort: 8000
    external: false
  }
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name
output BACKEND_URI string = backend.outputs.uri
output FRONTEND_URI string = frontend.outputs.uri
output ORCHESTRATOR_URI string = orchestratorAgent.outputs.uri
