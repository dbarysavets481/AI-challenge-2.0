/**
 * Scheduling Engine
 * Implements deterministic scheduling with priorities, dependencies, and buffer management
 */

import { Flight, ScheduleEntry, ScheduleAnalysis, FlightConflict } from './types.js';
import { AirportState } from './state.js';
import { ServerConfig } from './config.js';

export class SchedulingEngine {
  private config: ServerConfig;
  private state: AirportState;

  constructor(config: ServerConfig, state: AirportState) {
    this.config = config;
    this.state = state;
  }

  /**
   * Generate optimal schedule for flights
   * Respects priorities, dependencies, and constraints
   */
  generateSchedule(): ScheduleAnalysis {
    const flights = this.state.getAllFlights().filter((f) => f.status === 'scheduled');

    // Sort by priority and scheduled time
    const sortedFlights = this.sortFlightsByPriority(flights);

    const schedule: ScheduleEntry[] = [];
    const conflicts: FlightConflict[] = [];
    const suggestions: string[] = [];

    // Track resource allocation
    const runwayUsage = this.initializeRunwayUsage();
    const gateUsage = this.initializeGateUsage();

    for (const flight of sortedFlights) {
      // Reject circular dependencies explicitly to prevent deadlocks.
      if (this.hasCircularDependency(flight.id)) {
        conflicts.push({
          flight1Id: flight.id,
          flight2Id: '',
          conflictType: 'dependency',
          conflictTime: flight.scheduledDeparture,
          resolution: `Circular dependency detected for flight ${flight.flightNumber}`,
        });
        suggestions.push(
          `Resolve circular dependency chain for flight ${flight.flightNumber} before scheduling`
        );
        continue;
      }

      // Check dependencies are satisfied
      if (!this.areDependenciesSatisfied(flight, schedule)) {
        suggestions.push(`Flight ${flight.flightNumber} waiting for dependencies to complete`);
        continue;
      }

      const effectiveBufferMinutes = this.getEffectiveBufferMinutes(flight);

      // Find available runway and gate
      const availableRunway = this.findAvailableRunway(
        flight,
        runwayUsage,
        effectiveBufferMinutes
      );
      const availableGate = this.findAvailableGate(flight, gateUsage);

      if (!availableRunway || !availableGate) {
        conflicts.push({
          flight1Id: flight.id,
          flight2Id: '',
          conflictType: availableRunway ? 'gate' : 'runway',
          conflictTime: flight.scheduledDeparture,
          resolution: `Insufficient ${!availableRunway ? 'runway' : 'gate'} capacity`,
        });
        suggestions.push(
          `Consider delaying flight ${flight.flightNumber} due to resource constraints`
        );
        continue;
      }

      // Allocate resources
      const scheduledTime = this.calculateDepartureTime(
        flight,
        availableRunway,
        runwayUsage,
        effectiveBufferMinutes
      );

      const duration = this.estimateOperationDuration(flight);

      if (!this.canScheduleWithinOperationLimits(schedule, scheduledTime, duration)) {
        conflicts.push({
          flight1Id: flight.id,
          flight2Id: '',
          conflictType: 'time',
          conflictTime: scheduledTime,
          resolution:
            'Operation limits exceeded (max concurrent, hourly, or daily capacity).',
        });
        suggestions.push(
          `Delay flight ${flight.flightNumber} to satisfy concurrent/hourly/daily operation limits`
        );
        continue;
      }

      runwayUsage[availableRunway] = scheduledTime + duration;
      gateUsage[availableGate] = scheduledTime + duration;

      schedule.push({
        flightId: flight.id,
        runwayId: availableRunway,
        gateId: availableGate,
        scheduledTime,
        duration,
        dependencies: flight.dependencies,
        conflict: false,
      });

      flight.estimatedDeparture = scheduledTime;
      this.state.allocateRunway(flight.id, availableRunway, scheduledTime, duration);
      this.state.allocateGate(flight.id, availableGate, scheduledTime, duration);
    }

    // Detect and analyze conflicts
    const detectedConflicts = this.detectConflicts(schedule, sortedFlights);
    conflicts.push(...detectedConflicts);

    // Calculate estimated completion time
    const estimatedCompletion =
      schedule.length > 0
        ? Math.max(...schedule.map((s) => s.scheduledTime + s.duration))
        : Date.now();

    const feasible = conflicts.length === 0;

    return {
      feasible,
      conflicts: detectedConflicts,
      bottlenecks: this.state.analyzeBottlenecks(),
      suggestions,
      estimatedCompletionTime: estimatedCompletion,
    };
  }

