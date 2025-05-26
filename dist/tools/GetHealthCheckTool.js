import { MCPTool } from "mcp-framework";
import { z } from "zod";
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';
import { getRequiredEnvVar, getOptionalEnvVar, safeApiCall, validateApiResponse, safeJsonParse } from '../types/index.js';
// Load environment variables
dotenv.config();
class GetHealthCheckTool extends MCPTool {
    name = "agility-health-check";
    description = "Test Agility CMS API connectivity, response quality, and detect JSON parsing issues";
    schema = {
        includeContainerTest: {
            type: z.boolean().optional(),
            description: "Whether to test container operations (default: true)",
        },
        includeContentTest: {
            type: z.boolean().optional(),
            description: "Whether to test content operations (default: true)",
        },
        includeAssetTest: {
            type: z.boolean().optional(),
            description: "Whether to test asset operations (default: false)",
        },
    };
    initializeApiClient() {
        const options = new mgmtApi.Options();
        options.token = getRequiredEnvVar('AGILITY_ACCESS_TOKEN');
        return new mgmtApi.ApiClient(options);
    }
    async execute(input) {
        const startTime = Date.now();
        const issues = [];
        const warnings = [];
        const tests = [];
        console.log('🏥 Starting Agility CMS Health Check...');
        try {
            const apiClient = this.initializeApiClient();
            const guid = getRequiredEnvVar('AGILITY_WEBSITE_GUID');
            const locale = getOptionalEnvVar('AGILITY_LOCALE', 'en-us');
            console.log('✅ Environment variables loaded');
            console.log('✅ API client initialized');
            console.log(`🌍 Website GUID: ${guid}`);
            console.log(`🗣️ Locale: ${locale}`);
            // Test 1: Basic API connectivity with container list
            if (input.includeContainerTest !== false) {
                console.log('📦 Testing: Container list API...');
                const containerTestStart = Date.now();
                try {
                    const containers = await safeApiCall(() => apiClient.containerMethods.getContainerList(guid), 'health check - container list', 2, 500);
                    const containerTestTime = Date.now() - containerTestStart;
                    if (!containers) {
                        issues.push('Container list API failed after retries');
                    }
                    else {
                        // Validate response structure
                        if (!Array.isArray(containers)) {
                            issues.push('Container list is not an array');
                        }
                        else {
                            console.log(`✅ Container test passed: ${containers.length} containers found`);
                            // Check for JSON issues
                            const containerJson = JSON.stringify(containers);
                            if (containerJson.includes('<html>') || containerJson.includes('<!DOCTYPE')) {
                                issues.push('Container API returning HTML instead of JSON');
                            }
                            if (containerTestTime > 5000) {
                                warnings.push(`Slow container API response: ${containerTestTime}ms`);
                            }
                            tests.push({
                                name: 'Container List',
                                status: 'pass',
                                responseTime: containerTestTime,
                                itemCount: containers.length
                            });
                        }
                    }
                }
                catch (error) {
                    issues.push(`Container API error: ${error.message}`);
                    tests.push({
                        name: 'Container List',
                        status: 'fail',
                        error: error.message
                    });
                }
            }
            // Test 2: Content operations if we have containers
            if (input.includeContentTest !== false) {
                console.log('📝 Testing: Content operations...');
                try {
                    // First get containers to test with
                    const containers = await safeApiCall(() => apiClient.containerMethods.getContainerList(guid), 'health check - get containers for content test', 1, 500);
                    if (containers && containers.length > 0) {
                        const firstContainer = containers[0];
                        if (!firstContainer || !firstContainer.referenceName) {
                            warnings.push('First container found but has no reference name');
                        }
                        else {
                            const contentTestStart = Date.now();
                            // Test getting content items from first container
                            const contentItems = await safeApiCall(() => apiClient.contentMethods.getContentItems(firstContainer.referenceName, // Type assertion since we checked above
                            guid, locale, {
                                take: 5,
                                skip: 0,
                                sortField: 'contentID',
                                sortDirection: 'asc',
                                filter: '',
                                fields: '',
                                showDeleted: false
                            }), 'health check - content items', 2, 500);
                            const contentTestTime = Date.now() - contentTestStart;
                            if (!contentItems) {
                                warnings.push(`Content test failed for container: ${firstContainer.referenceName}`);
                            }
                            else {
                                // Validate content response
                                const isValid = validateApiResponse(contentItems, ['totalCount'], 'health check - content items');
                                if (!isValid) {
                                    warnings.push('Content items response has unexpected structure');
                                }
                                console.log(`✅ Content test passed: ${contentItems?.totalCount || 0} items in ${firstContainer.referenceName}`);
                                // Test individual content item if available
                                if (contentItems.items && contentItems.items.length > 0 && contentItems.items[0].length > 0) {
                                    const firstItem = contentItems.items[0][0];
                                    const itemId = firstItem.itemContainerID;
                                    if (itemId) {
                                        const itemTestStart = Date.now();
                                        const singleItem = await safeApiCall(() => apiClient.contentMethods.getContentItem(itemId, guid, locale), 'health check - single content item', 1, 500);
                                        const itemTestTime = Date.now() - itemTestStart;
                                        if (singleItem) {
                                            console.log(`✅ Individual content item test passed (ID: ${itemId})`);
                                            tests.push({
                                                name: 'Single Content Item',
                                                status: 'pass',
                                                responseTime: itemTestTime,
                                                itemId: itemId
                                            });
                                        }
                                        else {
                                            warnings.push(`Failed to fetch individual content item: ${itemId}`);
                                            tests.push({
                                                name: 'Single Content Item',
                                                status: 'fail',
                                                itemId: itemId
                                            });
                                        }
                                    }
                                }
                                tests.push({
                                    name: 'Content Items List',
                                    status: 'pass',
                                    responseTime: contentTestTime,
                                    container: firstContainer.referenceName,
                                    totalItems: contentItems?.totalCount || 0
                                });
                            }
                        }
                    }
                    else {
                        warnings.push('No containers available for content testing');
                    }
                }
                catch (error) {
                    warnings.push(`Content operations error: ${error.message}`);
                    tests.push({
                        name: 'Content Operations',
                        status: 'fail',
                        error: error.message
                    });
                }
            }
            // Test 3: Asset operations (optional)
            if (input.includeAssetTest === true) {
                console.log('🖼️ Testing: Asset operations...');
                const assetTestStart = Date.now();
                try {
                    const assets = await safeApiCall(() => apiClient.assetMethods.getMediaList(10, 0, guid), 'health check - asset list', 2, 500);
                    const assetTestTime = Date.now() - assetTestStart;
                    if (!assets) {
                        warnings.push('Asset list API failed');
                    }
                    else {
                        console.log(`✅ Asset test passed: ${assets?.totalCount || 0} total assets`);
                        tests.push({
                            name: 'Asset List',
                            status: 'pass',
                            responseTime: assetTestTime,
                            totalAssets: assets?.totalCount || 0
                        });
                    }
                }
                catch (error) {
                    warnings.push(`Asset operations error: ${error.message}`);
                    tests.push({
                        name: 'Asset Operations',
                        status: 'fail',
                        error: error.message
                    });
                }
            }
            // Test 4: JSON parsing validation
            console.log('🔍 Testing: JSON response validation...');
            try {
                const testJson = '{"test": "value", "number": 123}';
                const parsed = safeJsonParse(testJson, 'health check');
                if (!parsed) {
                    warnings.push('JSON parsing function is not working properly');
                }
                else {
                    console.log('✅ JSON parsing test passed');
                }
                // Test malformed JSON handling
                const malformedJson = '{"test": "value", "incomplete';
                const parsedMalformed = safeJsonParse(malformedJson, 'health check - malformed');
                if (parsedMalformed !== null) {
                    warnings.push('JSON parsing should return null for malformed JSON');
                }
                else {
                    console.log('✅ Malformed JSON handling test passed');
                }
                tests.push({
                    name: 'JSON Parsing',
                    status: 'pass',
                    details: 'Both valid and invalid JSON handled correctly'
                });
            }
            catch (error) {
                issues.push(`JSON parsing test failed: ${error.message}`);
                tests.push({
                    name: 'JSON Parsing',
                    status: 'fail',
                    error: error.message
                });
            }
            const totalTime = Date.now() - startTime;
            const overallStatus = issues.length === 0 ? 'healthy' : 'unhealthy';
            console.log(`🏁 Health check completed in ${totalTime}ms`);
            console.log(`📊 Status: ${overallStatus.toUpperCase()}`);
            if (issues.length > 0) {
                console.log(`❌ Issues found: ${issues.length}`);
                issues.forEach(issue => console.log(`   - ${issue}`));
            }
            if (warnings.length > 0) {
                console.log(`⚠️ Warnings: ${warnings.length}`);
                warnings.forEach(warning => console.log(`   - ${warning}`));
            }
            return {
                success: true,
                status: overallStatus,
                executionTimeMs: totalTime,
                summary: {
                    testsRun: tests.length,
                    testsPassed: tests.filter(t => t.status === 'pass').length,
                    testsFailed: tests.filter(t => t.status === 'fail').length,
                    issuesFound: issues.length,
                    warningsFound: warnings.length
                },
                tests: tests,
                issues: issues,
                warnings: warnings,
                recommendations: this.generateRecommendations(issues, warnings),
                environment: {
                    guid: guid,
                    locale: locale,
                    hasToken: !!process.env.AGILITY_ACCESS_TOKEN
                },
                message: issues.length === 0
                    ? `All ${tests.length} health checks passed${warnings.length > 0 ? ` with ${warnings.length} warnings` : ''}`
                    : `Health check found ${issues.length} critical issues and ${warnings.length} warnings`
            };
        }
        catch (error) {
            const totalTime = Date.now() - startTime;
            console.error('❌ Health check failed:', error.message);
            return {
                success: false,
                status: 'error',
                executionTimeMs: totalTime,
                error: error.message,
                message: 'Health check could not complete due to critical error',
                issues: [`Critical error: ${error.message}`],
                recommendations: [
                    'Check your AGILITY_ACCESS_TOKEN is valid and not expired',
                    'Verify your AGILITY_WEBSITE_GUID is correct',
                    'Ensure you have network connectivity to Agility CMS'
                ]
            };
        }
    }
    generateRecommendations(issues, warnings) {
        const recommendations = [];
        // Check for common issues and provide recommendations
        if (issues.some(issue => issue.includes('Authentication'))) {
            recommendations.push('🔑 Regenerate your AGILITY_ACCESS_TOKEN - tokens typically expire after 1 hour');
        }
        if (issues.some(issue => issue.includes('HTML instead of JSON'))) {
            recommendations.push('🌐 You may be hitting rate limits - implement request throttling');
            recommendations.push('⏱️ Add delays between API calls to prevent overwhelming the server');
        }
        if (warnings.some(warning => warning.includes('Slow'))) {
            recommendations.push('🐌 Consider implementing caching for frequently accessed data');
            recommendations.push('📦 Use batch operations when possible to reduce API calls');
        }
        if (issues.some(issue => issue.includes('JSON parsing'))) {
            recommendations.push('🔧 Enable response validation in all tools');
            recommendations.push('🛡️ Implement additional error handling for malformed responses');
        }
        if (issues.length === 0 && warnings.length === 0) {
            recommendations.push('✨ Your Agility CMS integration is working perfectly!');
            recommendations.push('📈 Consider running this health check regularly to monitor API health');
        }
        return recommendations;
    }
}
export default GetHealthCheckTool;
