import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import { getRequiredEnvVar, getOptionalEnvVar, createListParams, handleApiError, safeApiCall } from '../types/index.js';
class GetContentItemsWithDetailsTool extends MCPTool {
    name = "get-content-items-with-details";
    description = "Fetch content items with full content details, eliminating ID confusion";
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
            description: "Number of items to retrieve (default: 50)",
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
        includeContent: {
            type: z.boolean().optional(),
            description: "Whether to fetch full content details for each item (default: true)",
        },
    };
    initializeApiClient() {
        const options = new mgmtApi.Options();
        options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
        return new mgmtApi.ApiClient(options);
    }
    async execute(input) {
        try {
            const apiClient = this.initializeApiClient();
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
            const includeContent = input.includeContent !== false; // Default to true
            // Get the list first
            const listParams = createListParams({
                take: input.take,
                skip: input.skip,
                sort: input.sort,
                direction: input.direction,
                filter: input.filter,
                fields: input.fields
            });
            const contentList = await safeApiCall(() => apiClient.contentMethods.getContentItems(input.referenceName, guid, locale, listParams), `fetch content items with details for ${input.referenceName}`, 3, 1000);
            if (!contentList) {
                return {
                    success: false,
                    message: `Failed to fetch content items for ${input.referenceName} after retries`
                };
            }
            let itemsWithContent = contentList.items;
            // If includeContent is true, fetch full content for each item
            if (includeContent && contentList.items && Array.isArray(contentList.items) && contentList.items.length > 0) {
                itemsWithContent = await Promise.all(contentList.items[0].map(async (item) => {
                    try {
                        // Use itemContainerID to get the actual content
                        const fullContent = await apiClient.contentMethods.getContentItem(item.itemContainerID, guid, locale);
                        return {
                            containerID: item.itemContainerID,
                            contentItemID: item.contentItemID, // Keep for reference
                            contentViewID: item.contentViewID,
                            content: fullContent // Full content details
                        };
                    }
                    catch (error) {
                        console.warn(`Failed to fetch content for container ID ${item.itemContainerID}:`, error);
                        return {
                            containerID: item.itemContainerID,
                            contentItemID: item.contentItemID,
                            contentViewID: item.contentViewID,
                            error: `Failed to fetch content: ${error}`
                        };
                    }
                }));
            }
            return {
                success: true,
                referenceName: input.referenceName,
                locale: locale,
                parameters: listParams,
                totalCount: contentList?.totalCount || 0,
                items: itemsWithContent,
                message: `Successfully retrieved ${itemsWithContent?.length || 0} content items with details for: ${input.referenceName}`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch content items with details');
        }
    }
}
export default GetContentItemsWithDetailsTool;