  /**
   * Sort flights by priority and timing
   */
  private sortFlightsByPriority(flights: Flight[]): Flight[] {
    const priorityMap = { high: 0, medium: 1, low: 2 };

    return flights.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityMap[a.priority] - priorityMap[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by scheduled departure time
      return a.scheduledDeparture - b.scheduledDeparture;
    });
  }

  /**
   * Check if flight dependencies are satisfied
   */
  private areDependenciesSatisfied(flight: Flight, schedule: ScheduleEntry[]): boolean {
    if (flight.dependencies.length === 0) return true;

    for (const depId of flight.dependencies) {
      const depFlight = this.state.getFlight(depId);
      if (!depFlight) return false;

      // Dependency must be completed before this flight departs
      const hasDepartureBefore =
        !depFlight.estimatedDeparture || depFlight.estimatedDeparture < flight.scheduledDeparture;

      if (!hasDepartureBefore) return false;
    }

    return true;
  }

  /**
   * Detect circular dependency chains with DFS.
   */
  private hasCircularDependency(flightId: string): boolean {
    return this.visitDependency(flightId, new Set<string>(), new Set<string>());
  }

  private visitDependency(
    flightId: string,
    visiting: Set<string>,
    visited: Set<string>
  ): boolean {
    if (visiting.has(flightId)) return true;
    if (visited.has(flightId)) return false;

    const flight = this.state.getFlight(flightId);
    if (!flight) return false;

    visiting.add(flightId);

    for (const depId of flight.dependencies) {
      if (this.visitDependency(depId, visiting, visited)) {
        return true;
      }
    }

    visiting.delete(flightId);
    visited.add(flightId);
    return false;
  }

  /**
   * Effective buffer behavior:
   * - fixed: one global buffer from config
   * - dynamic: tighter for high priority, larger for low priority
   */
  private getEffectiveBufferMinutes(flight: Flight): number {
    if (this.config.scheduling.bufferType === 'fixed') {
      return this.config.scheduling.bufferMinutes;
    }

    const base = this.config.scheduling.bufferMinutes;
    const adjustment = flight.priority === 'high' ? -5 : flight.priority === 'low' ? 5 : 0;
    return Math.max(1, base + adjustment);
  }

  private canScheduleWithinOperationLimits(
    schedule: ScheduleEntry[],
    scheduledTime: number,
    duration: number
  ): boolean {
    const endTime = scheduledTime + duration;

    const concurrentAtTime = schedule.filter((entry) => {
      const entryEnd = entry.scheduledTime + entry.duration;
      return scheduledTime < entryEnd && endTime > entry.scheduledTime;
    }).length;

    if (concurrentAtTime >= this.config.scheduling.maxConcurrentOperations) {
      return false;
    }

    const hourStart = new Date(scheduledTime);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = hourStart.getTime() + 60 * 60 * 1000;
    const hourlyCount = schedule.filter(
      (entry) => entry.scheduledTime >= hourStart.getTime() && entry.scheduledTime < hourEnd
    ).length;

    if (hourlyCount >= this.config.scheduling.hourlyOperationLimit) {
      return false;
    }

    const dayStart = new Date(scheduledTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;
    const dailyCount = schedule.filter(
      (entry) => entry.scheduledTime >= dayStart.getTime() && entry.scheduledTime < dayEnd
    ).length;

    if (dailyCount >= this.config.scheduling.dailyOperationLimit) {
      return false;
    }

    return true;
  }

  /**
   * Initialize runway usage tracking
   */
  private initializeRunwayUsage(): Record<string, number> {
    const usage: Record<string, number> = {};
    const airport = this.state.getAirportStatus();

    for (const runway of airport.runways) {
      usage[runway.id] = runway.nextAvailableTime;
    }

    return usage;
  }

  /**
   * Initialize gate usage tracking
   */
  private initializeGateUsage(): Record<string, number> {
    const usage: Record<string, number> = {};
    const airport = this.state.getAirportStatus();

    for (const gate of airport.gates) {
      usage[gate.id] = gate.nextAvailableTime;
    }

    return usage;
  }

  /**
   * Find available runway based on aircraft requirements and timing
   */
  private findAvailableRunway(
    flight: Flight,
    runwayUsage: Record<string, number>,
    bufferMinutes: number
  ): string | null {
    const airport = this.state.getAirportStatus();

    // Find earliest available runway
    let bestRunway: string | null = null;
    let earliestAvailability = Infinity;

    for (const runway of airport.runways) {
      if (runway.status === 'closed' || runway.status === 'maintenance') continue;

      const availability = runwayUsage[runway.id];
      const bufferMs = bufferMinutes * 60 * 1000;
      const effectiveAvailability = availability + bufferMs;

      if (effectiveAvailability < earliestAvailability) {
        earliestAvailability = effectiveAvailability;
        bestRunway = runway.id;
      }
    }

    return bestRunway;
  }

  /**
   * Find available gate suitable for aircraft type
   */
  private findAvailableGate(flight: Flight, gateUsage: Record<string, number>): string | null {
    const airport = this.state.getAirportStatus();

    // Determine aircraft size
    let requiredSize: 'small' | 'medium' | 'large' = 'medium';
    if (flight.aircraft.includes('A380') || flight.aircraft.includes('B747')) {
      requiredSize = 'large';
    } else if (flight.aircraft.includes('CRJ') || flight.aircraft.includes('E190')) {
      requiredSize = 'small';
    }

    // Find earliest available suitable gate
    let bestGate: string | null = null;
    let earliestAvailability = Infinity;

    for (const gate of airport.gates) {
      if (gate.status === 'closed' || gate.status === 'maintenance') continue;

      // Check size compatibility
      if (gate.aircraftSize !== 'any' && gate.aircraftSize !== requiredSize) {
        continue;
      }

      const availability = gateUsage[gate.id];

      if (availability < earliestAvailability) {
        earliestAvailability = availability;
        bestGate = gate.id;
      }
    }

    return bestGate;
  }

  /**
   * Calculate actual departure time respecting constraints
   */
  private calculateDepartureTime(
    flight: Flight,
    runwayId: string,
    runwayUsage: Record<string, number>,
    bufferMinutes: number
  ): number {
    const bufferMs = bufferMinutes * 60 * 1000;
    let departureTime = flight.scheduledDeparture;

    // Must depart after runway becomes available
    const runwayAvailable = runwayUsage[runwayId] + bufferMs;
    if (runwayAvailable > departureTime) {
      departureTime = runwayAvailable;
    }

    // Must depart after all dependencies complete
    for (const depId of flight.dependencies) {
      const depFlight = this.state.getFlight(depId);
      if (depFlight && depFlight.estimatedDeparture) {
        const minTurnaround = this.config.scheduling.minTurnaroundMinutes * 60 * 1000;
        const depCompletionTime = depFlight.estimatedDeparture + minTurnaround;

        if (depCompletionTime > departureTime) {
          departureTime = depCompletionTime;
        }
      }
    }

    return departureTime;
  }

  /**
   * Estimate duration of flight operation at airport
   */
  private estimateOperationDuration(flight: Flight): number {
    // Base duration: 30 minutes
    let duration = 30 * 60 * 1000;

    // Add buffer based on priority
    const bufferMap = { high: 15, medium: 20, low: 25 };
    duration += bufferMap[flight.priority] * 60 * 1000;

    // Add based on passenger count (0.5 min per 10 passengers)
    duration += (flight.passengerCount / 10) * 0.5 * 60 * 1000;

    // Add based on cargo weight
    if (flight.cargoWeight > 5000) {
      duration += 10 * 60 * 1000;
    }

    return duration;
  }

  /**
   * Detect conflicts between scheduled flights
   */
  private detectConflicts(schedule: ScheduleEntry[], flights: Flight[]): FlightConflict[] {
    const conflicts: FlightConflict[] = [];

    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const entry1 = schedule[i];
        const entry2 = schedule[j];

        // Check runway conflict
        if (entry1.runwayId === entry2.runwayId) {
          const gap = entry2.scheduledTime - (entry1.scheduledTime + entry1.duration);
          if (gap < 5 * 60 * 1000) {
            // Less than 5 minute gap
            conflicts.push({
              flight1Id: entry1.flightId,
              flight2Id: entry2.flightId,
              conflictType: 'runway',
              conflictTime: entry2.scheduledTime,
              resolution: `Add minimum 5-minute gap between runway usage`,
            });
          }
        }

        // Check gate conflict
        if (entry1.gateId === entry2.gateId) {
          const gap = entry2.scheduledTime - (entry1.scheduledTime + entry1.duration);
          if (gap < 0) {
            conflicts.push({
              flight1Id: entry1.flightId,
              flight2Id: entry2.flightId,
              conflictType: 'gate',
              conflictTime: entry2.scheduledTime,
              resolution: `Gate double-booked, reassign one flight`,
            });
          }
        }

        // Check dependency conflict
        const flight1 = flights.find((f) => f.id === entry1.flightId);
        if (flight1 && flight1.dependencies.includes(entry2.flightId)) {
          if (entry1.scheduledTime <= entry2.scheduledTime) {
            conflicts.push({
              flight1Id: entry1.flightId,
              flight2Id: entry2.flightId,
              conflictType: 'dependency',
              conflictTime: entry1.scheduledTime,
              resolution: `Dependency ${entry2.flightId} must depart before ${entry1.flightId}`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Optimize schedule by adjusting low-priority flights
   */
  optimizeSchedule(): void {
    const flights = this.state.getAllFlights().filter((f) => f.status === 'scheduled');
    const analysis = this.generateSchedule();

    if (analysis.conflicts.length > 0 && analysis.suggestions.length > 0) {
      // Implement suggested optimizations
      for (const flight of flights) {
        if (flight.priority === 'low' && analysis.suggestions.length > 0) {
          // Could delay low-priority flights
          flight.scheduledDeparture += 30 * 60 * 1000; // Delay by 30 minutes
        }
      }
    }
  }
}
