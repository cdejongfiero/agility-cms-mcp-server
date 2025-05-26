#!/usr/bin/env node
import { MCPServer } from "mcp-framework";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = new MCPServer({
    name: "agility-mcp-server",
    version: "0.0.1"
});
console.error('Starting Agility MCP Server...');
// Start the server
await server.start();
console.error('Agility MCP Server started successfully');
// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.error('Shutting down Agility MCP Server...');
    await server.stop();
    process.exit(0);
});
