#!/usr/bin/env node

/**
 * Fix TypeScript import paths and error handling across all tools
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const toolFiles = globSync('src/tools/**/*.ts');

console.log(`🔧 Fixing ${toolFiles.length} tool files...`);

toolFiles.forEach(file => {
  let content = readFileSync(file, 'utf8');
  let changed = false;

  // Fix import paths - remove .js extension
  if (content.includes("'../types/agility-types.js'")) {
    content = content.replace("'../types/agility-types.js'", "'../types/agility-types'");
    changed = true;
  }

  // Add handleApiError to imports if not present
  if (content.includes('import { getRequiredEnvVar, isApiError }') && !content.includes('handleApiError')) {
    content = content.replace(
      'import { getRequiredEnvVar, isApiError }',
      'import { getRequiredEnvVar, handleApiError }'
    );
    changed = true;
  }

  if (content.includes('import { getRequiredEnvVar, getOptionalEnvVar, isApiError }') && !content.includes('handleApiError')) {
    content = content.replace(
      'import { getRequiredEnvVar, getOptionalEnvVar, isApiError }',
      'import { getRequiredEnvVar, getOptionalEnvVar, handleApiError }'
    );
    changed = true;
  }

  // Replace manual error handling with handleApiError
  if (content.includes('} catch (error: unknown) {')) {
    // Find the operation name from the tool class name
    const classMatch = content.match(/class (\w+Tool)/);
    if (classMatch) {
      const className = classMatch[1];
      const operation = className.replace('Tool', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      
      // Replace the entire catch block
      const catchBlockRegex = /} catch \(error: unknown\) \{[\s\S]*?throw new Error\(`[^`]+`\);\s*\}/g;
      if (catchBlockRegex.test(content)) {
        content = content.replace(catchBlockRegex, `} catch (error: unknown) {
      handleApiError(error, '${operation}');
    }`);
        changed = true;
      }
    }
  }

  if (changed) {
    writeFileSync(file, content);
    console.log(`✅ Fixed ${file}`);
  }
});

console.log('🎉 All import paths fixed!');
