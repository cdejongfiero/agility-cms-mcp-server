# Agility CMS MCP Tools - Quick Reference

## 📊 Content Models (2 tools)
| Tool Name | Description | Input |
|-----------|-------------|-------|
| `get-content-model-by-reference-name` | Fetch model by reference name | `referenceName` (string) |
| `get-content-model-by-id` | Fetch model by ID | `id` (number) |

## 📝 Content Management (3 tools)
| Tool Name | Description | Input |
|-----------|-------------|-------|
| `get-content-item` | Fetch single content item | `contentID` (number), `locale?` (string) |
| `get-content-items` | Fetch content items with basic filtering | `referenceName` (string), `locale?`, `take?`, `skip?`, `sort?`, `direction?`, `filter?`, `fields?` |
| `get-content-list` | Fetch content with advanced filtering | `referenceName` (string), `locale?`, `take?`, `skip?`, `sort?`, `direction?`, `fields?`, `showDeleted?`, `filters?` (object) |

## 📦 Containers (4 tools)
| Tool Name | Description | Input |
|-----------|-------------|-------|
| `get-container-list` | Fetch all containers | *(no input required)* |
| `get-container-by-id` | Fetch container by ID | `id` (number) |
| `get-container-by-reference-name` | Fetch container by reference name | `referenceName` (string) |
| `get-containers-by-model` | Fetch containers using specific model | `modelId` (number) |

## 🖼️ Assets (3 tools)
| Tool Name | Description | Input |
|-----------|-------------|-------|
| `get-media-list` | Fetch list of assets with pagination | `pageSize?` (number), `recordOffset?` (number) |
| `get-asset-by-id` | Fetch asset by media ID | `mediaID` (number) |
| `get-asset-by-url` | Fetch asset by URL | `url` (string) |

---

**Total: 12 tools** organized into 4 categories

### Common Parameters
- `locale` - defaults to `en-us` or `AGILITY_LOCALE` env var
- `take` - number of items to retrieve (default: 50)
- `skip` - number of items to skip for pagination (default: 0)
- `sort` - field name to sort by (gets mapped to `sortField`)
- `direction` - 'asc' or 'desc' (gets mapped to `sortDirection`, default: 'asc')
- `filter` - filter string for content items
- `fields` - comma-separated list of fields to include
- `filters` - object with field-level filters (e.g., `{"status": "Published"}`)
- `showDeleted` - whether to include deleted content (default: false)

### Quick Start Examples
```
# Get all containers first to see what's available
"Use get-container-list to show me all containers"

# Get model structure
"Use get-content-model-by-reference-name with referenceName 'blogposts'"

# Get published content 
"Use get-content-list with referenceName 'blogposts' and filters {'status': 'Published'}"

# Get latest 5 items
"Use get-content-items with referenceName 'news', take 5, sort 'date', direction 'desc'"

# Get specific content item
"Use get-content-item with contentID 123"

# Browse assets
"Use get-media-list with pageSize 20 to show me the first 20 assets"
```

### ✨ New Tools Added
- **`get-container-list`** - Overview tool to see all available containers
- **`get-media-list`** - Browse and paginate through assets

### 🔧 Fixed Issues
- ✅ **Method names corrected** - Using actual SDK method names
- ✅ **TypeScript errors fixed** - Proper error handling and environment variables
- ✅ **ListParams structure** - Correct parameter mapping for content queries
- ✅ **Authentication handling** - Proper token validation and error messages