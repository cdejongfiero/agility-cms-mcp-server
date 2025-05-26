import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, isApiError } from '../../types/agility-types.js';
// Load environment variables
dotenv.config();
class GetContainerByIdTool extends MCPTool {
    name = "get-container-by-id";
    description = "Fetch a content container by its numeric ID from Agility CMS";
    schema = {
        id: {
            type: z.number(),
            description: "The container ID of the requested container",
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
            console.log(`Fetching container with ID: ${input.id}`);
            const container = await apiClient.containerMethods.getContainerByID(input.id, guid);
            return {
                success: true,
                id: input.id,
                container: container,
                message: `Successfully retrieved container with ID: ${input.id}`
            };
        }
        catch (error) {
            console.error('Error fetching container by ID:', error);
            // Handle specific API errors
            if (isApiError(error)) {
                if (error.response && error.response.status === 401) {
                    throw new Error('Authentication failed - please check your AGILITY_ACCESS_TOKEN');
                }
                if (error.response && error.response.status === 404) {
                    throw new Error(`Container with ID '${input.id}' not found`);
                }
                throw new Error(`Failed to fetch container: ${error.message}`);
            }
            throw new Error(`Failed to fetch container: ${String(error)}`);
        }
    }
}
export default GetContainerByIdTool;
