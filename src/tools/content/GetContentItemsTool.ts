import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, createListParams, handleApiError } from '../../types';

// Load environment variables
dotenv.config();

interface GetContentItemsInput {
  referenceName: string;
  locale?: string;
  take?: number;
  skip?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  filter?: string;
  fields?: string;
}

class GetContentItemsTool extends MCPTool<GetContentItemsInput> {
  name = "get-content-items";
  description = "Fetch content items by container reference name from Agility CMS with optional filtering";

  schema = {
    referenceName: {
      type: z.string(),
      description: "The reference name of the content container",
    },
    locale: {
      type: z.string().optional(),
      description: "The locale for the content (defaults to en-us if not provided)",
    },
    take: {
      type: z.number().optional(),
      description: "Number of items to retrieve (default: 50)",
    },
    skip: {
      type: z.number().optional(),
      description: "Number of items to skip for pagination (default: 0)",
    },
    sort: {
      type: z.string().optional(),
      description: "Field name to sort by (default: contentID)",
    },
    direction: {
      type: z.enum(['asc', 'desc']).optional(),
      description: "Sort direction: 'asc' or 'desc' (default: 'asc')",
    },
    filter: {
      type: z.string().optional(),
      description: "Filter string for content items",
    },
    fields: {
      type: z.string().optional(),
      description: "Comma-separated list of fields to include",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  async execute(input: GetContentItemsInput) {
    try {
      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
      const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');

      // Prepare list parameters with correct structure
      const listParams = createListParams({
        take: input.take,
        skip: input.skip,
        sort: input.sort,
        direction: input.direction,
        filter: input.filter,
        fields: input.fields
      });

      console.log(`Fetching content items for: ${input.referenceName} (locale: ${locale})`);
      console.log(`Parameters:`, listParams);
      
      const contentList = await apiClient.contentMethods.getContentItems(
        input.referenceName, 
        guid, 
        locale, 
        listParams
      );
      
      return {
        success: true,
        referenceName: input.referenceName,
        locale: locale,
        parameters: listParams,
        contentList: contentList,
        totalCount: contentList?.totalCount || 0,
        message: `Successfully retrieved content items for: ${input.referenceName}`
      };
      
    } catch (error: unknown) {
      handleApiError(error, 'fetch content items');
    }
  }
}

export default GetContentItemsTool;