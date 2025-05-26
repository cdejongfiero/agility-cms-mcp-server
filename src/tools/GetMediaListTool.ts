import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../types/index.js';

// Load environment variables
dotenv.config();

interface GetMediaListInput {
  pageSize?: number;
  recordOffset?: number;
}

class GetMediaListTool extends MCPTool<GetMediaListInput> {
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

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  async execute(input: GetMediaListInput) {
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
        totalCount: (mediaList as any)?.totalCount || 0,
        itemCount: (mediaList as any)?.items?.length || 0,
        message: `Successfully retrieved ${(mediaList as any)?.items?.length || 0} assets`
      };
      
    } catch (error: unknown) {
      handleApiError(error, 'fetch media list');
    }
  }
}

export default GetMediaListTool;