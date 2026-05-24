/**
 * Air Traffic Control MCP Server Types
 * Defines all data structures for flight management and airport operations
 */

export interface Airport {
  code: string;
  name: string;
  timezone: string;
  runways: Runway[];
  gates: Gate[];
  operationMetrics: OperationMetrics;
}

export interface Runway {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance' | 'closed';
  currentFlight?: string;
  nextAvailableTime: number;
  maintenanceSchedule?: DateRange[];
}

export interface Gate {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'maintenance' | 'closed';
  currentFlight?: string;
  nextAvailableTime: number;
  aircraftSize: 'small' | 'medium' | 'large' | 'any';
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  origin: string;
  destination: string;
  scheduledDeparture: number; // Unix timestamp
  estimatedDeparture?: number;
  actualDeparture?: number;
  priority: 'high' | 'medium' | 'low';
  status: FlightStatus;
  runway?: string;
  gate?: string;
  dependencies: string[]; // Flight IDs this flight depends on
  bufferMinutes: number;
  passengerCount: number;
  cargoWeight: number;
  specialHandling?: string[];
}

export type FlightStatus =
  | 'scheduled'
  | 'boarding'
  | 'pushback'
  | 'taxiing'
  | 'taking_off'
  | 'airborne'
  | 'landing'
  | 'landed'
  | 'cancelled'
  | 'delayed'
  | 'emergency';

export interface ScheduleEntry {
  flightId: string;
  runwayId: string;
  gateId: string;
  scheduledTime: number;
  duration: number;
  dependencies: string[];
  conflict: boolean;
}

export interface OperationMetrics {
  totalFlightsScheduled: number;
  totalFlightsCancelled: number;
  totalFlightsCompleted: number;
  averageDelay: number;
  runwayUtilization: number;
  gateUtilization: number;
  bottlenecks: Bottleneck[];
}

export interface Bottleneck {
  type: 'runway' | 'gate' | 'coordination' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedRunways?: string[];
  affectedGates?: string[];
  affectedFlights: string[];
  estimatedDuration: number;
  recommendation: string;
}

export interface DateRange {
  start: number;
  end: number;
}

export interface ScheduleAnalysis {
  feasible: boolean;
  conflicts: FlightConflict[];
  bottlenecks: Bottleneck[];
  suggestions: string[];
  estimatedCompletionTime: number;
}

export interface FlightConflict {
  flight1Id: string;
  flight2Id: string;
  conflictType: 'runway' | 'gate' | 'time' | 'dependency';
  conflictTime: number;
  resolution: string;
}

export interface ResourceStatus {
  resourceType: 'runway' | 'gate' | 'airspace' | 'staffing';
  utilization: number;
  availableUnits: number;
  totalUnits: number;
  nextBottleneck?: {
    time: number;
    reason: string;
  };
}
