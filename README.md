# Agility CMS MCP Server

This MCP (Model Context Protocol) server provides comprehensive tools for fetching Agility CMS content model schema, content data, containers, and assets, making it easier to work with Claude when building websites with Next.js and Agility.

## Prerequisites

- Node.js >= 18.19.0
- A valid Agility CMS instance with Management API access
- Valid Agility CMS authentication credentials

## Setup

1. **Clone and install dependencies:**
   ```bash
   cd agility-mcp-server
   npm install
   ```

2. **Configure environment variables:**
  It's recommended to put the environment variables into your claude_desktop_config.json file like below - it is not necessary to include the filesystem MCP server, but it allows Claude to code in your codebase directly with Agility content details if you do so.

  Unfortunately, I haven't created an oAuth flow, so the best way to get your Bearer access token is to use the https://mgmt.aglty.io/swagger/index.html Agility Management API playground and get it manually and fill it in. It will expire after 24 hours and you will need to replace it then.
  ```
  {
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
	      "FILL-IN-YOUR-EXACT-PATH/agility-mcp-server"
      ]
    },
  "agility-mcp-server": {
   "command": "node",
   "args": ["FILL-IN-YOUR-EXACT-PATH/agility-mcp-server/dist/index.js"],
   "env": {
          "AGILITY_ACCESS_TOKEN": "your-token-here",
	        "AGILITY_WEBSITE_GUID": "your-guid-here",
	        "AGILITY_LOCALE": "en-us"
   }
  }
}
}
```

The following also works, but it can often have issues with refresh after the access token expires and is replaced - if you have that issue, then use the above method as it supersedes the .env file anyway.
   Copy `.env.example` to `.env` and fill in your Agility CMS credentials:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your actual values:
   ```env
   AGILITY_ACCESS_TOKEN=your_access_token_here
   AGILITY_CLIENT_ID=your_client_id_here
   AGILITY_CLIENT_SECRET=your_client_secret_here
   AGILITY_WEBSITE_GUID=your_website_guid_here
   AGILITY_LOCALE=en-us
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Available Tools

### 📊 **Content Model Tools**

#### 1. Get Content Model by Reference Name
**Tool Name:** `get-content-model-by-reference-name`
**Description:** Fetch Agility CMS Content Model structure by Reference Name

**Input:**
- `referenceName` (string): The reference name of the content model to fetch

**Example Usage:**
```
Please use the get-content-model-by-reference-name tool to fetch the content model with reference name "blogposts"
```

#### 2. Get Content Model by ID
**Tool Name:** `get-content-model-by-id`
**Description:** Fetch Agility CMS Content Model structure by numeric ID

**Input:**
- `id` (number): The numeric ID of the content model to fetch

**Example Usage:**
```
Please use the get-content-model-by-id tool to fetch the content model with ID 123
```

### 📝 **Content Tools**

#### 3. Get Content Item
**Tool Name:** `get-content-item`
**Description:** Fetch a specific content item by ID

**Input:**
- `contentID` (number): The content ID of the requested content item
- `locale` (string, optional): The locale for the content (defaults to en-us)

**Example Usage:**
```
Use the get-content-item tool to fetch content item with ID 4091
```

#### 4. Get Content Items
**Tool Name:** `get-content-items`
**Description:** Fetch content items by container reference name with optional filtering

**Input:**
- `referenceName` (string): The reference name of the content container
- `locale` (string, optional): The locale for the content (defaults to en-us)
- `take` (number, optional): Number of items to retrieve (default: 50)
- `skip` (number, optional): Number of items to skip for pagination (default: 0)
- `sort` (string, optional): Field name to sort by
- `direction` ('asc' | 'desc', optional): Sort direction (default: 'asc')

**Example Usage:**
```
Use the get-content-items tool to fetch the first 10 blog posts sorted by date: referenceName="blogposts", take=10, sort="date", direction="desc"
```

#### 5. Get Content List (Advanced Filtering)
**Tool Name:** `get-content-list`
**Description:** Fetch filtered content list with advanced filtering options

**Input:**
- `referenceName` (string): The reference name of the content container
- `locale` (string, optional): The locale for the content (defaults to en-us)
- `take` (number, optional): Number of items to retrieve (default: 50)
- `skip` (number, optional): Number of items to skip for pagination (default: 0)
- `sort` (string, optional): Field name to sort by
- `direction` ('asc' | 'desc', optional): Sort direction (default: 'asc')
- `filters` (object, optional): Field-level filters as key-value pairs

**Example Usage:**
```
Use the get-content-list tool to fetch published blog posts: referenceName="blogposts", filters={"status": "Published", "category": "Technology"}
```

### 📦 **Container Tools**

#### 6. Get Container by ID
**Tool Name:** `get-container-by-id`
**Description:** Fetch a content container by its numeric ID

**Input:**
- `id` (number): The container ID of the requested container

**Example Usage:**
```
Use the get-container-by-id tool to fetch container with ID 456
```

#### 7. Get Containers by Model
**Tool Name:** `get-containers-by-model`
**Description:** Fetch all containers that use a specific content model ID

**Input:**
- `modelId` (number): The model ID to find containers for

**Example Usage:**
```
Use the get-containers-by-model tool to find all containers using model ID 123
```

#### 8. Get Container by Reference Name
**Tool Name:** `get-container-by-reference-name`
**Description:** Fetch a content container by its reference name

**Input:**
- `referenceName` (string): The reference name of the container to fetch

**Example Usage:**
```
Use the get-container-by-reference-name tool to fetch the "blogposts" container
```

### 🖼️ **Asset Tools**

#### 9. Get Asset by ID
**Tool Name:** `get-asset-by-id`
**Description:** Fetch an asset by its media ID

**Input:**
- `mediaID` (number): The media ID of the requested asset

**Example Usage:**
```
Use the get-asset-by-id tool to fetch asset with media ID 789
```

#### 10. Get Asset by URL
**Tool Name:** `get-asset-by-url`
**Description:** Fetch an asset by its URL

**Input:**
- `url` (string): The URL of the requested asset

**Example Usage:**
```
Use the get-asset-by-url tool to fetch asset from "https://agility-cms.s3.amazonaws.com/my-instance/logo.png"
```

## Using with Claude Desktop

Add this server to your Claude Desktop configuration:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agility-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/agility-mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/agility-mcp-server` with the actual path to your project directory.

