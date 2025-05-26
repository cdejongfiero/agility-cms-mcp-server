import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, handleApiError } from '../../types';

// Load environment variables
dotenv.config();

interface GetContainerByReferenceNameInput {
  referenceName: string;
}

class GetContainerByReferenceNameTool extends MCPTool<GetContainerByReferenceNameInput> {
  name = "get-container-by-reference-name";
  description = "Fetch a content container by its reference name from Agility CMS";

  schema = {
    referenceName: {
      type: z.string(),
      description: "The reference name of the container to fetch",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  async execute(input: GetContainerByReferenceNameInput) {
    try {
      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');

      console.log(`Fetching container with reference name: ${input.referenceName}`);
      
      const container = await apiClient.containerMethods.getContainerByReferenceName(input.referenceName, guid);
      
      return {
        success: true,
        referenceName: input.referenceName,
        container: container,
        message: `Successfully retrieved container: ${input.referenceName}`
      };
      
    } catch (error: unknown) {
      handleApiError(error, 'fetch container by reference name');
    }
  }
}

export default GetContainerByReferenceNameTool;