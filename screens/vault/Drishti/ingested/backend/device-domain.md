# Ingested Summary: Device Domain

## Overview
A new bounded context, **Device Domain**, has been added to Drishti. This isolates device abstraction and state management from the existing Child/Parent cognition and linking logic.

## Architecture

1. **Schemas (`backend/app/schemas/device.py`)**: Defines Pydantic models for `DeviceState`, `DeviceModel`, `TelemetryPayload`, `HeartbeatPayload`, and `CommandPayload`.
2. **Models/Repository (`backend/app/models/device.py`)**: Provides abstract interface `IDeviceRepository` to decouple data storage.
3. **Core Registry (`backend/app/core/device/registry.py`)**: `DeviceRegistry` encapsulates device registration, lookup, and deletion.
4. **Core Lifecycle (`backend/app/core/device/lifecycle.py`)**: `DeviceLifecycleManager` processes timeouts for online devices, switching them to offline based on `last_heartbeat`.
5. **Services (`backend/app/services/device/telemetry.py`, `backend/app/services/device/command_routing.py`)**:
    - **TelemetryIngestionService**: Modifies the `DeviceStateCache` safely with telemetry payloads.
    - **CommandRoutingService**: Manages dispatch and retrieval of commands via an abstracted `CommandQueue`.
6. **Events (`backend/app/events/device/schemas.py`)**: Defines standard event schemas like `DeviceConnectedEvent`, `TelemetryIngestedEvent`, etc.

## Isolation Characteristics
- Does not contain Android-specific code.
- Uses `DeviceStateCache` and `CommandQueue` which can easily be backed by Redis in the future.
- Connects transparently with standard HTTP/WS endpoints when needed in Phase D3.
