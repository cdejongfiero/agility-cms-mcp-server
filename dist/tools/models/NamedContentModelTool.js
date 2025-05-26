import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../../types';
// Load environment variables
dotenv.config();
class NamedContentModelTool extends MCPTool {
    name = "get-content-model-by-reference-name";
    description = "Fetch Agility CMS Content Model structure by Reference Name";
    schema = {
        referenceName: {
            type: z.string(),
            description: "The reference name of the content model to fetch",
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
            console.log(`Fetching content model with reference name: ${input.referenceName}`);
            const contentModel = await apiClient.modelMethods.getModelByReferenceName(input.referenceName, guid);
            return {
                success: true,
                referenceName: input.referenceName,
                model: contentModel,
                message: `Successfully retrieved content model: ${input.referenceName}`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch content model by reference name');
        }
    }
}
export default NamedContentModelTool;
