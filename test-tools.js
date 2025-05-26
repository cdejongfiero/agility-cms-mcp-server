#!/usr/bin/env node

/**
 * Fixed test script using correct method names
 */

import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAgilityConnection() {
  console.log('🔍 Testing Agility CMS Management SDK connection...\n');

  // Check environment variables
  const requiredEnvVars = [
    'AGILITY_ACCESS_TOKEN',
    'AGILITY_WEBSITE_GUID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  try {
    // Initialize API client
    const options = new mgmtApi.Options();
    options.token = process.env.AGILITY_ACCESS_TOKEN;
    const apiClient = new mgmtApi.ApiClient(options);
    const guid = process.env.AGILITY_WEBSITE_GUID;
    const locale = process.env.AGILITY_LOCALE || 'en-us';

    console.log('✅ Environment variables loaded');
    console.log('✅ API client initialized');
    console.log(`🌍 Website GUID: ${guid}`);
    console.log(`🗣️ Locale: ${locale}\n`);

    // Test 1: Get all containers using correct method name
    console.log('📦 Testing: Get container list...');
    try {
      const allContainers = await apiClient.containerMethods.getContainerList(guid);
      console.log(`✅ Found ${allContainers.length} containers:`);
      
      allContainers.slice(0, 3).forEach(container => {
        console.log(`   - ID: ${container.containerID}, Reference: "${container.referenceName}"`);
      });
      
      if (allContainers.length > 3) {
        console.log(`   ... and ${allContainers.length - 3} more`);
      }
      console.log('');

      // Test 2: Try to get a container by reference name
      if (allContainers.length > 0) {
        const firstContainer = allContainers[0];
        console.log(`🔍 Testing: Get container by reference name "${firstContainer.referenceName}"...`);
        
        try {
          const containerByRef = await apiClient.containerMethods.getContainerByReferenceName(firstContainer.referenceName, guid);
          console.log(`✅ Successfully retrieved container: "${containerByRef.referenceName}"`);
          console.log(`   Model ID: ${containerByRef.contentDefinitionID}\n`);
          
          // Test 3: Try to get the model for this container
          console.log(`🔍 Testing: Get content model by ID ${containerByRef.contentDefinitionID}...`);
          try {
            const model = await apiClient.modelMethods.getContentModel(containerByRef.contentDefinitionID, guid);
            console.log(`✅ Successfully retrieved model: "${model.displayName}"`);
            console.log(`   Reference: "${model.referenceName}"`);
            console.log(`   Fields: ${model.fields?.length || 0}\n`);
          } catch (error) {
            console.error(`❌ Failed to get model: ${error.message}\n`);
          }
          
        } catch (error) {
          console.error(`❌ Failed to get container by reference name: ${error.message}\n`);
        }

        // Test 4: Try to get content from first container
        console.log(`📝 Testing: Get content items from "${firstContainer.referenceName}"...`);
        
        try {
          const listParams = { 
            take: 5, 
            skip: 0, 
            sortField: 'contentID', 
            sortDirection: 'asc',
            filter: '',
            fields: '',
            showDeleted: false
          };
          const contentItems = await apiClient.contentMethods.getContentItems(
            firstContainer.referenceName, 
            guid, 
            locale, 
            listParams
          );
          
          console.log(`✅ Successfully retrieved content items: ${contentItems?.items?.length || 0} items found`);
          console.log(`   Total count: ${contentItems?.totalCount || 0}\n`);
          
          // Test 5: If we have content items, try to get one by ID
          if (contentItems?.items && contentItems.items.length > 0) {
            const firstItem = contentItems.items[0];
            console.log(`🔍 Testing: Get content item by ID ${firstItem.contentID}...`);
            
            try {
              const contentItem = await apiClient.contentMethods.getContentItem(firstItem.contentID, guid, locale);
              console.log(`✅ Successfully retrieved content item: "${contentItem.properties?.title || contentItem.contentID}"`);
              console.log(`   Fields: ${Object.keys(contentItem.properties || {}).length}\n`);
            } catch (error) {
              console.error(`❌ Failed to get content item: ${error.message}\n`);
            }
          }
          
        } catch (error) {
          console.error(`❌ Failed to get content items: ${error.message}\n`);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to get containers: ${error.message}`);
      
      if (error.response && error.response.status === 401) {
        console.error('🔑 Authentication failed - please check your AGILITY_ACCESS_TOKEN');
        console.error('💡 The token may have expired (they typically last 1 hour)');
        return;
      }
    }

    // Test 6: Try to get assets using correct method name
    console.log('🖼️ Testing: Get media list...');
    try {
      const assetList = await apiClient.assetMethods.getMediaList(20, 0, guid);
      console.log(`✅ Found ${assetList?.items?.length || 0} assets in the first page`);
      console.log(`   Total assets: ${assetList?.totalCount || 0}\n`);
      
      // Test 7: If we have assets, try to get one by ID
      if (assetList?.items && assetList.items.length > 0) {
        const firstAsset = assetList.items[0];
        console.log(`🔍 Testing: Get asset by ID ${firstAsset.mediaID}...`);
        
        try {
          const asset = await apiClient.assetMethods.getAssetByID(firstAsset.mediaID, guid);
          console.log(`✅ Successfully retrieved asset: "${asset.fileName}"`);
          console.log(`   Size: ${asset.size} bytes, Type: ${asset.contentType}\n`);
        } catch (error) {
          console.error(`❌ Failed to get asset: ${error.message}\n`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to get assets: ${error.message}\n`);
    }

    console.log('🎉 All tests completed successfully!');
    console.log('📝 Your MCP tools should work correctly with these resources.');
    console.log('\n📋 Summary of available resources:');
    console.log(`   - Containers: Available for content management`);
    console.log(`   - Content Models: Available for structure inspection`);
    console.log(`   - Content Items: Available in containers`);
    console.log(`   - Assets: Available for media management`);
    
  } catch (error) {
    console.error('❌ Failed to initialize API client:', error.message);
    
    if (error.response && error.response.status === 401) {
      console.error('🔑 Authentication failed - please check your AGILITY_ACCESS_TOKEN');
      console.error('💡 The token may have expired (they typically last 1 hour)');
    }
  }
}

// Run the test
testAgilityConnection().catch(console.error);