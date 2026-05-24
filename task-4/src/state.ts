/**
 * State Management
 * Manages the current state of flights, runways, gates, and airport operations
 */

import {
  Airport,
  Flight,
  Runway,
  Gate,
  OperationMetrics,
  FlightStatus,
  Bottleneck,
} from './types.js';
import { ServerConfig } from './config.js';

export class AirportState {
  private airport: Airport;
  private flights: Map<string, Flight>;
  private flightQueue: string[]; // Flight IDs waiting to be scheduled
  private schedule: Map<string, { runway: string; gate: string; time: number }>;

  constructor(config: ServerConfig) {
    this.flights = new Map();
    this.flightQueue = [];
    this.schedule = new Map();

    // Initialize airport
    this.airport = {
      code: config.airport.code,
      name: config.airport.name,
      timezone: config.airport.timezone,
      runways: this.initializeRunways(config),
      gates: this.initializeGates(config),
      operationMetrics: {
        totalFlightsScheduled: 0,
        totalFlightsCancelled: 0,
        totalFlightsCompleted: 0,
        averageDelay: 0,
        runwayUtilization: 0,
        gateUtilization: 0,
        bottlenecks: [],
      },
    };
  }

  private initializeRunways(config: ServerConfig): Runway[] {
    return config.airport.runwayNames.map((name, idx) => ({
      id: `RW${idx + 1}`,
      name,
      status: 'available',
      nextAvailableTime: Date.now(),
      maintenanceSchedule: [],
    }));
  }

  private initializeGates(config: ServerConfig): Gate[] {
    const gates: Gate[] = [];
    const availableGates = Math.floor(
      (config.airport.gateCount * config.airport.gateAvailabilityPercentage) / 100
    );
    const sizeDistribution = {
      small: Math.floor(availableGates * 0.3),
      medium: Math.floor(availableGates * 0.5),
      large: availableGates - Math.floor(availableGates * 0.3) - Math.floor(availableGates * 0.5),
    };

    let gateNum = 1;
    for (const size of ['small', 'medium', 'large'] as const) {
      for (let i = 0; i < sizeDistribution[size]; i++) {
        gates.push({
          id: `G${gateNum}`,
          number: `${gateNum}`,
          status: 'available',
          nextAvailableTime: Date.now(),
          aircraftSize: size,
        });
        gateNum++;
      }
    }

    return gates;
  }

  /**
   * Add a flight to the queue for scheduling
   */
  addFlight(flight: Flight): void {
    this.flights.set(flight.id, flight);
    this.flightQueue.push(flight.id);
    this.updateMetrics();
  }

  /**
   * Get a flight by ID
   */
  getFlight(flightId: string): Flight | undefined {
    return this.flights.get(flightId);
  }

  /**
   * Get all flights
   */
  getAllFlights(): Flight[] {
    return Array.from(this.flights.values());
  }

  /**
   * Get flights in queue
   */
  getFlightQueue(): string[] {
    return [...this.flightQueue];
  }

  /**
   * Update flight status
   */
  updateFlightStatus(flightId: string, status: FlightStatus): void {
    const flight = this.flights.get(flightId);
    if (flight) {
      flight.status = status;
      this.updateMetrics();
    }
  }

  /**
   * Allocate runway to flight
   */
  allocateRunway(flightId: string, runwayId: string, time: number, duration: number): boolean {
    const runway = this.airport.runways.find((r) => r.id === runwayId);
    const flight = this.flights.get(flightId);

    if (!runway || !flight) return false;
    if (runway.status !== 'available' && runway.status !== 'in_use') return false;

    runway.currentFlight = flightId;
    runway.nextAvailableTime = time + duration;
    runway.status = 'in_use';
    flight.runway = runwayId;

    this.schedule.set(flightId, {
      runway: runwayId,
      gate: flight.gate || '',
      time,
    });

    this.updateMetrics();
    return true;
  }

  /**
   * Allocate gate to flight
   */
  allocateGate(flightId: string, gateId: string, time?: number, duration?: number): boolean {
    const gate = this.airport.gates.find((g) => g.id === gateId);
    const flight = this.flights.get(flightId);

    if (!gate || !flight) return false;
    if (gate.status !== 'available') return false;

    gate.currentFlight = flightId;
    gate.status = 'occupied';
    if (time !== undefined && duration !== undefined) {
      gate.nextAvailableTime = time + duration;
    }
    flight.gate = gateId;

    this.updateMetrics();
    return true;
  }

  /**
   * Release runway allocation
   */
  releaseRunway(runwayId: string): void {
    const runway = this.airport.runways.find((r) => r.id === runwayId);
    if (runway) {
      runway.currentFlight = undefined;
      runway.status = 'available';
      this.updateMetrics();
    }
  }

  /**
   * Release gate allocation
   */
  releaseGate(gateId: string): void {
    const gate = this.airport.gates.find((g) => g.id === gateId);
    if (gate) {
      gate.currentFlight = undefined;
      gate.status = 'available';
      this.updateMetrics();
    }
  }

  /**
   * Cancel a flight
   */
  cancelFlight(flightId: string, reason: string): boolean {
    const flight = this.flights.get(flightId);
    if (!flight) return false;

    flight.status = 'cancelled';

    // Release allocated resources
    if (flight.runway) this.releaseRunway(flight.runway);
    if (flight.gate) this.releaseGate(flight.gate);

    // Remove from queue
    this.flightQueue = this.flightQueue.filter((id) => id !== flightId);

    this.airport.operationMetrics.totalFlightsCancelled++;
    this.updateMetrics();
    return true;
  }

