import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { 
  getRequiredEnvVar, 
  getOptionalEnvVar, 
  handleApiError,
  safeApiCall,
  validateApiResponse
} from '../types/index.js';

// Load environment variables
dotenv.config();

interface GetContainerListInput {
  validateResponses?: boolean;
  includeDetails?: boolean;
}

class GetContainerListTool extends MCPTool<GetContainerListInput> {
  name = "get-container-list";
  description = "Fetch all content containers from Agility CMS with enhanced error handling";

  schema = {
    validateResponses: {
      type: z.boolean().optional(),
      description: "Whether to validate API responses (default: true)",
    },
    includeDetails: {
      type: z.boolean().optional(),
      description: "Whether to include additional container details (default: false)",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  async execute(input: GetContainerListInput) {
    const startTime = Date.now();
    
    try {
      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
      const validateResponses = input.validateResponses !== false; // Default to true
      const includeDetails = input.includeDetails === true; // Default to false

      console.log(`📦 Fetching all containers from Agility CMS...`);
      
      const containers = await safeApiCall(
        () => apiClient.containerMethods.getContainerList(guid),
        'fetch container list',
        3, // 3 retries
        1000 // 1 second delay
      );
      
      if (!containers) {
        return {
          success: false,
          message: 'Failed to fetch containers after retries'
        };
      }

      // Validate response structure if enabled
      if (validateResponses) {
        if (!Array.isArray(containers)) {
          console.warn(`⚠️ Container list is not an array, but continuing`);
        }
      }

      let processedContainers = containers;
      
      // Add additional details if requested
      if (includeDetails) {
        console.log(`🔍 Fetching additional details for ${containers.length} containers...`);
        
        processedContainers = containers.map((container: any) => ({
          ...container,
          details: {
            hasContent: container.contentDefinitionID ? true : false,
            modelId: container.contentDefinitionID,
            category: container.contentViewCategoryName || 'Uncategorized',
            isShared: container.isShared || false,
            isDynamic: container.isDynamicPageList || false
          }
        }));
      }

      const executionTime = Date.now() - startTime;
      
      // Generate summary statistics
      const stats = {
        total: containers.length,
        withContent: containers.filter((c: any) => c.contentDefinitionID).length,
        shared: containers.filter((c: any) => c.isShared).length,
        dynamic: containers.filter((c: any) => c.isDynamicPageList).length,
        categories: [...new Set(containers.map((c: any) => c.contentViewCategoryName || 'Uncategorized'))]
      };
      
      console.log(`✅ Successfully retrieved ${containers.length} containers`);
      console.log(`📊 Summary: ${stats.withContent} have content, ${stats.shared} are shared, ${stats.categories.length} categories`);
      
      return {
        success: true,
        containers: processedContainers,
        count: containers.length,
        statistics: stats,
        executionTimeMs: executionTime,
        includeDetails: includeDetails,
        instructions: {
          usage: "Use 'referenceName' with other tools to work with specific containers",
          nextSteps: [
            "Use get-content-items with referenceName to get content from containers",
            "Use get-content-model-by-id with contentDefinitionID to see container structure",
            "Filter containers by category or shared status as needed"
          ]
        },
        message: `Successfully retrieved ${containers.length} containers${includeDetails ? ' with details' : ''}`
      };
      
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Error fetching containers:`, error);
      
      // Enhanced error information
      const errorInfo: any = {
        success: false,
        executionTimeMs: executionTime,
        error: error instanceof Error ? error.message : String(error)
      };
      
      // Add specific error details if available
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        errorInfo.statusCode = apiError.response?.status;
        errorInfo.statusText = apiError.response?.statusText;
        
        if (apiError.response?.status === 401) {
          errorInfo.message = 'Authentication failed - please check your AGILITY_ACCESS_TOKEN';
          errorInfo.suggestion = 'The token may have expired (they typically last 1 hour)';
        } else if (apiError.response?.status === 403) {
          errorInfo.message = 'Access forbidden - insufficient permissions';
          errorInfo.suggestion = 'Check that your API token has permission to list containers';
        } else if (apiError.response?.status === 429) {
          errorInfo.message = 'Rate limit exceeded';
          errorInfo.suggestion = 'Please wait before making more requests';
        } else {
          errorInfo.message = `API error: ${apiError.message}`;
        }
      } else {
        errorInfo.message = `Failed to fetch containers: ${errorInfo.error}`;
      }
      
      return errorInfo;
    }
  }
}

export default GetContainerListTool;