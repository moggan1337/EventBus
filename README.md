# EventBus 🚌

**Event-Driven Messaging** - Decouple your services with style.

## Features

- **🔔 Pub/Sub** - Classic publish/subscribe pattern
- **📡 Wildcards** - Pattern-based subscriptions
- **⏱️ Async** - Full async/await support
- **🧹 Cleanup** - Easy unsubscribe

## Installation

```bash
npm install eventbus
```

## Usage

```typescript
import { EventBus } from 'eventbus';

const bus = new EventBus();

// Subscribe
bus.on('user:created', (user) => {
  console.log('User created:', user);
});

bus.on('user:*', (event, data) => {
  console.log(`User event: ${event}`, data);
});

// Publish
bus.emit('user:created', { id: 1, name: 'John' });
```

## Methods

| Method | Description |
|--------|-------------|
| `on(event, fn)` | Subscribe to event |
| `off(event, fn)` | Unsubscribe |
| `emit(event, ...args)` | Publish event |
| `once(event, fn)` | Subscribe once |

## Wildcards

```typescript
bus.on('user:*', (type, data) => {
  // user:created, user:updated, user:deleted
});

bus.on('*:error', (event, error) => {
  // Handle all error events
});
```

## Async Events

```typescript
bus.on('data:process', async (data) => {
  return await heavyComputation(data);
});
```

## License

MIT