  /**
   * Get airport status
   */
  getAirportStatus(): Airport {
    this.refreshResourceAvailability();
    return this.airport;
  }

  /**
   * Get current utilization metrics
   */
  getUtilizationMetrics(): {
    runwayUtilization: number;
    gateUtilization: number;
  } {
    const usedRunways = this.airport.runways.filter((r) => r.status === 'in_use').length;
    const usedGates = this.airport.gates.filter((g) => g.status === 'occupied').length;

    return {
      runwayUtilization: (usedRunways / this.airport.runways.length) * 100,
      gateUtilization: (usedGates / this.airport.gates.length) * 100,
    };
  }

  /**
   * Analyze bottlenecks in current operations
   */
  analyzeBottlenecks(): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const metrics = this.getUtilizationMetrics();

    // Runway bottleneck
    if (metrics.runwayUtilization > 80) {
      bottlenecks.push({
        type: 'runway',
        severity: metrics.runwayUtilization > 95 ? 'critical' : 'high',
        affectedRunways: this.airport.runways
          .filter((r) => r.status === 'in_use')
          .map((r) => r.id),
        affectedFlights: this.flightQueue.slice(0, 5),
        estimatedDuration: 30,
        recommendation: 'Increase runway capacity or delay less critical flights',
      });
    }

    // Gate bottleneck
    if (metrics.gateUtilization > 85) {
      bottlenecks.push({
        type: 'gate',
        severity: metrics.gateUtilization > 95 ? 'critical' : 'high',
        affectedGates: this.airport.gates
          .filter((g) => g.status === 'occupied')
          .map((g) => g.id),
        affectedFlights: this.flightQueue.slice(0, 5),
        estimatedDuration: 45,
        recommendation: 'Accelerate ground turnaround processes',
      });
    }

    // Dependency conflicts
    const conflicts = this.findDependencyConflicts();
    if (conflicts.length > 0) {
      bottlenecks.push({
        type: 'coordination',
        severity: 'medium',
        affectedFlights: conflicts.map((c) => c.flight1Id),
        estimatedDuration: 15,
        recommendation: 'Adjust flight schedules to resolve dependency conflicts',
      });
    }

    // Weather bottleneck inferred from weather-related special handling or delayed weather-tagged flights.
    const weatherImpactedFlights = this.getAllFlights().filter((flight) => {
      const tags = (flight.specialHandling || []).map((s) => s.toLowerCase());
      const weatherTagged = tags.some(
        (tag) => tag.includes('weather') || tag.includes('storm') || tag.includes('deice')
      );
      return weatherTagged || (flight.status === 'delayed' && tags.includes('weather_delay'));
    });

    if (weatherImpactedFlights.length > 0) {
      bottlenecks.push({
        type: 'weather',
        severity: weatherImpactedFlights.length >= 5 ? 'high' : 'medium',
        affectedFlights: weatherImpactedFlights.map((f) => f.id),
        estimatedDuration: weatherImpactedFlights.length >= 5 ? 90 : 45,
        recommendation:
          'Apply weather operations plan (de-icing, spacing increase, and priority-based resequencing).',
      });
    }

    this.airport.operationMetrics.bottlenecks = bottlenecks;
    return bottlenecks;
  }

  private findDependencyConflicts(): Array<{
    flight1Id: string;
    flight2Id: string;
  }> {
    const conflicts: Array<{ flight1Id: string; flight2Id: string }> = [];
    const flights = Array.from(this.flights.values());

    for (const flight of flights) {
      if (flight.dependencies.length > 0) {
        for (const depId of flight.dependencies) {
          const depFlight = this.flights.get(depId);
          if (
            depFlight &&
            depFlight.estimatedDeparture &&
            flight.scheduledDeparture <= depFlight.estimatedDeparture
          ) {
            conflicts.push({ flight1Id: flight.id, flight2Id: depId });
          }
        }
      }
    }

    return conflicts;
  }

  private updateMetrics(): void {
    this.refreshResourceAvailability();

    const metrics = this.airport.operationMetrics;
    metrics.totalFlightsScheduled = this.flights.size;
    metrics.runwayUtilization = this.getUtilizationMetrics().runwayUtilization;
    metrics.gateUtilization = this.getUtilizationMetrics().gateUtilization;
  }

  private refreshResourceAvailability(referenceTime: number = Date.now()): void {
    for (const runway of this.airport.runways) {
      if (runway.status === 'in_use' && runway.nextAvailableTime <= referenceTime) {
        runway.status = 'available';
        runway.currentFlight = undefined;
      }
    }

    for (const gate of this.airport.gates) {
      if (gate.status === 'occupied' && gate.nextAvailableTime <= referenceTime) {
        gate.status = 'available';
        gate.currentFlight = undefined;
      }
    }
  }

  /**
   * Get flight timeline
   */
  getOperationTimeline(): Array<{
    flightId: string;
    flightNumber: string;
    scheduledTime: number;
    status: FlightStatus;
    runway?: string;
    gate?: string;
  }> {
    return Array.from(this.flights.values())
      .filter((f) => f.status !== 'cancelled')
      .sort((a, b) => a.scheduledDeparture - b.scheduledDeparture)
      .map((f) => ({
        flightId: f.id,
        flightNumber: f.flightNumber,
        scheduledTime: f.scheduledDeparture,
        status: f.status,
        runway: f.runway,
        gate: f.gate,
      }));
  }
}
