import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, handleApiError } from '../../types';
// Load environment variables
dotenv.config();
class GetContentItemTool extends MCPTool {
    name = "get-content-item";
    description = "Fetch a specific content item by ID from Agility CMS";
    schema = {
        contentID: {
            type: z.number(),
            description: "The content ID of the requested content item",
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
        try {
            const apiClient = this.initializeApiClient();
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
            console.log(`Fetching content item with ID: ${input.contentID} (locale: ${locale})`);
            const contentItem = await apiClient.contentMethods.getContentItem(input.contentID, guid, locale);
            return {
                success: true,
                contentID: input.contentID,
                locale: locale,
                contentItem: contentItem,
                message: `Successfully retrieved content item with ID: ${input.contentID}`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch content item');
        }
    }
}
export default GetContentItemTool;
