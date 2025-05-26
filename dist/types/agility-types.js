// Type definitions for Agility SDK to fix TypeScript errors
// Helper function to check if error is an API error
export function isApiError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
// Helper function to safely get environment variable
export function getRequiredEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is required in environment variables`);
    }
    return value;
}
// Helper function to get optional environment variable with default
export function getOptionalEnvVar(name, defaultValue) {
    return process.env[name] || defaultValue;
}
// Helper function to create ListParams with proper defaults (all required)
export function createListParams(options) {
    return {
        filter: options.filter || '', // Required string, defaults to empty
        fields: options.fields || '', // Required string, defaults to empty  
        sortDirection: options.direction || 'asc', // Required string
        sortField: options.sort || 'contentID', // Required string
        showDeleted: options.showDeleted || false, // Required boolean
        take: options.take || 50, // Required number
        skip: options.skip || 0 // Required number
    };
}
/**
 * Enhanced error handling for JSON parsing issues
 */
export function safeJsonParse(jsonString, context = 'Unknown') {
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            console.warn(`⚠️ Invalid JSON input in ${context}: not a string or empty`);
            return null;
        }
        // Trim whitespace that might cause issues
        const trimmed = jsonString.trim();
        if (trimmed === '') {
            console.warn(`⚠️ Empty JSON string in ${context}`);
            return null;
        }
        return JSON.parse(trimmed);
    }
    catch (error) {
        console.error(`❌ JSON parsing error in ${context}:`, error.message);
        console.error(`📄 Raw content (first 200 chars):`, jsonString?.substring(0, 200));
        return null;
    }
}
/**
 * Enhanced API call wrapper with better error handling and retries
 */
export async function safeApiCall(apiCall, context, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 API call attempt ${attempt}/${maxRetries}: ${context}`);
            const result = await apiCall();
            // Validate the result isn't malformed
            if (result === null || result === undefined) {
                throw new Error('API returned null or undefined');
            }
            console.log(`✅ API call successful: ${context}`);
            return result;
        }
        catch (error) {
            console.error(`❌ API call failed (attempt ${attempt}/${maxRetries}): ${context}`, error.message);
            // Check for specific error types that shouldn't be retried
            if (error.response?.status === 401) {
                console.error('🔑 Authentication error - not retrying');
                throw new Error(`Authentication failed in ${context}: ${error.message}`);
            }
            if (error.response?.status === 404) {
                console.error('🔍 Resource not found - not retrying');
                throw new Error(`Resource not found in ${context}: ${error.message}`);
            }
            // For rate limiting, wait longer before retry
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers?.['retry-after'] || 2;
                const delay = retryAfter * 1000;
                console.log(`⏱️ Rate limited - waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            // For server errors, wait before retry
            if (attempt < maxRetries) {
                const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`⏱️ Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                throw new Error(`Failed ${context} after ${maxRetries} attempts: ${error.message}`);
            }
        }
    }
    return null;
}
/**
 * Validate API response structure
 */
export function validateApiResponse(response, expectedFields, context) {
    if (!response || typeof response !== 'object') {
        console.error(`❌ Invalid response structure in ${context}: not an object`);
        return false;
    }
    const missingFields = expectedFields.filter(field => !(field in response));
    if (missingFields.length > 0) {
        console.error(`❌ Missing required fields in ${context}:`, missingFields);
        return false;
    }
    return true;
}
/**
 * Helper function to extract container IDs from content list
 */
export function extractContainerIDs(contentListResponse) {
    if (!contentListResponse?.items || !Array.isArray(contentListResponse.items) || contentListResponse.items.length === 0) {
        return [];
    }
    return contentListResponse.items[0].map((item) => item.itemContainerID);
}
/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(fieldValue, searchTerm) {
    const field = fieldValue.toLowerCase();
    const term = searchTerm.toLowerCase();
    // Exact match
    if (field === term)
        return 100;
    // Starts with search term
    if (field.startsWith(term))
        return 80;
    // Ends with search term
    if (field.endsWith(term))
        return 70;
    // Contains search term as whole word
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(field))
        return 60;
    // Contains search term (partial)
    if (field.includes(term))
        return 40;
    // Similarity based on length and position
    const position = field.indexOf(term);
    if (position !== -1) {
        return Math.max(20, 40 - (position / field.length) * 20);
    }
    return 0;
}
/**
 * Search for content within a container by field value
 */
