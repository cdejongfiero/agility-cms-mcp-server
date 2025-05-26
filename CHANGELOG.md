# Changelog

All notable changes to the Agility CMS MCP Server will be documented in this file.

## [0.1.0] - 2025-05-26

### Added
- **Initial release with 10 comprehensive tools for Agility CMS**

#### Content Model Tools (2)
- `get-content-model-by-reference-name` - Fetch content model structure by reference name
- `get-content-model-by-id` - Fetch content model structure by numeric ID

#### Content Management Tools (3)
- `get-content-item` - Fetch individual content items by ID
- `get-content-items` - Fetch content items with pagination and sorting
- `get-content-list` - Fetch content with advanced field-level filtering

#### Container Tools (3)
- `get-container-by-id` - Fetch content containers by numeric ID
- `get-container-by-reference-name` - Fetch containers by reference name
- `get-containers-by-model` - Find all containers using a specific content model

#### Asset Tools (2)
- `get-asset-by-id` - Fetch media assets by media ID
- `get-asset-by-url` - Fetch media assets by URL

### Features
- **Complete TypeScript support** with Zod validation
- **Comprehensive error handling** for auth, 404, and network errors
- **Environment variable configuration** for flexible deployment
- **Organized project structure** with categorized tool folders
- **Test script** for validating API connectivity
- **Detailed documentation** with usage examples

### Dependencies
- `@agility/management-sdk` ^0.1.23 - Official Agility CMS Management SDK
- `mcp-framework` ^0.2.2 - MCP server framework
- `dotenv` ^16.4.5 - Environment variable management

### Documentation
- Complete README with tool descriptions and examples
- Quick reference guide for all tools
- Test script for verifying setup
- Environment variable template

## [Unreleased]

### Planned Features
- Page template management tools
- Content creation and update tools
- Batch content operations
- Asset upload capabilities
- Workflow and approval tools