import { MCPResource } from "mcp-framework";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, createListParams } from '../types/index.js';
dotenv.config();
const thirtyMinutes = 1000 * 60 * 30;
class ContainerOverviewResource extends MCPResource {
    uri = "agility://containers/overview";
    name = "Container Overview";
    description = "Complete overview of all content containers including content counts, model usage, and activity statistics";
    mimeType = "application/json";
    cachedOverview = null;
    lastFetch = 0;
    CACHE_TTL = thirtyMinutes; // Cache for 30 minutes
    async read() {
        await this.refreshCache();
        return [
            {
                uri: this.uri,
                mimeType: this.mimeType,
                text: JSON.stringify(this.cachedOverview, null, 2),
            },
        ];
    }
    async refreshCache() {
        const now = Date.now();
        if (this.cachedOverview && now - this.lastFetch < this.CACHE_TTL) {
            return;
        }
        try {
            console.log('Refreshing container overview cache...');
            // Initialize API client
            const options = new mgmtApi.Options();
            options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
            const apiClient = new mgmtApi.ApiClient(options);
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            const locale = getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
            // Get all containers
            const allContainers = await apiClient.containerMethods.getContainerList(guid);
            console.log(`Found ${allContainers.length} containers`);
            // Get content counts for each container (sample first few to avoid rate limits)
            const containersWithCounts = [];
            let totalContentItems = 0;
            const modelUsage = {};
            // Process containers in batches to avoid overwhelming the API
            const batchSize = 10;
            for (let i = 0; i < Math.min(allContainers.length, 50); i += batchSize) {
                const batch = allContainers.slice(i, i + batchSize);
                await Promise.all(batch.map(async (container) => {
                    try {
                        // Skip containers without reference names
                        if (!container.referenceName) {
                            return;
                        }
                        // Get content count for this container
                        const listParams = createListParams({ take: 1, skip: 0 });
                        const contentList = await apiClient.contentMethods.getContentItems(container.referenceName, guid, locale, listParams);
                        const contentCount = contentList?.totalCount || 0;
                        totalContentItems += contentCount;
                        // Track model usage
                        const modelKey = container.contentDefinitionID?.toString() || 'unknown';
                        modelUsage[modelKey] = (modelUsage[modelKey] || 0) + 1;
                        containersWithCounts.push({
                            contentViewID: container.contentViewID,
                            referenceName: container.referenceName,
                            displayName: container.title || container.contentViewName || container.referenceName,
                            contentDefinitionID: container.contentDefinitionID,
                            contentCount,
                            hasContent: contentCount > 0,
                            lastModified: container.lastModifiedOn || undefined
                        });
                    }
                    catch (error) {
                        // If we can't get content for a container, still include it with 0 count
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        console.warn(`Could not get content count for ${container.referenceName}:`, errorMsg);
                        if (container.referenceName) {
                            containersWithCounts.push({
                                contentViewID: container.contentViewID,
                                referenceName: container.referenceName,
                                displayName: container.title || container.contentViewName || container.referenceName,
                                contentDefinitionID: container.contentDefinitionID,
                                contentCount: 0,
                                hasContent: false,
                                lastModified: container.lastModifiedOn || undefined
                            });
                        }
                    }
                }));
                // Small delay between batches to be respectful to the API
                if (i + batchSize < Math.min(allContainers.length, 50)) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            // Add remaining containers without detailed counts (to avoid rate limits)
            for (let i = Math.min(allContainers.length, 50); i < allContainers.length; i++) {
                const container = allContainers[i];
                if (container.referenceName) {
                    containersWithCounts.push({
                        contentViewID: container.contentViewID,
                        referenceName: container.referenceName,
                        displayName: container.title || container.contentViewName || container.referenceName,
                        contentDefinitionID: container.contentDefinitionID,
                        contentCount: 0,
                        hasContent: false,
                        lastModified: container.lastModifiedOn || undefined
                    });
                }
            }
            // Sort and analyze
            const topContainersByContent = containersWithCounts
                .filter(c => c.hasContent)
                .sort((a, b) => b.contentCount - a.contentCount)
                .slice(0, 10);
            const recentlyModified = containersWithCounts
                .filter(c => c.lastModified)
                .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                .slice(0, 10);
            const containersWithContent = containersWithCounts.filter(c => c.hasContent).length;
            this.cachedOverview = {
                totalContainers: allContainers.length,
                containersWithContent,
                totalContentItems,
                topContainersByContent,
                recentlyModified,
                modelUsage,
                lastUpdated: new Date().toISOString(),
                containers: containersWithCounts
            };
            this.lastFetch = now;
            console.log(`Container overview cache refreshed: ${containersWithContent}/${allContainers.length} containers have content`);
        }
        catch (error) {
            console.error('Failed to refresh container overview:', error);
            throw new Error(`Failed to fetch container overview: ${error}`);
        }
    }
}
export default ContainerOverviewResource;
