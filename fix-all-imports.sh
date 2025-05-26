#!/usr/bin/env bash

echo "Fixing import patterns in all TypeScript files..."

# Fix all files that import from '../types' to import from '../types/index.js'
find src/tools -name "*.ts" -exec sed -i '' "s|from '../types'|from '../types/index.js'|g" {} \;
find src/resources -name "*.ts" -exec sed -i '' "s|from '../types'|from '../types/index.js'|g" {} \;
find src/prompts -name "*.ts" -exec sed -i '' "s|from '../types'|from '../types/index.js'|g" {} \;

echo "Import fixes complete! Files updated:"
grep -r "from '../types/index.js'" src/ || echo "No files found with the pattern"

echo "Checking for remaining '../types' imports..."
grep -r "from '../types'" src/ | grep -v "index.js" || echo "All imports fixed!"