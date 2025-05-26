// Test script to validate Agility Management SDK calls
import * as mgmtApi from '@agility/management-sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSdk() {
  try {
    console.log('Testing Agility Management SDK...');
    
    const token = process.env.AGILITY_ACCESS_TOKEN;
    const guid = process.env.AGILITY_WEBSITE_GUID;
    
    console.log(`Token exists: ${!!token}`);
    console.log(`GUID: ${guid}`);
    
    if (!token || !guid) {
      throw new Error('Missing AGILITY_ACCESS_TOKEN or AGILITY_WEBSITE_GUID');
    }
    
    // Initialize API client
    const options = new mgmtApi.Options();
    options.token = token;
    const apiClient = new mgmtApi.ApiClient(options);
    
    console.log('API client initialized successfully');
    
    // Test 1: Get all content models
    console.log('\n--- Test 1: Getting all content models ---');
    const allModels = await apiClient.modelMethods.getContentModules(false, guid, false);
    console.log(`Found ${allModels.length} content models`);
    
    if (allModels.length > 0) {
      console.log('First few models:');
      allModels.slice(0, 3).forEach(model => {
        console.log(`- ${model.referenceName} (${model.displayName})`);
      });
      
      // Test 2: Get specific model by reference name (use first one)
      const firstModelRef = allModels[0].referenceName;
      if (firstModelRef) {
        console.log(`\n--- Test 2: Getting model by reference name: ${firstModelRef} ---`);
        const specificModel = await apiClient.modelMethods.getModelByReferenceName(firstModelRef, guid);
        console.log(`Successfully retrieved: ${specificModel.referenceName} (${specificModel.displayName})`);
      }
    }
    
    console.log('\n✅ SDK test completed successfully');
    
  } catch (error) {
    console.error('\n❌ SDK test failed:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Full error:', error);
  }
}

testSdk();