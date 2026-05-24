/**
 * MCP Server Setup
 * Configures Model Context Protocol tools and resources for Air Traffic Control
 */

import {
  Server,
} from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  type TextContent,
} from '@modelcontextprotocol/sdk/types.js';

import { AirportState } from './state.js';
import { SchedulingEngine } from './scheduler.js';
import { ServerConfig } from './config.js';
import { Flight, FlightStatus } from './types.js';

export class MCPServer {
  private server: Server;
  private state: AirportState;
  private scheduler: SchedulingEngine;
  private config: ServerConfig;

  constructor(config: ServerConfig, state: AirportState, scheduler: SchedulingEngine) {
    this.config = config;
    this.state = state;
    this.scheduler = scheduler;
    this.server = new Server({
      name: config.mcp.serverName,
      version: config.mcp.serverVersion,
    });

    this.setupTools();
    this.setupResources();
    this.setupHandlers();
  }

  private setupTools(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'submit_flight',
          description:
            'Submit a new flight for scheduling. Accepts flight details including departure time, aircraft type, and priority.',
          inputSchema: {
            type: 'object' as const,
            properties: {
              flightNumber: {
                type: 'string',
                description: 'Flight number (e.g., AA123)',
              },
              airline: {
                type: 'string',
                description: 'Airline code',
              },
              aircraft: {
                type: 'string',
                description: 'Aircraft type (e.g., B737, A320)',
              },
              origin: {
                type: 'string',
                description: 'Origin airport code',
              },
              destination: {
                type: 'string',
                description: 'Destination airport code',
              },
              scheduledDeparture: {
                type: 'number',
                description: 'Scheduled departure time as Unix timestamp',
              },
              priority: {
                type: 'string',
                enum: ['high', 'medium', 'low'],
                description: 'Flight priority level',
              },
              passengerCount: {
                type: 'number',
                description: 'Number of passengers',
              },
              cargoWeight: {
                type: 'number',
                description: 'Cargo weight in kg',
              },
              dependencies: {
                type: 'array',
                items: { type: 'string' },
                description: 'IDs of flights this flight depends on',
              },
              specialHandling: {
                type: 'array',
                items: { type: 'string' },
                description: 'Special handling requirements',
              },
            },
            required: [
              'flightNumber',
              'airline',
              'aircraft',
              'origin',
              'destination',
              'scheduledDeparture',
              'priority',
            ],
          },
        },
        {
          name: 'generate_schedule',
          description:
            'Generate optimal flight schedule respecting priorities, dependencies, and airport constraints.',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
        {
          name: 'get_airport_status',
          description: 'Get current airport status including runway and gate utilization.',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
        {
          name: 'cancel_flight',
          description: 'Cancel a scheduled flight and release its allocated resources.',
          inputSchema: {
            type: 'object' as const,
            properties: {
              flightId: {
                type: 'string',
                description: 'Flight ID to cancel',
              },
              reason: {
                type: 'string',
                description: 'Reason for cancellation',
              },
            },
            required: ['flightId', 'reason'],
          },
        },
        {
          name: 'analyze_bottleneck',
          description:
            'Analyze current operational bottlenecks and provide recommendations for resolution.',
          inputSchema: {
            type: 'object' as const,
            properties: {},
          },
        },
      ],
    }));
  }

  private setupResources(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'airport://flight-queue',
          name: 'Flight Queue',
          description: 'Current queue of flights awaiting departure',
          mimeType: 'application/json',
        },
        {
          uri: 'airport://runway-usage',
          name: 'Runway Usage',
          description: 'Current runway allocation and availability',
          mimeType: 'application/json',
        },
        {
          uri: 'airport://operation-timeline',
          name: 'Operation Timeline',
          description: 'Timeline of scheduled flights and operations',
          mimeType: 'application/json',
        },
      ],
    }));
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'submit_flight':
            return await this.handleSubmitFlight((args ?? {}) as Record<string, unknown>);
          case 'generate_schedule':
            return await this.handleGenerateSchedule();
          case 'get_airport_status':
            return await this.handleGetAirportStatus();
          case 'cancel_flight':
            return await this.handleCancelFlight((args ?? {}) as Record<string, unknown>);
          case 'analyze_bottleneck':
            return await this.handleAnalyzeBottleneck();
          default:
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        if (uri === 'airport://flight-queue') {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    queue: this.state.getFlightQueue(),
                    totalInQueue: this.state.getFlightQueue().length,
                    flights: this.state
                      .getFlightQueue()
                      .map((id) => {
                        const flight = this.state.getFlight(id);
                        return flight
                          ? {
                              id: flight.id,
                              flightNumber: flight.flightNumber,
                              status: flight.status,
                              scheduledDeparture: flight.scheduledDeparture,
                              priority: flight.priority,
                            }
                          : null;
                      })
                      .filter(Boolean),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (uri === 'airport://runway-usage') {
          const airport = this.state.getAirportStatus();
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    airport: airport.code,
                    runways: airport.runways.map((r) => ({
                      id: r.id,
                      name: r.name,
                      status: r.status,
                      currentFlight: r.currentFlight,
                      nextAvailableTime: r.nextAvailableTime,
                    })),
                    utilization: this.state.getUtilizationMetrics().runwayUtilization,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (uri === 'airport://operation-timeline') {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    timeline: this.state.getOperationTimeline(),
                    totalFlights: this.state.getAllFlights().length,
                    statusBreakdown: this.getStatusBreakdown(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({ error: `Unknown resource: ${uri}` }),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                error: `Error reading resource: ${error instanceof Error ? error.message : String(error)}`,
              }),
            },
          ],
        };
      }
    });
  }

  private async handleSubmitFlight(
    args: Record<string, unknown>
  ): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const validationErrors = this.validateSubmitFlightArgs(args);
    if (validationErrors.length > 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                message: 'Validation failed for submit_flight',
                errors: validationErrors,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    const flightId = `FLT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const flight: Flight = {
      id: flightId,
      flightNumber: String(args.flightNumber),
      airline: String(args.airline),
      aircraft: String(args.aircraft),
      origin: String(args.origin),
      destination: String(args.destination),
      scheduledDeparture: Number(args.scheduledDeparture),
      priority: (args.priority as 'high' | 'medium' | 'low') || 'medium',
      status: 'scheduled',
      dependencies: (args.dependencies as string[]) || [],
      bufferMinutes: this.config.scheduling.bufferMinutes,
      passengerCount: Number(args.passengerCount) || 0,
      cargoWeight: Number(args.cargoWeight) || 0,
      specialHandling: (args.specialHandling as string[]) || [],
    };

    this.state.addFlight(flight);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Flight ${flight.flightNumber} submitted successfully`,
              flightId: flight.id,
              status: flight.status,
              scheduledDeparture: flight.scheduledDeparture,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGenerateSchedule(): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const analysis = this.scheduler.generateSchedule();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              feasible: analysis.feasible,
              estimatedCompletionTime: analysis.estimatedCompletionTime,
              conflictCount: analysis.conflicts.length,
              bottleneckCount: analysis.bottlenecks.length,
              suggestions: analysis.suggestions.slice(0, 10),
              conflicts: analysis.conflicts.slice(0, 5),
              bottlenecks: analysis.bottlenecks,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGetAirportStatus(): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const airport = this.state.getAirportStatus();
    const metrics = this.state.getUtilizationMetrics();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              airport: {
                code: airport.code,
                name: airport.name,
                timezone: airport.timezone,
              },
              resources: {
                totalRunways: airport.runways.length,
                availableRunways: airport.runways.filter((r) => r.status === 'available').length,
                totalGates: airport.gates.length,
                availableGates: airport.gates.filter((g) => g.status === 'available').length,
              },
              metrics: {
                runwayUtilization: metrics.runwayUtilization.toFixed(2) + '%',
                gateUtilization: metrics.gateUtilization.toFixed(2) + '%',
                totalScheduledFlights: airport.operationMetrics.totalFlightsScheduled,
                cancelledFlights: airport.operationMetrics.totalFlightsCancelled,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleCancelFlight(
    args: Record<string, unknown>
  ): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const flightId = String(args.flightId);
    const reason = String(args.reason);

    if (!flightId.trim() || !reason.trim()) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: 'Both flightId and reason must be non-empty strings',
            }),
          },
        ],
        isError: true,
      };
    }

    const flight = this.state.getFlight(flightId);

    if (!flight) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: `Flight ${flightId} not found`,
            }),
          },
        ],
        isError: true,
      };
    }

    const cancelled = this.state.cancelFlight(flightId, reason);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: cancelled,
              message: cancelled
                ? `Flight ${flight.flightNumber} cancelled`
                : `Failed to cancel flight ${flight.flightNumber}`,
              flightId: flight.id,
              reason,
              resourcesReleased: {
                runway: flight.runway,
                gate: flight.gate,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleAnalyzeBottleneck(): Promise<{
    content: TextContent[];
    isError?: boolean;
  }> {
    const bottlenecks = this.state.analyzeBottlenecks();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              bottleneckCount: bottlenecks.length,
              bottlenecks: bottlenecks.map((b) => ({
                type: b.type,
                severity: b.severity,
                affectedFlights: b.affectedFlights.length,
                estimatedDuration: b.estimatedDuration,
                recommendation: b.recommendation,
              })),
              currentMetrics: {
                runway: this.state.getUtilizationMetrics().runwayUtilization.toFixed(2),
                gate: this.state.getUtilizationMetrics().gateUtilization.toFixed(2),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private getStatusBreakdown(): Record<FlightStatus, number> {
    const breakdown: Record<FlightStatus, number> = {
      scheduled: 0,
      boarding: 0,
      pushback: 0,
      taxiing: 0,
      taking_off: 0,
      airborne: 0,
      landing: 0,
      landed: 0,
      cancelled: 0,
      delayed: 0,
      emergency: 0,
    };

    for (const flight of this.state.getAllFlights()) {
      breakdown[flight.status]++;
    }

    return breakdown;
  }

  private validateSubmitFlightArgs(args: Record<string, unknown>): string[] {
    const errors: string[] = [];

    const flightNumber = String(args.flightNumber ?? '').trim();
    const airline = String(args.airline ?? '').trim();
    const aircraft = String(args.aircraft ?? '').trim();
    const origin = String(args.origin ?? '').trim();
    const destination = String(args.destination ?? '').trim();
    const priority = String(args.priority ?? '').trim();

    if (!flightNumber) errors.push('flightNumber is required and must be non-empty');
    if (!airline) errors.push('airline is required and must be non-empty');
    if (!aircraft) errors.push('aircraft is required and must be non-empty');
    if (!origin) errors.push('origin is required and must be non-empty');
    if (!destination) errors.push('destination is required and must be non-empty');

    if (!['high', 'medium', 'low'].includes(priority)) {
      errors.push("priority must be one of: 'high', 'medium', 'low'");
    }

    const scheduledDeparture = Number(args.scheduledDeparture);
    if (!Number.isFinite(scheduledDeparture) || scheduledDeparture <= 0) {
      errors.push('scheduledDeparture must be a valid positive Unix timestamp');
    }

    const passengerCount = Number(args.passengerCount ?? 0);
    if (!Number.isFinite(passengerCount) || passengerCount < 0) {
      errors.push('passengerCount must be a non-negative number');
    }

    const cargoWeight = Number(args.cargoWeight ?? 0);
    if (!Number.isFinite(cargoWeight) || cargoWeight < 0) {
      errors.push('cargoWeight must be a non-negative number');
    }

    if (args.dependencies !== undefined && !Array.isArray(args.dependencies)) {
      errors.push('dependencies must be an array of flight IDs');
    }

    if (args.specialHandling !== undefined && !Array.isArray(args.specialHandling)) {
      errors.push('specialHandling must be an array of strings');
    }

    return errors;
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    if (this.config.debug) {
      console.error('MCP server started successfully');
    }
  }
}
