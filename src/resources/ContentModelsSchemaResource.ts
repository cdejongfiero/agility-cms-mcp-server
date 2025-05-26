import { MCPResource, ResourceContent } from "mcp-framework";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar } from '../types/index.js';

dotenv.config();

interface ContentModelSchema {
  id: number | null;
  referenceName: string | null;
  displayName: string | null;
  description?: string | null;
  fields: Array<{
    fieldID: string | null;
    fieldName: string | null;
    fieldType: string | null;
    label: string | null;
    description?: string | null;
    isDataField?: boolean | null;
    settings?: any;
  }>;
  lastModified?: string | null;
}

interface ModelSummary {
  totalModels: number;
  modelsByType: Record<string, number>;
  lastUpdated: string;
  models: ContentModelSchema[];
}

const oneHour = 1000 * 60 * 60;

class ContentModelsSchemaResource extends MCPResource {
  uri = "agility://content-models/schema";
  name = "Content Models Schema";
  description = "Complete schema definitions for all Agility CMS content models including fields, types, and relationships";
  mimeType = "application/json";

  private cachedSchema: ModelSummary | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_TTL = oneHour; // Cache for 1 hour

  async read(): Promise<ResourceContent[]> {
    await this.refreshCache();
    
    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify(this.cachedSchema, null, 2),
      },
    ];
  }

  private async refreshCache(): Promise<void> {
    const now = Date.now();
    if (this.cachedSchema && now - this.lastFetch < this.CACHE_TTL) {
      return;
    }

    try {
      console.log('Refreshing content models schema cache...');
      
      // Initialize API client
      const options = new mgmtApi.Options();
      options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
      const apiClient = new mgmtApi.ApiClient(options);
      const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');

      // Get all content models (not page modules)
      const allModels = await apiClient.modelMethods.getContentModules(false, guid, false);
      
      console.log(`Found ${allModels.length} content models`);

      // Transform models into our schema format
      const models: ContentModelSchema[] = allModels
        .filter(model => model.referenceName) // Only include models with reference names
        .map(model => ({
          id: model.id,
          referenceName: model.referenceName,
          displayName: model.displayName,
          description: model.description,
          fields: (model.fields || []).map(field => ({
            fieldID: field.fieldID,
            fieldName: field.name,
            fieldType: field.type,
            label: field.label,
            description: field.description,
            isDataField: field.isDataField,
            settings: field.settings
          })),
          lastModified: model.lastModifiedDate
        }));

      // Create summary statistics
      const modelsByType: Record<string, number> = {};
      models.forEach(model => {
        model.fields.forEach(field => {
          if (field.fieldType) { // Only count fields with valid types
            modelsByType[field.fieldType] = (modelsByType[field.fieldType] || 0) + 1;
          }
        });
      });

      this.cachedSchema = {
        totalModels: models.length,
        modelsByType,
        lastUpdated: new Date().toISOString(),
        models
      };

      this.lastFetch = now;
      console.log('Content models schema cache refreshed successfully');
      
    } catch (error) {
      console.error('Failed to refresh content models schema:', error);
      throw new Error(`Failed to fetch content models schema: ${error}`);
    }
  }
}

export default ContentModelsSchemaResource;