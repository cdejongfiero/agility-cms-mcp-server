#!/usr/bin/env node

/**
 * SDK Diagnostic Script - Let's see what's actually available
 */

import * as dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Diagnosing Agility Management SDK...\n');

try {
  // Test ES6 import
  const mgmtApi = await import('@agility/management-sdk');
  console.log('✅ ES6 import successful');
  console.log('Available exports:', Object.keys(mgmtApi));
  
  // Try to create instances
  if (mgmtApi.Options) {
    console.log('✅ Options class found');
    
    const options = new mgmtApi.Options();
    
    if (process.env.AGILITY_ACCESS_TOKEN) {
      options.token = process.env.AGILITY_ACCESS_TOKEN;
      console.log('✅ Token set successfully');
    }
    
    if (mgmtApi.ApiClient) {
      console.log('✅ ApiClient class found');
      
      try {
        const apiClient = new mgmtApi.ApiClient(options);
        console.log('✅ ApiClient instance created');
        
        // Check actual method names
        console.log('\n📋 Available Methods:');
        if (apiClient.contentMethods) {
          const contentMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient.contentMethods))
            .filter(name => name !== 'constructor' && typeof apiClient.contentMethods[name] === 'function');
          console.log('Content methods:', contentMethods);
        }
        
        if (apiClient.modelMethods) {
          const modelMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient.modelMethods))
            .filter(name => name !== 'constructor' && typeof apiClient.modelMethods[name] === 'function');
          console.log('Model methods:', modelMethods);
        }
        
        if (apiClient.containerMethods) {
          const containerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient.containerMethods))
            .filter(name => name !== 'constructor' && typeof apiClient.containerMethods[name] === 'function');
          console.log('Container methods:', containerMethods);
        }
        
        if (apiClient.assetMethods) {
          const assetMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient.assetMethods))
            .filter(name => name !== 'constructor' && typeof apiClient.assetMethods[name] === 'function');
          console.log('Asset methods:', assetMethods);
        }
        
        // Test a simple call
        if (process.env.AGILITY_WEBSITE_GUID) {
          console.log('\n🧪 Testing API call...');
          try {
            const guid = process.env.AGILITY_WEBSITE_GUID;
            // Try the containers call
            const containers = await apiClient.containerMethods.getContainers(guid);
            console.log(`✅ API call successful! Found ${containers.length} containers`);
            
            if (containers.length > 0) {
              console.log(`First container: "${containers[0].referenceName}" (ID: ${containers[0].containerID})`);
            }
          } catch (error) {
            console.error('❌ API call failed:', error.message);
          }
        }
        
      } catch (error) {
        console.error('❌ Failed to create ApiClient:', error.message);
      }
    }
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n📋 Environment check:');
console.log('Node version:', process.version);
console.log('Has AGILITY_ACCESS_TOKEN:', !!process.env.AGILITY_ACCESS_TOKEN);
console.log('Has AGILITY_WEBSITE_GUID:', !!process.env.AGILITY_WEBSITE_GUID);
