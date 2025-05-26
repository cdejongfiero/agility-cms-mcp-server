import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../../types';
// Load environment variables
dotenv.config();
class GetContainersByModelTool extends MCPTool {
    name = "get-containers-by-model";
    description = "Fetch all containers that use a specific content model ID from Agility CMS";
    schema = {
        modelId: {
            type: z.number(),
            description: "The model ID to find containers for",
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
            console.log(`Fetching containers for model ID: ${input.modelId}`);
            const container = await apiClient.containerMethods.getContainersByModel(input.modelId, guid);
            return {
                success: true,
                modelId: input.modelId,
                container: container,
                message: `Successfully retrieved containers for model ID: ${input.modelId}`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch containers by model');
        }
    }
}
export default GetContainersByModelTool;
