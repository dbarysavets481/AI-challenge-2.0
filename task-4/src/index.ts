/**
 * Air Traffic Control MCP Server
 * Main entry point for the server
 */

import { loadConfig } from './config.js';
import { AirportState } from './state.js';
import { SchedulingEngine } from './scheduler.js';
import { MCPServer } from './mcp.js';

async function main(): Promise<void> {
  try {
    // Load configuration from environment
    const config = loadConfig();

    // Initialize airport state
    const state = new AirportState(config);

    // Initialize scheduling engine
    const scheduler = new SchedulingEngine(config, state);

    // Create and start MCP server
    const server = new MCPServer(config, state, scheduler);
    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
