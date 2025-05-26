#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const toolsDir = 'src/tools';
const resourcesDir = 'src/resources';

// Function to fix imports in a file
function fixImports(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace '../types' with '../types/index.js'
  if (content.includes("from '../types'")) {
    content = content.replace(/from\s+['"]\.\.\/types['"]/g, "from '../types/index.js'");
    changed = true;
  }
  
  if (changed) {
    writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Fix all tools
console.log('Fixing imports in tools...');
const toolFiles = readdirSync(toolsDir).filter(f => f.endsWith('.ts'));
toolFiles.forEach(file => {
  fixImports(join(toolsDir, file));
});

// Fix all resources
console.log('Fixing imports in resources...');
const resourceFiles = readdirSync(resourcesDir).filter(f => f.endsWith('.ts'));
resourceFiles.forEach(file => {
  fixImports(join(resourcesDir, file));
});

console.log('Import fixes complete!');