import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, createListParams, handleApiError } from '../../types';
// Load environment variables
dotenv.config();
class GetContentListTool extends MCPTool {
    name = "get-content-list";
    description = "Fetch filtered content list by container reference name from Agility CMS with advanced filtering options";
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
        fields: {
            type: z.string().optional(),
            description: "Comma-separated list of fields to include",
        },
        showDeleted: {
            type: z.boolean().optional(),
            description: "Whether to include deleted content (default: false)",
        },
        filters: {
            type: z.record(z.any()).optional(),
            description: "Field-level filters as key-value pairs (e.g., {\"title\": \"Blog Post\", \"status\": \"Published\"})",
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
            // Prepare list parameters with correct structure
            const listParams = createListParams({
                take: input.take,
                skip: input.skip,
                sort: input.sort,
                direction: input.direction,
                fields: input.fields,
                showDeleted: input.showDeleted
            });
            // Prepare filter object - use undefined instead of null
            const filterObject = input.filters || undefined;
            console.log(`Fetching filtered content list for: ${input.referenceName} (locale: ${locale})`);
            console.log(`Parameters:`, listParams);
            if (filterObject) {
                console.log(`Filters:`, filterObject);
            }
            const contentList = await apiClient.contentMethods.getContentList(input.referenceName, guid, locale, listParams, filterObject);
            return {
                success: true,
                referenceName: input.referenceName,
                locale: locale,
                parameters: listParams,
                filters: filterObject,
                contentList: contentList,
                totalCount: contentList?.totalCount || 0,
                message: `Successfully retrieved filtered content list for: ${input.referenceName}`
            };
        }
        catch (error) {
            handleApiError(error, `fetch content list for ${input.referenceName}`);
        }
    }
}
export default GetContentListTool;
