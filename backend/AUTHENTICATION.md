# Authentication Approach for Pet Sitter Marketplace

## Current Status
- No existing Program.cs found in repository
- Authentication pattern needs to be established when backend infrastructure is created

## Recommended Approach (from plan.md and quickstart.md)
- Use Azure AD / Microsoft Entra ID for production authentication
- Use `DefaultAzureCredential` pattern for Azure services
- Implement JWT bearer tokens for API authentication
- CORS configuration with `FRONTEND_URL` environment variable

## Implementation Notes
- Will be implemented in Phase 2 when creating backend/Program.cs
- Should integrate with existing Octopets authentication if present
- May need to differentiate between PetOwner and PetSitter roles

## Next Steps
- Create backend/Program.cs with authentication middleware
- Register authentication services in dependency injection
- Configure CORS for frontend access
- Add authorization policies for owner vs sitter endpoints
