import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { 
  getRequiredEnvVar, 
  getOptionalEnvVar, 
  handleApiError,
  searchContentInContainer
} from '../types/index.js';

// Load environment variables
dotenv.config();

interface GetContentBySearchInput {
  referenceName: string;
  searchTerm: string;
  searchField?: string;
  locale?: string;
  maxResults?: number;
}

class GetContentBySearchTool extends MCPTool<GetContentBySearchInput> {
  name = "get-content-by-search";
  description = "Search for content items within a container by field value with relevance scoring";

  schema = {
    referenceName: {
      type: z.string(),
      description: "The reference name of the content container to search in",
    },
    searchTerm: {
      type: z.string(),
      description: "The term to search for in the specified field",
    },
    searchField: {
      type: z.string().optional(),
      description: "The field to search in (default: 'title'). Supports: title, name, or any custom field",
    },
    locale: {
      type: z.string().optional(),
      description: "The locale for the content (defaults to en-us if not provided)",
    },
    maxResults: {
      type: z.number().optional(),
      description: "Maximum number of results to return (default: 20, max: 100)",
    },
  };

  private initializeApiClient() {
    const options = new mgmtApi.Options();
    options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
    return new mgmtApi.ApiClient(options);
  }

  private validateInputs(input: GetContentBySearchInput): string[] {
    const errors: string[] = [];
    
    if (!input.referenceName || input.referenceName.trim() === '') {
      errors.push('referenceName is required and cannot be empty');
    }
    
    if (!input.searchTerm || input.searchTerm.trim() === '') {
      errors.push('searchTerm is required and cannot be empty');
    }
    
    if (input.maxResults && (input.maxResults < 1 || input.maxResults > 100)) {
      errors.push('maxResults must be between 1 and 100');
    }
    
    return errors;
  }

  async execute(input: GetContentBySearchInput) {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      const inputErrors = this.validateInputs(input);
      if (inputErrors.length > 0) {
        return {
          success: false,
          errors: inputErrors,
          message: `Invalid inputs: ${inputErrors.join(', ')}`
        };
      }

      const apiClient = this.initializeApiClient();
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
      const locale = input.locale || getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
      const searchField = input.searchField || 'title';
      const maxResults = Math.min(input.maxResults || 20, 100);

      console.log(`🔍 Searching for "${input.searchTerm}" in "${searchField}" field within container "${input.referenceName}"`);
      console.log(`📋 Locale: ${locale}, Max results: ${maxResults}`);
      
      // Use the enhanced search function
      const searchResults = await searchContentInContainer(
        apiClient,
        input.referenceName,
        input.searchTerm,
        searchField,
        guid,
        locale
      );

      // Limit results if requested
      const limitedResults = searchResults.slice(0, maxResults);
      
      const executionTime = Date.now() - startTime;
      
      // Prepare summary statistics
      const scoreStats = {
        averageScore: limitedResults.length > 0 
          ? limitedResults.reduce((sum, item) => sum + (item.score || 0), 0) / limitedResults.length 
          : 0,
        highestScore: limitedResults.length > 0 
          ? Math.max(...limitedResults.map(item => item.score || 0))
          : 0,
        perfectMatches: limitedResults.filter(item => item.score === 100).length,
        strongMatches: limitedResults.filter(item => (item.score || 0) >= 80).length
      };
      
      console.log(`✅ Search completed: Found ${searchResults.length} total matches, returning top ${limitedResults.length}`);
      console.log(`📊 Average relevance score: ${scoreStats.averageScore.toFixed(1)}`);
      
      return {
        success: true,
        referenceName: input.referenceName,
        searchTerm: input.searchTerm,
        searchField: searchField,
        locale: locale,
        totalMatches: searchResults.length,
        returnedResults: limitedResults.length,
        maxResults: maxResults,
        executionTimeMs: executionTime,
        scoreStatistics: scoreStats,
        results: limitedResults.map(item => ({
          containerID: item.containerID,
          contentItemID: item.contentItemID,
          contentViewID: item.contentViewID,
          matchedValue: item.matchedValue,
          relevanceScore: item.score,
          content: {
            // Include key content fields for easy access
            title: item.content?.fields?.title || item.content?.fields?.Title || item.content?.properties?.title,
            fields: item.content?.fields,
            properties: item.content?.properties
          }
        })),
        instructions: {
          usage: "Use 'containerID' values with get-content-item tool for full content details",
          scoring: "Relevance scores: 100=exact match, 80+=strong match, 60+=good match, 40+=partial match",
          nextSteps: [
            "Results are sorted by relevance score (highest first)",
            "Use containerID with get-content-item for complete content",
            "Try different searchField values for broader searches"
          ]
        },
        message: searchResults.length === 0
          ? `No matches found for "${input.searchTerm}" in ${searchField} field`
          : `Found ${searchResults.length} matches for "${input.searchTerm}" in ${searchField} field${limitedResults.length < searchResults.length ? ` (showing top ${limitedResults.length})` : ''}`
      };
      
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Search failed:`, error);
      
      // Enhanced error information
      const errorInfo: any = {
        success: false,
        referenceName: input.referenceName,
        searchTerm: input.searchTerm,
        executionTimeMs: executionTime,
        error: error instanceof Error ? error.message : String(error)
      };
      
      // Add specific error details if available
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as any;
        errorInfo.statusCode = apiError.response?.status;
        
        if (apiError.response?.status === 401) {
          errorInfo.message = 'Authentication failed - please check your AGILITY_ACCESS_TOKEN';
          errorInfo.suggestion = 'The token may have expired (they typically last 1 hour)';
        } else if (apiError.response?.status === 404) {
          errorInfo.message = `Container "${input.referenceName}" not found`;
          errorInfo.suggestion = 'Please verify the container reference name exists';
        } else if (apiError.response?.status === 429) {
          errorInfo.message = 'Rate limit exceeded during search';
          errorInfo.suggestion = 'Please wait before making more requests';
        } else {
          errorInfo.message = `API error during search: ${apiError.message}`;
        }
      } else if (error instanceof Error && error.message.includes('Failed to search content')) {
        errorInfo.message = error.message;
        errorInfo.suggestion = 'Check container name and search parameters';
      } else {
        errorInfo.message = `Search operation failed: ${errorInfo.error}`;
      }
      
      return errorInfo;
    }
  }
}

export default GetContentBySearchTool;