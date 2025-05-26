import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../types/index.js';
// Load environment variables
dotenv.config();
class GetAssetByIdTool extends MCPTool {
    name = "get-asset-by-id";
    description = "Fetch an asset by its media ID from Agility CMS";
    schema = {
        mediaID: {
            type: z.number(),
            description: "The media ID of the requested asset",
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
            console.log(`Fetching asset with media ID: ${input.mediaID}`);
            const asset = await apiClient.assetMethods.getAssetByID(input.mediaID, guid);
            return {
                success: true,
                mediaID: input.mediaID,
                asset: asset,
                message: `Successfully retrieved asset with media ID: ${input.mediaID}`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch asset by ID');
        }
    }
}
export default GetAssetByIdTool;
