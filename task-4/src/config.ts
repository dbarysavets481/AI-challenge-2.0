/**
 * Configuration Management
 * Loads and validates airport and MCP server configuration from environment variables
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ServerConfig {
  airport: AirportConfig;
  mcp: MCPConfig;
  scheduling: SchedulingConfig;
  debug: boolean;
}

interface AirportConfig {
  code: string;
  name: string;
  timezone: string;
  runwayCount: number;
  runwayNames: string[];
  gateCount: number;
  gateAvailabilityPercentage: number;
}

interface MCPConfig {
  serverName: string;
  serverVersion: string;
}

interface SchedulingConfig {
  bufferMinutes: number;
  bufferType: 'fixed' | 'dynamic';
  minTurnaroundMinutes: number;
  maxConcurrentOperations: number;
  dailyOperationLimit: number;
  hourlyOperationLimit: number;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

export function loadConfig(): ServerConfig {
  return {
    airport: {
      code: getEnv('AIRPORT_CODE', 'LAX'),
      name: getEnv('AIRPORT_NAME', 'Los Angeles International Airport'),
      timezone: getEnv('TIMEZONE', 'America/Los_Angeles'),
      runwayCount: getEnvNumber('RUNWAY_COUNT', 4),
      runwayNames: getEnv('RUNWAY_NAMES', '25L,25R,24L,24R').split(','),
      gateCount: getEnvNumber('GATE_COUNT', 130),
      gateAvailabilityPercentage: getEnvNumber('GATE_AVAILABILITY_PERCENTAGE', 90),
    },
    mcp: {
      serverName: getEnv('MCP_SERVER_NAME', 'air-traffic-control'),
      serverVersion: getEnv('MCP_SERVER_VERSION', '1.0.0'),
    },
    scheduling: {
      bufferMinutes: getEnvNumber('SCHEDULING_BUFFER_MINUTES', 15),
      bufferType: (getEnv('BUFFER_TYPE', 'dynamic') as 'fixed' | 'dynamic'),
      minTurnaroundMinutes: getEnvNumber('MIN_TURNAROUND_MINUTES', 45),
      maxConcurrentOperations: getEnvNumber('MAX_CONCURRENT_OPERATIONS', 6),
      dailyOperationLimit: getEnvNumber('DAILY_OPERATION_LIMIT', 2500),
      hourlyOperationLimit: getEnvNumber('HOURLY_OPERATION_LIMIT', 250),
    },
    debug: getEnv('DEBUG_MODE', 'false').toLowerCase() === 'true',
  };
}

export type { ServerConfig, AirportConfig, MCPConfig, SchedulingConfig };
