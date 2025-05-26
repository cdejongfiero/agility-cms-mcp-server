#!/usr/bin/env node
echo "Cleaning dist directory..."
rm -rf dist/*
echo "Dist directory cleaned. Running build..."
npm run build