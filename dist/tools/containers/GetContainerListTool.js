import { MCPTool } from "mcp-framework";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../../types';
// Load environment variables
dotenv.config();
class GetContainerListTool extends MCPTool {
    name = "get-container-list";
    description = "Fetch all content containers from Agility CMS";
    schema = {
    // No schema needed for this simple call
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
            console.log(`Fetching all containers...`);
            const containers = await apiClient.containerMethods.getContainerList(guid);
            return {
                success: true,
                containers: containers,
                count: containers.length,
                message: `Successfully retrieved ${containers.length} containers`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch container list');
        }
    }
}
export default GetContainerListTool;