export async function searchContentInContainer(apiClient, referenceName, searchTerm, searchField = 'title', guid, locale = 'en-us') {
    try {
        console.log(`🔍 Searching for "${searchTerm}" in field "${searchField}" within container "${referenceName}"`);
        // First, get all content items from the container
        const listParams = createListParams({
            take: 500, // Get more items to search through
            skip: 0,
            sort: 'contentID',
            direction: 'asc'
        });
        let allContentItems = [];
        let hasMoreItems = true;
        let currentSkip = 0;
        const batchSize = 500;
        // Paginate through all content if there are many items
        while (hasMoreItems) {
            const currentParams = { ...listParams, skip: currentSkip, take: batchSize };
            const contentListResponse = await safeApiCall(() => apiClient.contentMethods.getContentItems(referenceName, guid, locale, currentParams), `fetch content list for search in ${referenceName}`, 2, 500);
            if (!contentListResponse?.items || !Array.isArray(contentListResponse.items) || contentListResponse.items.length === 0) {
                break;
            }
            // Add items from this batch
            const itemRefs = contentListResponse.items[0] || [];
            allContentItems.push(...itemRefs);
            // Check if we need to continue
            hasMoreItems = itemRefs.length === batchSize && allContentItems.length < (contentListResponse.totalCount || 0);
            currentSkip += batchSize;
            console.log(`📦 Loaded ${allContentItems.length} of ${contentListResponse.totalCount || 'unknown'} items`);
        }
        if (allContentItems.length === 0) {
            console.log(`⚠️ No content items found in container: ${referenceName}`);
            return [];
        }
        console.log(`🔎 Searching through ${allContentItems.length} items for "${searchTerm}"`);
        // Search through items for matching content
        const matchingItems = [];
        const errors = [];
        // Process items in batches to avoid overwhelming the API
        const BATCH_SIZE = 10;
        for (let i = 0; i < allContentItems.length; i += BATCH_SIZE) {
            const batch = allContentItems.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (item) => {
                try {
                    // Use itemContainerID (the correct ID for fetching content)
                    const contentId = item.itemContainerID;
                    const fullContent = await safeApiCall(() => apiClient.contentMethods.getContentItem(contentId, guid, locale), `fetch content item ${contentId} for search`, 1, // Only 1 retry for search items
                    300);
                    if (!fullContent) {
                        return null;
                    }
                    // Search in the specified field with fallbacks
                    const fieldVariations = [
                        searchField,
                        searchField.toLowerCase(),
                        searchField.charAt(0).toUpperCase() + searchField.slice(1).toLowerCase(),
                        searchField.toUpperCase()
                    ];
                    let fieldValue = null;
                    for (const fieldName of fieldVariations) {
                        if (fullContent.fields && fullContent.fields[fieldName] !== undefined) {
                            fieldValue = fullContent.fields[fieldName];
                            break;
                        }
                    }
                    // If field not found in fields, check properties
                    if (fieldValue === null && fullContent.properties) {
                        for (const fieldName of fieldVariations) {
                            if (fullContent.properties[fieldName] !== undefined) {
                                fieldValue = fullContent.properties[fieldName];
                                break;
                            }
                        }
                    }
                    // Perform the search
                    if (fieldValue !== null && fieldValue !== undefined) {
                        const searchValue = String(fieldValue).toLowerCase();
                        const searchTermLower = searchTerm.toLowerCase();
                        if (searchValue.includes(searchTermLower)) {
                            return {
                                containerID: item.itemContainerID,
                                contentItemID: item.contentItemID,
                                contentViewID: item.contentViewID,
                                content: fullContent,
                                matchedField: searchField,
                                matchedValue: fieldValue,
                                score: calculateRelevanceScore(searchValue, searchTermLower)
                            };
                        }
                    }
                    return null;
                }
                catch (error) {
                    const errorMsg = `Failed to fetch content for container ID ${item.itemContainerID}: ${error.message}`;
                    errors.push(errorMsg);
                    console.warn(`⚠️ ${errorMsg}`);
                    return null;
                }
            });
            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter(result => result !== null);
            matchingItems.push(...validResults);
            // Progress indicator
            console.log(`🔍 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allContentItems.length / BATCH_SIZE)}`);
            // Small delay between batches
            if (i + BATCH_SIZE < allContentItems.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        // Sort by relevance score (highest first)
        matchingItems.sort((a, b) => (b.score || 0) - (a.score || 0));
        console.log(`✅ Search complete: Found ${matchingItems.length} matches`);
        if (errors.length > 0) {
            console.log(`⚠️ ${errors.length} items failed to load`);
        }
        return matchingItems;
    }
    catch (error) {
        console.error(`❌ Error searching content in container ${referenceName}:`, error.message);
        throw new Error(`Failed to search content: ${error.message}`);
    }
}
// Helper function for safe error handling
export function handleApiError(error, operation) {
    console.error(`Error in ${operation}:`, error);
    if (isApiError(error)) {
        if (error.response?.status === 401) {
            throw new Error('Authentication failed - please check your AGILITY_ACCESS_TOKEN');
        }
        if (error.response?.status === 404) {
            throw new Error(`Resource not found during ${operation}`);
        }
        if (error.response?.status === 429) {
            throw new Error(`Rate limit exceeded during ${operation} - please wait before retrying`);
        }
        throw new Error(`Failed ${operation}: ${error.message}`);
    }
    throw new Error(`Failed ${operation}: ${String(error)}`);
}
