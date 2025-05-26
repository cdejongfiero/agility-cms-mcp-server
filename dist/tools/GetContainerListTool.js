import { MCPTool } from "mcp-framework";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Get the directory of this file and load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
console.error(`DEBUG: Loading .env from: ${projectRoot}`);
dotenv.config({ path: join(projectRoot, '.env') });
class GetContainerListTool extends MCPTool {
    name = "get-container-list";
    description = "Fetch all content containers from Agility CMS";
    schema = {
    // No schema needed for this simple call
    };
    initializeApiClient() {
        // Debug environment variables
        const token = process.env.AGILITY_ACCESS_TOKEN;
        const guid = process.env.AGILITY_WEBSITE_GUID;
        console.error(`DEBUG GetContainerList: Token exists: ${!!token}`);
        console.error(`DEBUG GetContainerList: Token length: ${token?.length || 0}`);
        console.error(`DEBUG GetContainerList: GUID exists: ${!!guid}`);
        console.error(`DEBUG GetContainerList: GUID value: ${guid}`);
        console.error(`DEBUG GetContainerList: Process CWD: ${process.cwd()}`);
        console.error(`DEBUG GetContainerList: __dirname: ${__dirname}`);
        console.error(`DEBUG GetContainerList: Project root: ${projectRoot}`);
        if (!token) {
            throw new Error('AGILITY_ACCESS_TOKEN is not set in environment variables');
        }
        if (!guid) {
            throw new Error('AGILITY_WEBSITE_GUID is not set in environment variables');
        }
        const options = new mgmtApi.Options();
        options.token = token;
        return new mgmtApi.ApiClient(options);
    }
    async execute(input) {
        try {
            console.error(`DEBUG GetContainerList: Starting execution...`);
            const apiClient = this.initializeApiClient();
            const guid = process.env.AGILITY_WEBSITE_GUID;
            console.error(`DEBUG GetContainerList: Fetching all containers...`);
            const containers = await apiClient.containerMethods.getContainerList(guid);
            console.error(`DEBUG GetContainerList: Successfully retrieved ${containers.length} containers`);
            return {
                success: true,
                containers: containers,
                count: containers.length,
                message: `Successfully retrieved ${containers.length} containers`
            };
        }
        catch (error) {
            console.error(`DEBUG GetContainerList: Error occurred:`, error);
            if (error && typeof error === 'object') {
                const err = error;
                console.error(`DEBUG GetContainerList: Error type: ${typeof error}`);
                console.error(`DEBUG GetContainerList: Error message: ${err.message}`);
                console.error(`DEBUG GetContainerList: Error response: ${JSON.stringify(err.response)}`);
                console.error(`DEBUG GetContainerList: Error status: ${err.response?.status}`);
                console.error(`DEBUG GetContainerList: Error data: ${JSON.stringify(err.response?.data)}`);
                if (err.response?.status === 401) {
                    throw new Error('Authentication failed - check AGILITY_ACCESS_TOKEN');
                }
                throw new Error(`API Error: ${err.message}. Status: ${err.response?.status}`);
            }
            throw new Error(`Unexpected error: ${String(error)}`);
        }
    }
}
export default GetContainerListTool;
