import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, createListParams, handleApiError, safeApiCall, validateApiResponse } from '../types/index.js';

interface GetContentByReferenceAndTitleInput {
  referenceName: string;
  title: string;
  locale?: string;
}

class GetContentByReferenceAndTitleTool extends MCPTool<GetContentByReferenceAndTitleInput> {
  name = "get-content-by-reference-and-title";
  description = "Find specific content items by container reference name and title/name";

  schema = {
    referenceName: {
      type: z.string(),
      description: "The reference name of the content container",
    },
    title: {
      type: z.string(),
      description: "The title or name to search for in the content items",
    },
    locale: {
      type: z.string().optional(),
      description: "The locale for the content (defaults to en-us if not provided)",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  async execute(input: GetContentByReferenceAndTitleInput) {
    try {
      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
      const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');

      // Get all content items from the container
      const listParams = createListParams({
        take: 500, // Get more items to search through
        skip: 0,
        sort: 'contentID',
        direction: 'asc'
      });

      const contentList = await safeApiCall(
        () => apiClient.contentMethods.getContentItems(
          input.referenceName, 
          guid, 
          locale, 
          listParams
        ),
        `fetch content items for title search in ${input.referenceName}`,
        3,
        1000
      ) as any;

      if (!contentList) {
        return {
          success: false,
          message: `Failed to fetch content items for ${input.referenceName} after retries`
        };
      }

      if (!contentList.items || !Array.isArray(contentList.items) || contentList.items.length === 0) {
        return {
          success: false,
          message: `No content items found in container: ${input.referenceName}`
        };
      }

      // Search through items for matching title
      const matchingItems = [];
      
      for (const item of contentList.items[0]) {
        try {
          const fullContent = await safeApiCall(
            () => apiClient.contentMethods.getContentItem(
              item.itemContainerID, 
              guid, 
              locale
            ),
            `fetch content item ${item.itemContainerID} for title search`,
            2,
            500
          ) as any;
          
          if (!fullContent) {
            continue; // Skip this item and continue with the next
          }
          
          // Check if title matches (case-insensitive)
          const contentTitle = fullContent.fields?.title || fullContent.fields?.Title || fullContent.fields?.name || fullContent.fields?.Name;
          
          if (contentTitle && contentTitle.toLowerCase().includes(input.title.toLowerCase())) {
            matchingItems.push({
              containerID: item.itemContainerID,
              content: fullContent
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch content for container ID ${item.itemContainerID}:`, error);
        }
      }

      return {
        success: true,
        referenceName: input.referenceName,
        searchTitle: input.title,
        locale: locale,
        matchingItems: matchingItems,
        totalMatches: matchingItems.length,
        message: `Found ${matchingItems.length} items matching "${input.title}" in ${input.referenceName}`
      };
      
    } catch (error: unknown) {
      handleApiError(error, 'search content by title');
    }
  }
}

export default GetContentByReferenceAndTitleTool;