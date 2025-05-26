import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar } from '../types/index.js';
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
            // Debug: Check environment variables
            const token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            console.error(`DEBUG: Token exists: ${!!token}, GUID: ${guid}`);
            console.error(`DEBUG: Fetching content model with reference name: ${input.referenceName}`);
            const apiClient = this.initializeApiClient();
            // This is the exact SDK call
            const contentModel = await apiClient.modelMethods.getModelByReferenceName(input.referenceName, guid);
            console.error(`DEBUG: Successfully retrieved model: ${contentModel?.referenceName}`);
            return {
                success: true,
                referenceName: input.referenceName,
                model: contentModel,
                message: `Successfully retrieved content model: ${input.referenceName}`
            };
        }
        catch (error) {
            console.error(`DEBUG: Full error object:`, error);
            // More detailed error handling
            if (error && typeof error === 'object') {
                const err = error;
                console.error(`DEBUG: Error type: ${typeof error}`);
                console.error(`DEBUG: Error message: ${err.message}`);
                console.error(`DEBUG: Error response: ${JSON.stringify(err.response)}`);
                console.error(`DEBUG: Error status: ${err.response?.status}`);
                console.error(`DEBUG: Error data: ${JSON.stringify(err.response?.data)}`);
                if (err.response?.status === 401) {
                    throw new Error('Authentication failed - please check your AGILITY_ACCESS_TOKEN');
                }
                if (err.response?.status === 404) {
                    throw new Error(`Content model with reference name '${input.referenceName}' not found`);
                }
                if (err.response?.status === 400) {
                    throw new Error(`Bad request - check that '${input.referenceName}' is a valid reference name`);
                }
                // Include response details in error
                throw new Error(`API Error: ${err.message}. Status: ${err.response?.status}. Data: ${JSON.stringify(err.response?.data)}`);
            }
            throw new Error(`Unexpected error: ${String(error)}`);
        }
    }
}
export default NamedContentModelTool;
