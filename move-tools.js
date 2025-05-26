#!/usr/bin/env node

/**
 * Move all tools to top-level and fix import paths
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';

const toolsDir = '/Users/connordejong/000claude/mcp-servers/agility/agility-mcp-server/src/tools';

// Function to recursively find all TypeScript files in subdirectories
function findTsFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Find all tool files in subdirectories
const toolFiles = findTsFiles(toolsDir).filter(file => !file.includes('/src/tools/GetContentModel')); // Exclude already moved

console.log('🔧 Moving tools to top level...');

toolFiles.forEach(file => {
  const fileName = basename(file);
  const newPath = join(toolsDir, fileName);
  
  try {
    // Read file content
    let content = readFileSync(file, 'utf8');
    
    // Fix import path - change from '../types' to '../types'
    if (content.includes("from '../types'")) {
      // Already correct for top level
    } else if (content.includes("from '../../types'")) {
      content = content.replace("from '../../types'", "from '../types'");
    }
    
    // Write to new location
    writeFileSync(newPath, content);
    
    // Remove original file
    execSync(`rm "${file}"`);
    
    console.log(`✅ Moved ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed to move ${fileName}:`, error.message);
  }
});

// Clean up empty directories
['assets', 'containers', 'content', 'models'].forEach(dir => {
  const dirPath = join(toolsDir, dir);
  try {
    const files = readdirSync(dirPath);
    if (files.length === 0) {
      execSync(`rmdir "${dirPath}"`);
      console.log(`🗑️ Removed empty directory: ${dir}`);
    }
  } catch (error) {
    // Directory might not exist or not be empty
  }
});

console.log('🎉 All tools moved to top level!');
