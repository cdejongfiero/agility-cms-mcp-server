import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../../types';
// Load environment variables
dotenv.config();
class GetMediaListTool extends MCPTool {
    name = "get-media-list";
    description = "Fetch a list of media assets from Agility CMS with pagination";
    schema = {
        pageSize: {
            type: z.number().optional(),
            description: "Number of assets to retrieve per page (default: 50)",
        },
        recordOffset: {
            type: z.number().optional(),
            description: "Number of records to skip for pagination (default: 0)",
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
            const pageSize = input.pageSize || 50;
            const recordOffset = input.recordOffset || 0;
            console.log(`Fetching media list: pageSize=${pageSize}, recordOffset=${recordOffset}`);
            const mediaList = await apiClient.assetMethods.getMediaList(pageSize, recordOffset, guid);
            return {
                success: true,
                pageSize: pageSize,
                recordOffset: recordOffset,
                mediaList: mediaList,
                totalCount: mediaList?.totalCount || 0,
                itemCount: mediaList?.items?.length || 0,
                message: `Successfully retrieved ${mediaList?.items?.length || 0} assets`
            };
        }
        catch (error) {
            handleApiError(error, 'fetch media list');
        }
    }
}
export default GetMediaListTool;
