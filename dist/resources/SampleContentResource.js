import { MCPResource } from "mcp-framework";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, createListParams } from '../types/index.js';
dotenv.config();
const oneHour = 1000 * 60 * 60;
class SampleContentResource extends MCPResource {
    uri = "agility://content/samples";
    name = "Sample Content Data";
    description = "Real content examples from each content model to help with component development and testing";
    mimeType = "application/json";
    cachedSamples = null;
    lastFetch = 0;
    CACHE_TTL = oneHour; // Cache for 1 hour
    async read() {
        await this.refreshCache();
        return [
            {
                uri: this.uri,
                mimeType: this.mimeType,
                text: JSON.stringify(this.cachedSamples, null, 2),
            },
        ];
    }
    async refreshCache() {
        const now = Date.now();
        if (this.cachedSamples && now - this.lastFetch < this.CACHE_TTL) {
            return;
        }
        try {
            console.log('Refreshing sample content cache...');
            // Initialize API client
            const options = new mgmtApi.Options();
            options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
            const apiClient = new mgmtApi.ApiClient(options);
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            const locale = getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
            // Get containers that have content
            const allContainers = await apiClient.containerMethods.getContainerList(guid);
            console.log(`Sampling content from ${allContainers.length} containers`);
            const samplesByModel = {};
            const modelCoverage = [];
            let totalSamples = 0;
            // Sample content from each container (limit to avoid rate limits)
            const maxContainers = 25; // Limit containers to process
            const samplesPerContainer = 2; // Samples per container
            for (let i = 0; i < Math.min(allContainers.length, maxContainers); i++) {
                const container = allContainers[i];
                // Skip containers without reference names
                if (!container.referenceName) {
                    continue;
                }
                try {
                    // Get a small sample of content from this container
                    const listParams = createListParams({
                        take: samplesPerContainer,
                        skip: 0
                    });
                    const contentList = await apiClient.contentMethods.getContentItems(container.referenceName, guid, locale, listParams);
                    if (contentList?.items && contentList.items.length > 0) {
                        const modelKey = container.referenceName;
                        if (!samplesByModel[modelKey]) {
                            samplesByModel[modelKey] = [];
                        }
                        // Process each content item
                        contentList.items.forEach((item) => {
                            const sample = {
                                containerReferenceName: container.referenceName,
                                modelReferenceName: container.referenceName, // Approximation
                                contentID: item.contentID,
                                title: item.fields?.title || item.fields?.name || item.fields?.displayName || `Item ${item.contentID}`,
                                fields: item.fields || {},
                                lastModified: item.lastModified
                            };
                            samplesByModel[modelKey].push(sample);
                            totalSamples++;
                        });
                        // Analyze content richness
                        const hasRichContent = contentList.items.some((item) => {
                            const fields = item.fields || {};
                            return Object.values(fields).some((value) => {
                                if (typeof value === 'string') {
                                    return value.length > 100 || value.includes('<') || value.includes('{');
                                }
                                return typeof value === 'object' && value !== null;
                            });
                        });
                        modelCoverage.push({
                            modelName: modelKey,
                            sampleCount: contentList.items.length,
                            hasRichContent
                        });
                    }
                    // Small delay to be respectful to the API
                    if (i < Math.min(allContainers.length, maxContainers) - 1) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                }
                catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    console.warn(`Could not sample content from ${container.referenceName}:`, errorMsg);
                }
            }
            this.cachedSamples = {
                totalSamples,
                samplesByModel,
                lastUpdated: new Date().toISOString(),
                modelCoverage: modelCoverage.sort((a, b) => b.sampleCount - a.sampleCount)
            };
            this.lastFetch = now;
            console.log(`Sample content cache refreshed: ${totalSamples} samples from ${Object.keys(samplesByModel).length} models`);
        }
        catch (error) {
            console.error('Failed to refresh sample content:', error);
            throw new Error(`Failed to fetch sample content: ${error}`);
        }
    }
}
export default SampleContentResource;