## Authentication

The tools use OAuth 2.0 authentication with Agility CMS. You'll need to:

1. Generate an access token through the Agility CMS Management API OAuth flow
2. Update the `AGILITY_ACCESS_TOKEN` in your `.env` file when needed
3. The access token typically expires after 1 hour

For now, you can manually update the token in the `.env` file when it expires. The tools include error handling for authentication failures.

## Error Handling

All tools include comprehensive error handling for:
- Missing environment variables
- Authentication failures (401 errors)
- Resource not found (404 errors)
- Network and API errors

## Development

- **Watch mode:** `npm run watch`
- **Build:** `npm run build`
- **Start:** `npm start`
- **Test connection:** `npm test`

## Project Structure

```
src/
├── tools/
│   ├── models/           # Content model tools
│   │   ├── NamedContentModelTool.ts
│   │   └── ContentmodelbyidTool.ts
│   ├── content/          # Content management tools
│   │   ├── GetContentItemTool.ts
│   │   ├── GetContentItemsTool.ts
│   │   └── GetContentListTool.ts
│   ├── containers/       # Container management tools
│   │   ├── GetContainerByIdTool.ts
│   │   ├── GetContainersByModelTool.ts
│   │   └── GetContainerByReferenceNameTool.ts
│   └── assets/           # Asset management tools
│       ├── GetAssetByIdTool.ts
│       └── GetAssetByUrlTool.ts
└── index.ts
```

## Common Workflows

### 1. Exploring Content Structure
```
1. Use get-content-model-by-reference-name to understand content fields
2. Use get-container-by-reference-name to get container details
3. Use get-content-items to fetch actual content
```

### 2. Content Analysis
```
1. Use get-content-list with filters to find specific content
2. Use get-content-item to get detailed content information
3. Use get-asset-by-id to get related media details
```

### 3. Model Discovery
```
1. Use get-content-model-by-id to inspect model structure
2. Use get-containers-by-model to find where models are used
3. Use get-content-items to see content examples
```

## Using the Agility Management SDK

All tools use the `@agility/management-sdk` with this pattern:

```typescript
import * as mgmtApi from '@agility/management-sdk';

// Initialize API client
const options = new mgmtApi.Options();
options.token = process.env.AGILITY_ACCESS_TOKEN;
const apiClient = new mgmtApi.ApiClient(options);

// Make API calls
const guid = process.env.AGILITY_WEBSITE_GUID;
const locale = process.env.AGILITY_LOCALE || 'en-us';
```

## Next Steps

Consider adding these additional tools:
- Page template management tools
- Content creation/update tools
- Batch content operations
- Asset upload and management
- Workflow and approval tools

## Support

For issues with this MCP server, please check the GitHub repository.
For Agility CMS specific questions, visit the [Agility Developer Community](https://help.agilitycms.com/hc/en-us/community/topics).
