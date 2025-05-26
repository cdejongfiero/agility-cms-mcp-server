import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { 
  getRequiredEnvVar, 
  getOptionalEnvVar, 
  createListParams, 
  handleApiError,
  safeApiCall,
  validateApiResponse
} from '../types/index.js';

// Load environment variables
dotenv.config();

interface GetContentItemsInput {
  referenceName: string;
  locale?: string;
  take?: number;
  skip?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  filter?: string;
  fields?: string;
  includeContentDetails?: boolean; // New option to fetch full content
  validateResponses?: boolean; // New option to enable/disable validation
}

class GetContentItemsTool extends MCPTool<GetContentItemsInput> {
  name = "get-content-items";
  description = "Fetch content items by container reference name with enhanced error handling. Use itemContainerID from results with get-content-item tool.";

  schema = {
    referenceName: {
      type: z.string(),
      description: "The reference name of the content container",
    },
    locale: {
      type: z.string().optional(),
      description: "The locale for the content (defaults to en-us if not provided)",
    },
    take: {
      type: z.number().optional(),
      description: "Number of items to retrieve (default: 50, max: 500)",
    },
    skip: {
      type: z.number().optional(),
      description: "Number of items to skip for pagination (default: 0)",
    },
    sort: {
      type: z.string().optional(),
      description: "Field name to sort by (default: contentID)",
    },
    direction: {
      type: z.enum(['asc', 'desc']).optional(),
      description: "Sort direction: 'asc' or 'desc' (default: 'asc')",
    },
    filter: {
      type: z.string().optional(),
      description: "Filter string for content items",
    },
    fields: {
      type: z.string().optional(),
      description: "Comma-separated list of fields to include",
    },
    includeContentDetails: {
      type: z.boolean().optional(),
      description: "Whether to fetch full content details for each item (default: false for performance)",
    },
    validateResponses: {
      type: z.boolean().optional(),
      description: "Whether to validate API responses (default: true)",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  private validateInputs(input: GetContentItemsInput): string[] {
    const errors: string[] = [];
    
    if (!input.referenceName || input.referenceName.trim() === '') {
      errors.push('referenceName is required and cannot be empty');
    }
    
    if (input.take && (input.take < 1 || input.take > 500)) {
      errors.push('take must be between 1 and 500');
    }
    
    if (input.skip && input.skip < 0) {
      errors.push('skip must be 0 or greater');
    }
    
    return errors;
  }

  async execute(input: GetContentItemsInput) {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      const inputErrors = this.validateInputs(input);
      if (inputErrors.length > 0) {
        return {
          success: false,
          errors: inputErrors,
          message: `Invalid inputs: ${inputErrors.join(', ')}`
        };
      }

      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
      const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
      const validateResponses = input.validateResponses !== false; // Default to true
      const includeContentDetails = input.includeContentDetails === true; // Default to false

      // Prepare list parameters with validation
      const listParams = createListParams({
        take: Math.min(input.take || 50, 500), // Cap at 500
        skip: input.skip || 0,
        sort: input.sort || 'contentID',
        direction: input.direction || 'asc',
        filter: input.filter || '',
        fields: input.fields || ''
      });

      console.log(`🔍 Fetching content items for: ${input.referenceName} (locale: ${locale})`);
      console.log(`📋 Parameters:`, listParams);
      
      // Fetch content list with enhanced error handling
      const contentList = await safeApiCall(
        () => apiClient.contentMethods.getContentItems(
          input.referenceName, 
          guid, 
          locale, 
          listParams
        ),
        `fetch content items for ${input.referenceName}`,
        3, // 3 retries
        1000 // 1 second delay
      );

      if (!contentList) {
        return {
          success: false,
          message: `Failed to fetch content items for ${input.referenceName} after retries`
        };
      }

      // Validate response structure if enabled
      if (validateResponses) {
        const isValid = validateApiResponse(
          contentList, 
          ['totalCount'], 
          `content list for ${input.referenceName}`
        );
        
        if (!isValid) {
          console.warn(`⚠️ Response validation failed, but continuing with available data`);
        }
      }

      let processedItems = contentList.items || [];
      let itemsWithContent: any[] = [];
      
      // If includeContentDetails is true, fetch full content for each item
      if (includeContentDetails && contentList.items && Array.isArray(contentList.items) && contentList.items.length > 0) {
        console.log(`📦 Fetching detailed content for ${contentList.items[0]?.length || 0} items...`);
        
        const itemRefs = contentList.items[0] || [];
        
        // Process items in smaller batches to avoid overwhelming the API
        const BATCH_SIZE = 5;
        const batches: any[][] = [];
        
        for (let i = 0; i < itemRefs.length; i += BATCH_SIZE) {
          batches.push(itemRefs.slice(i, i + BATCH_SIZE));
        }
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} items)`);
          
          const batchPromises = batch.map(async (item: any, itemIndex: number) => {
            try {
              // Validate item structure
              if (!item || typeof item !== 'object') {
                console.warn(`⚠️ Invalid item structure at index ${itemIndex}`);
                return {
                  containerID: null,
                  contentItemID: item?.contentItemID || null,
                  contentViewID: item?.contentViewID || null,
                  error: 'Invalid item structure'
                };
              }
              
              const contentId = item.itemContainerID;
              if (!contentId) {
                console.warn(`⚠️ Missing itemContainerID for item at index ${itemIndex}`);
                return {
                  containerID: null,
                  contentItemID: item?.contentItemID || null,
                  contentViewID: item?.contentViewID || null,
                  error: 'Missing itemContainerID'
                };
              }
              
              // Fetch full content with retry logic
              const fullContent = await safeApiCall(
                () => apiClient.contentMethods.getContentItem(contentId, guid, locale),
                `fetch content item ${contentId}`,
                2, // Fewer retries for individual items
                500 // Shorter delay
              );
              
              if (!fullContent) {
                return {
                  containerID: contentId,
                  contentItemID: item.contentItemID,
                  contentViewID: item.contentViewID,
                  error: 'Failed to fetch content after retries'
                };
              }
              
              // Validate content structure if enabled
              if (validateResponses) {
                validateApiResponse(
                  fullContent, 
                  ['fields', 'properties'], 
                  `content item ${contentId}`
                );
              }
              
              return {
                containerID: contentId,
                contentItemID: item.contentItemID,
                contentViewID: item.contentViewID,
                content: fullContent
              };
              
            } catch (error: any) {
              console.warn(`⚠️ Failed to process item at index ${itemIndex}:`, error.message);
              return {
                containerID: item?.itemContainerID || null,
                contentItemID: item?.contentItemID || null,
                contentViewID: item?.contentViewID || null,
                error: `Processing failed: ${error.message}`
              };
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          itemsWithContent.push(...batchResults);
          
          // Small delay between batches to be gentle on the API
          if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        processedItems = itemsWithContent;
      }

      const executionTime = Date.now() - startTime;
      
      // Count successful vs failed items
      const successCount = processedItems.filter((item: any) => !item.error).length;
      const errorCount = processedItems.filter((item: any) => item.error).length;
      
      return {
        success: true,
        referenceName: input.referenceName,
        locale: locale,
        parameters: listParams,
        totalCount: contentList?.totalCount || 0,
        itemsReturned: processedItems.length,
        successfulItems: successCount,
        failedItems: errorCount,
        items: processedItems,
        executionTimeMs: executionTime,
        includeContentDetails: includeContentDetails,
        instructions: includeContentDetails 
          ? "Content details included. Use 'containerID' for further operations."
          : "Item references only. Use 'itemContainerID' with get-content-item tool to fetch full content.",
        message: includeContentDetails 
          ? `Successfully retrieved ${successCount} content items with details for: ${input.referenceName}${errorCount > 0 ? ` (${errorCount} items failed to load)` : ''}`
          : `Successfully retrieved content item references for: ${input.referenceName}`
      };
      
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Critical error in get-content-items:`, error);
      
      // Enhanced error information
      const errorInfo: any = {
        success: false,
        referenceName: input.referenceName,
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
        } else if (apiError.response?.status === 404) {
          errorInfo.message = `Container "${input.referenceName}" not found`;
          errorInfo.suggestion = 'Please verify the container reference name exists';
        } else if (apiError.response?.status === 429) {
          errorInfo.message = 'Rate limit exceeded';
          errorInfo.suggestion = 'Please wait before making more requests';
        } else {
          errorInfo.message = `API error: ${apiError.message}`;
        }
      } else {
        errorInfo.message = `Failed to fetch content items: ${errorInfo.error}`;
      }
      
      return errorInfo;
    }
  }
}

export default GetContentItemsTool;