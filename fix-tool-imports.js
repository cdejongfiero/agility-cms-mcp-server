#!/usr/bin/env node

/**
 * Fix import paths for moved tools
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const toolsDir = '/Users/connordejong/000claude/mcp-servers/agility/agility-mcp-server/src/tools';

// Get all TypeScript files in tools directory
const toolFiles = readdirSync(toolsDir)
  .filter(file => file.endsWith('.ts'))
  .map(file => join(toolsDir, file));

console.log(`🔧 Fixing import paths for ${toolFiles.length} tools...`);

toolFiles.forEach(file => {
  try {
    let content = readFileSync(file, 'utf8');
    let changed = false;

    // Fix import paths from subdirectories
    if (content.includes("from '../../types'")) {
      content = content.replace("from '../../types'", "from '../types'");
      changed = true;
    }

    if (changed) {
      writeFileSync(file, content);
      console.log(`✅ Fixed imports in ${file.split('/').pop()}`);
    }
  } catch (error) {
    console.error(`❌ Failed to fix ${file}:`, error.message);
  }
});

console.log('🎉 All import paths fixed!');
