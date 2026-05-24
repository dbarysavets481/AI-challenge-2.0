# Air Traffic Control MCP Server

Model Context Protocol server for airport operations, flight scheduling, resource allocation, and bottleneck analysis.

## 1. Overview

This implementation provides the full Task 4 surface area:

- 5 MCP tools
- 3 MCP resources
- environment-based configuration
- deterministic scheduling with priority, dependency, and resource constraints
- cancellation handling with resource cleanup
- bottleneck analysis for runway, gate, coordination, and weather factors

## 2. Project Structure

```text
task-4/
  src/
    index.ts
    config.ts
    types.ts
    state.ts
    scheduler.ts
    mcp.ts
  package.json
  tsconfig.json
  .env.example
  README.md
  report.md
```

## 3. Complete Setup Instructions

### 3.1 Prerequisites

- Node.js 18+
- npm 9+

### 3.2 Install

From the task folder:

```bash
cd task-4
npm install
```

### 3.3 Configure Environment

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then edit .env with airport-specific values.

### 3.4 Build

```bash
npm run build
```

### 3.5 Run

```bash
npm start
```

### 3.6 Development Mode

```bash
npm run dev
```

## 4. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| AIRPORT_CODE | No | LAX | Airport short code |
| AIRPORT_NAME | No | Los Angeles International Airport | Airport display name |
| TIMEZONE | No | America/Los_Angeles | IANA timezone |
| RUNWAY_COUNT | No | 4 | Total runways |
| RUNWAY_NAMES | No | 25L,25R,24L,24R | Comma-separated runway names |
| GATE_COUNT | No | 130 | Total gates |
| GATE_AVAILABILITY_PERCENTAGE | No | 90 | Percentage of active gates |
| SCHEDULING_BUFFER_MINUTES | No | 15 | Base scheduling buffer |
| BUFFER_TYPE | No | dynamic | fixed or dynamic buffer logic |
| MIN_TURNAROUND_MINUTES | No | 45 | Dependency turnaround requirement |
| MAX_CONCURRENT_OPERATIONS | No | 6 | Max overlapping operations |
| DAILY_OPERATION_LIMIT | No | 2500 | Max operations per day |
| HOURLY_OPERATION_LIMIT | No | 250 | Max operations per hour |
| MCP_SERVER_NAME | No | air-traffic-control | MCP server name |
| MCP_SERVER_VERSION | No | 1.0.0 | MCP server version |
| DEBUG_MODE | No | false | Enables startup debug output |

## 5. MCP Tools Reference

### 5.1 submit_flight

Purpose: Add a flight into the scheduling queue.

Required inputs:

- flightNumber: string
- airline: string
- aircraft: string
- origin: string
- destination: string
- scheduledDeparture: positive number (Unix timestamp)
- priority: high | medium | low

Optional inputs:

- passengerCount: non-negative number
- cargoWeight: non-negative number
- dependencies: string[]
- specialHandling: string[]

Output: success flag, message, flightId, status, scheduledDeparture.

### 5.2 generate_schedule

Purpose: Compute deterministic schedule using priority/dependency/resource constraints.

Output:

- feasible
- estimatedCompletionTime
- conflictCount
- bottleneckCount
- suggestions
- conflicts
- bottlenecks

### 5.3 get_airport_status

Purpose: Return live airport resource and utilization metrics.

Output:

- airport identity
- runway and gate counts
- utilization percentages
- scheduled/cancelled totals

### 5.4 cancel_flight

Purpose: Cancel a scheduled flight, release allocated resources.

Required inputs:

- flightId: non-empty string
- reason: non-empty string

Output: cancellation confirmation and released runway/gate.

### 5.5 analyze_bottleneck

Purpose: Analyze runway/gate/coordination/weather bottlenecks and provide recommendations.

Output:

- bottleneckCount
- per-bottleneck type, severity, affectedFlights, estimatedDuration, recommendation
- current utilization metrics

## 6. MCP Resources Reference

### 6.1 airport://flight-queue

Returns queued flights and queue length.

### 6.2 airport://runway-usage

Returns runway status, allocations, and runway utilization.

### 6.3 airport://operation-timeline

Returns ordered timeline of scheduled operations plus status breakdown.

## 7. Scheduling and Constraint Behavior

The scheduling engine enforces:

- priority sorting: high, then medium, then low
- dependency ordering before dependent departure
- circular dependency rejection
- dynamic/fixed buffer behavior
- runway and gate availability checks
- minimum turnaround time constraints
- max concurrent operation limit
- hourly and daily operation limits

## 8. Validation Scenarios and Expected Results

### Scenario A: Valid Flight Submission

Input: submit_flight with complete required fields.

Expected result:

- success = true
- generated flightId
- status = scheduled

### Scenario B: Invalid submit_flight Payload

Input: negative passengerCount or invalid priority.

Expected result:

- isError = true
- success = false
- validation errors array explaining failed fields

### Scenario C: Priority Ordering

Input: multiple flights at similar times with mixed priorities.

Expected result:

- high-priority flights are scheduled first when resources contend

### Scenario D: Dependency Enforcement

Input: dependent flight scheduled before parent completion.

Expected result:

- dependent flight delayed or skipped
- suggestion indicating dependency wait

### Scenario E: Circular Dependency

Input: A depends on B and B depends on A.

Expected result:

- dependency conflict raised
- suggestion to resolve circular chain

### Scenario F: Capacity Limits

Input: demand exceeding max concurrent/hourly/daily limits.

Expected result:

- time conflict returned for violating flights
- suggestions to delay/resequence

### Scenario G: Cancellation

Input: cancel_flight with valid flightId and reason.

Expected result:

- success = true
- flight status set to cancelled
- runway/gate released

### Scenario H: Bottleneck Analysis with Weather Flags

Input: flights tagged with weather or deice handling and runway pressure.

Expected result:

- weather and/or runway bottlenecks returned
- severity and recommendation included

## 9. Testing

### 9.1 Static Validation

```bash
npm run build
```

Expected result: TypeScript compilation succeeds.

### 9.2 Manual MCP Tool Validation

Validate each tool end-to-end:

1. submit_flight
2. generate_schedule
3. get_airport_status
4. cancel_flight
5. analyze_bottleneck

Expected result: each tool returns structured JSON with success/error behavior matching the scenarios above.

### 9.3 Manual MCP Resource Validation

Read each resource:

1. airport://flight-queue
2. airport://runway-usage
3. airport://operation-timeline

Expected result: each resource returns valid JSON with live state.

## 10. Assumptions and Limitations

### Assumptions

- One server instance manages one airport context.
- Clients provide Unix timestamps in milliseconds.
- Flight dependency IDs refer to flights known by this server instance.

### Limitations

- In-memory state only (no persistence/database).
- No authentication/authorization layer.
- No rate-limiting middleware.
- No external weather API integration; weather bottlenecks are inferred from flight metadata and delay tagging.
- No automated test suite in this repository version (manual validation scenarios provided).

## 11. Notes

This README is aligned with Task 4 implementation and report expectations, including setup, operational references, validation criteria, and known boundaries.
- Cost optimization algorithms

## License

Production-ready implementation for AI Challenge Task 4.
