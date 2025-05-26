import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../types/index.js';

// Load environment variables
dotenv.config();

interface ContentModelByIdInput {
  id: number;
}

class ContentModelByIdTool extends MCPTool<ContentModelByIdInput> {
  name = "get-content-model-by-id";
  description = "Fetch Agility CMS Content Model structure by ID";

  schema = {
    id: {
      type: z.number(),
      description: "The numeric ID of the content model to fetch",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  async execute(input: ContentModelByIdInput) {
    try {
      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');

      console.log(`Fetching content model with ID: ${input.id}`);
      
      // Use the correct method name: getContentModel instead of getModelById
      const contentModel = await apiClient.modelMethods.getContentModel(input.id, guid);
      
      return {
        success: true,
        id: input.id,
        model: contentModel,
        message: `Successfully retrieved content model with ID: ${input.id}`
      };
      
    } catch (error: unknown) {
      handleApiError(error, 'fetch content model by ID');
    }
  }
}

export default ContentModelByIdTool;