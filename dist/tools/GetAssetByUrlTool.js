import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../types/index.js';
// Load environment variables
dotenv.config();
class GetAssetByUrlTool extends MCPTool {
    name = "get-asset-by-url";
    description = "Fetch an asset by its URL from Agility CMS";
    schema = {
        url: {
            type: z.string().url(),
            description: "The URL of the requested asset",
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
            console.log(`Fetching asset with URL: ${input.url}`);
            const asset = await apiClient.assetMethods.getAssetByUrl(input.url, guid);
            return {
                success: true,
                url: input.url,
                asset: asset,
                message: `Successfully retrieved asset from URL: ${input.url}`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch asset by URL');
        }
    }
}
export default GetAssetByUrlTool;
