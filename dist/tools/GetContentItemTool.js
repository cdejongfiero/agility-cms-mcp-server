import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, safeApiCall, validateApiResponse } from '../types/index.js';
// Load environment variables
dotenv.config();
class GetContentItemTool extends MCPTool {
    name = "get-content-item";
    description = "Fetch a specific content item by its container ID from Agility CMS (use itemContainerID from get-content-items results, not contentItemID)";
    schema = {
        contentID: {
            type: z.number(),
            description: "The container ID of the content item (use itemContainerID from get-content-items results, not contentItemID)",
        },
        locale: {
            type: z.string().optional(),
            description: "The locale for the content (defaults to en-us if not provided)",
        },
    };
    initializeApiClient() {
        const options = new mgmtApi.Options();
        options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
        return new mgmtApi.ApiClient(options);
    }
    async execute(input) {
        const startTime = Date.now();
        try {
            // Validate input
            if (!input.contentID || input.contentID <= 0) {
                return {
                    success: false,
                    error: 'Invalid contentID: must be a positive number',
                    message: 'Please provide a valid container ID (itemContainerID from get-content-items)'
                };
            }
            const apiClient = this.initializeApiClient();
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
            console.log(`🔍 Fetching content item with container ID: ${input.contentID} (locale: ${locale})`);
            const contentItem = await safeApiCall(() => apiClient.contentMethods.getContentItem(input.contentID, guid, locale), `fetch content item ${input.contentID}`, 3, // 3 retries
            1000 // 1 second delay
            );
            if (!contentItem) {
                return {
                    success: false,
                    contentID: input.contentID,
                    message: `Failed to fetch content item with ID: ${input.contentID} after retries`
                };
            }
            // Validate response structure
            const isValid = validateApiResponse(contentItem, ['fields', 'properties'], `content item ${input.contentID}`);
            if (!isValid) {
                console.warn(`⚠️ Content item ${input.contentID} has unexpected structure but continuing`);
            }
            const executionTime = Date.now() - startTime;
            return {
                success: true,
                contentID: input.contentID,
                locale: locale,
                contentItem: contentItem,
                executionTimeMs: executionTime,
                message: `Successfully retrieved content item with container ID: ${input.contentID}`
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            console.error(`❌ Error fetching content item ${input.contentID}:`, error);
            // Enhanced error information
            const errorInfo = {
                success: false,
                contentID: input.contentID,
                executionTimeMs: executionTime,
                error: error instanceof Error ? error.message : String(error)
            };
            // Add specific error details if available
            if (error && typeof error === 'object' && 'response' in error) {
                const apiError = error;
                errorInfo.statusCode = apiError.response?.status;
                if (apiError.response?.status === 401) {
                    errorInfo.message = 'Authentication failed - please check your AGILITY_ACCESS_TOKEN';
                }
                else if (apiError.response?.status === 404) {
                    errorInfo.message = `Content item with container ID ${input.contentID} not found`;
                    errorInfo.suggestion = 'Verify the container ID exists and you have permission to access it';
                }
                else if (apiError.response?.status === 429) {
                    errorInfo.message = 'Rate limit exceeded';
                    errorInfo.suggestion = 'Please wait before making more requests';
                }
                else {
                    errorInfo.message = `API error: ${apiError.message}`;
                }
            }
            else {
                errorInfo.message = `Failed to fetch content item: ${errorInfo.error}`;
            }
            return errorInfo;
        }
    }
}
export default GetContentItemTool;
