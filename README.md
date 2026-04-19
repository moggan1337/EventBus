# EventBus 🚌

[![npm version](https://img.shields.io/npm/v/eventbus.svg)](https://www.npmjs.com/package/eventbus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/node/v/eventbus.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/eventbus.svg)](https://www.npmjs.com/package/eventbus)
[![Build Status](https://img.shields.io/github/actions/workflow/status/example/eventbus/ci.yml)](https://github.com/example/eventbus/actions)

**Event-Driven Messaging** - A lightweight, type-safe Event Bus implementation for decoupling your services with style.

EventBus is a powerful publish/subscribe library that enables clean, decoupled architecture in your applications. With support for wildcard patterns, async handlers, and automatic memory management, EventBus makes inter-component communication seamless and maintainable.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
  - [Basic Pub/Sub](#basic-pubsub)
  - [Wildcard Patterns](#wildcard-patterns)
  - [Async Events](#async-events)
  - [One-Time Subscriptions](#one-time-subscriptions)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
  - [Namespaced Event Buses](#namespaced-event-buses)
  - [Event Bus Hierarchies](#event-bus-hierarchies)
  - [Middleware](#middleware)
- [TypeScript Support](#typescript-support)
- [Best Practices](#best-practices)
- [Performance Tips](#performance-tips)
- [Migration Guide](#migration-guide)
- [FAQ](#faq)
- [License](#license)

---

## Features

EventBus provides a comprehensive set of features for building event-driven applications:

### 🔔 Pub/Sub Pattern

The classic publish/subscribe pattern allows you to decouple event producers from consumers. Publishers emit events without knowing who subscribes, and subscribers receive events without knowing the source.

```typescript
// Publisher
bus.emit('user:login', { userId: '123', timestamp: Date.now() });

// Subscriber
bus.on('user:login', (data) => {
  console.log('User logged in:', data.userId);
});
```

### 📡 Wildcard Patterns

Subscribe to multiple related events using wildcard patterns. The `*` wildcard matches any single segment, while `**` matches multiple segments.

```typescript
// Match all user-related events
bus.on('user:*', (event, data) => {
  console.log(`User event: ${event}`, data);
});
// Matches: user:created, user:updated, user:deleted, user:login

// Match all events ending with :error
bus.on('*:error', (event, error) => {
  console.error(`Error in ${event}:`, error);
});

// Match nested events
bus.on('**', (event, data) => {
  console.log('Any event occurred:', event);
});
```

### ⏱️ Async Support

Full support for async/await patterns. Handlers can be asynchronous, and you can await event emissions when needed.

```typescript
bus.on('data:process', async (data) => {
  const result = await heavyComputation(data);
  return result;
});

// Async emit with all handlers resolved
const results = await bus.emitAsync('data:process', someData);
```

### 🧹 Automatic Cleanup

Easy subscription management with automatic cleanup support. Remove individual handlers or clear all listeners.

```typescript
const handler = (data) => console.log(data);

// Subscribe
bus.on('event', handler);

// Unsubscribe when done
bus.off('event', handler);

// Clear all handlers for an event
bus.offAll('event');

// Clear everything
bus.clear();
```

### 🚀 Performance Optimized

Built for performance with:
- O(1) subscription lookup
- Minimal memory overhead
- Efficient handler invocation
- No external dependencies

---

## Installation

### Using npm

```bash
npm install eventbus
```

### Using yarn

```bash
yarn add eventbus
```

### Using pnpm

```bash
pnpm add eventbus
```

### Using Bun

```bash
bun add eventbus
```

### CDN (Browser Usage)

```html
<script type="module">
  import { EventBus } from 'https://esm.sh/eventbus';
</script>
```

---

## Quick Start

Here's a minimal example to get you started:

```typescript
import { EventBus } from 'eventbus';

// Create an instance
const bus = new EventBus();

// Subscribe to events
bus.on('greeting', (message) => {
  console.log(`Hello, ${message}!`);
});

// Publish events
bus.emit('greeting', 'World');
// Output: Hello, World!
```

---

## Usage Examples

### Basic Pub/Sub

The foundation of EventBus is the publish/subscribe pattern:

```typescript
import { EventBus } from 'eventbus';

const eventBus = new EventBus();

// Basic subscription
eventBus.on('user:created', (user) => {
  console.log('New user:', user.name);
  analytics.track('user_created', { userId: user.id });
  sendWelcomeEmail(user.email);
});

// Multiple subscribers to the same event
eventBus.on('order:placed', (order) => {
  inventoryService.decrementStock(order.items);
});

eventBus.on('order:placed', (order) => {
  paymentService.processPayment(order.paymentDetails);
});

eventBus.on('order:placed', (order) => {
  notificationService.sendOrderConfirmation(order.customer);
});

// Emit the event
eventBus.emit('user:created', { id: 1, name: 'Alice', email: 'alice@example.com' });
eventBus.emit('order:placed', { id: 100, items: [...], customer: {...} });
```

### Wildcard Patterns

EventBus supports powerful wildcard patterns for matching multiple events:

#### Single-Level Wildcard (`*`)

Matches exactly one segment between colons:

```typescript
// Listen to all user-related events
eventBus.on('user:*', (eventName, data) => {
  console.log(`User event: ${eventName}`, data);
  eventLogger.log(eventName, data);
});

// This will match:
// - user:created
// - user:updated
// - user:deleted
// - user:login
// - user:logout

// Listen to all completion events
eventBus.on('*:completed', (event, result) => {
  metrics.increment(`${event}:total`);
});

// This will match:
// - import:completed
// - export:completed
// - sync:completed
// - backup:completed
```

#### Multi-Level Wildcard (`**`)

Matches zero or more segments:

```typescript
// Match all events under a namespace
eventBus.on('notifications:**', (event, notification) => {
  uiManager.showNotification(notification);
});

// This will match:
// - notifications:new
// - notifications:read
// - notifications:archived
// - notifications:settings:updated

// Match all events globally
eventBus.on('**', (event, data) => {
  console.log('Event occurred:', event);
  globalEventBus.record(event, data);
});
```

#### Combining Patterns

```typescript
// Complex patterns
eventBus.on('api:*:response', (event, response) => {
  console.log('API response received:', response);
});

eventBus.on('db:users:*', (event, data) => {
  console.log('User operation:', event);
});

eventBus.on('*:error', (event, error) => {
  errorHandler.handle(error, { source: event });
});
```

### Async Events

Handle asynchronous operations with full async/await support:

#### Async Handlers

```typescript
eventBus.on('user:signup', async (userData) => {
  // Perform async operations
  const verificationToken = await generateToken();
  await sendVerificationEmail(userData.email, verificationToken);
  await createUserProfile(userData);
  
  return { success: true, userId: userData.id };
});
```

#### Awaiting All Handlers

When you need to wait for all handlers to complete:

```typescript
// Using emitAsync for promises
const results = await eventBus.emitAsync('data:process', inputData);

// results contains return values from all handlers
// Handlers run concurrently for better performance
```

#### Sequential Async Handling

When order matters:

```typescript
eventBus.on('pipeline:step', async (data, context) => {
  for (const step of pipelineSteps) {
    const result = await step.execute(data, context);
    data = result;
    eventBus.emit('pipeline:progress', { step: step.name, progress: result });
  }
  return data;
});
```

### One-Time Subscriptions

Subscribe to an event only once:

```typescript
// Will only fire one time
eventBus.once('app:ready', () => {
  initializeApp();
  showDashboard();
});

// Works with wildcards too
eventBus.once('config:*', (event, data) => {
  console.log('First config event:', event);
});

// One-time async handlers
eventBus.once('cache:ready', async () => {
  await warmUpCache();
});
```

### Error Handling

EventBus provides robust error handling to prevent one failing handler from breaking others:

#### Automatic Error Isolation

```typescript
eventBus.on('data:process', (data) => {
  // This handler throws - won't break other handlers
  throw new Error('Processing failed');
});

eventBus.on('data:process', (data) => {
  // This handler still runs
  console.log('Data received:', data);
});

eventBus.emit('data:process', someData); // Both handlers are called
```

#### Error Handler

Register a global error handler for all events:

```typescript
eventBus.onError((event, error, args) => {
  console.error(`Error in event "${event}":`, error);
  monitoringService.reportError(error, { event, args });
  metrics.increment('event_error', { event });
});
```

#### Error Recovery

```typescript
eventBus.on('critical:operation', async (data) => {
  try {
    const result = await performCriticalOperation(data);
    return result;
  } catch (error) {
    // Attempt recovery
    await notifyAdmins(error);
    await saveToDeadLetterQueue(data);
    throw error; // Re-throw if needed
  }
});
```

#### Retry Logic

```typescript
eventBus.on('external:api:call', async (request) => {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await externalApi.request(request);
    } catch (error) {
      lastError = error;
      await delay(Math.pow(2, i) * 100); // Exponential backoff
    }
  }
  
  throw new Error(`Failed after ${maxRetries} retries`, { cause: lastError });
});
```

---

## API Reference

### Constructor

```typescript
const bus = new EventBus(options?: EventBusOptions);
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wildcard` | `boolean` | `true` | Enable wildcard pattern matching |
| `delimiter` | `string` | `:` | Event name delimiter |
| `newListener` | `boolean` | `false` | Emit 'newListener' events |
| `removeListener` | `boolean` | `false` | Emit 'removeListener' events |

### Methods

#### `on(event, handler)`

Subscribe to an event.

```typescript
bus.on(event: string, handler: Handler): this
```

**Parameters:**
- `event` (string): Event name or pattern
- `handler` (Handler): Callback function

**Returns:** `this` - for chaining

**Example:**
```typescript
bus.on('user:created', (user) => {
  console.log('User created:', user);
});

// With wildcard
bus.on('user:*', (event, user) => {
  console.log(`${event}:`, user);
});
```

---

#### `once(event, handler)`

Subscribe to an event for a single emission.

```typescript
bus.once(event: string, handler: Handler): this
```

**Parameters:**
- `event` (string): Event name or pattern
- `handler` (Handler): Callback function

**Returns:** `this` - for chaining

**Example:**
```typescript
bus.once('app:initialized', () => {
  console.log('App is ready!');
  startMainLoop();
});
```

---

#### `off(event, handler)`

Unsubscribe from an event.

```typescript
bus.off(event: string, handler: Handler): this
```

**Parameters:**
- `event` (string): Event name
- `handler` (Handler): Previously registered handler

**Returns:** `this` - for chaining

**Example:**
```typescript
const handler = (data) => console.log(data);

bus.on('data', handler);
// ... later
bus.off('data', handler);
```

---

#### `offAll(event?)`

Remove all handlers for an event, or all events if no event specified.

```typescript
bus.offAll(event?: string): this
```

**Parameters:**
- `event` (string, optional): Event name

**Returns:** `this` - for chaining

**Example:**
```typescript
// Remove all handlers for 'data' event
bus.offAll('data');

// Remove all handlers for all events
bus.offAll();
```

---

#### `emit(event, ...args)`

Publish an event to all subscribers.

```typescript
bus.emit(event: string, ...args: any[]): boolean
```

**Parameters:**
- `event` (string): Event name
- `args` (any[]): Arguments to pass to handlers

**Returns:** `boolean` - true if handlers were called

**Example:**
```typescript
bus.emit('user:created', { id: 1, name: 'Alice' });

// Multiple arguments
bus.emit('order:placed', order, user, metadata);
```

---

#### `emitAsync(event, ...args)`

Publish an event and wait for all async handlers to complete.

```typescript
bus.emitAsync(event: string, ...args: any[]): Promise<any[]>
```

**Parameters:**
- `event` (string): Event name
- `args` (any[]): Arguments to pass to handlers

**Returns:** `Promise<any[]>` - Array of handler results

**Example:**
```typescript
const results = await bus.emitAsync('data:process', inputData);
console.log('Handler results:', results);
```

---

#### `listeners(event)`

Get all handlers for an event.

```typescript
bus.listeners(event: string): Handler[]
```

**Parameters:**
- `event` (string): Event name

**Returns:** `Handler[]` - Array of registered handlers

---

#### `listenerCount(event)`

Get the count of handlers for an event.

```typescript
bus.listenerCount(event: string): number
```

**Parameters:**
- `event` (string): Event name

**Returns:** `number` - Handler count

---

#### `eventNames()`

Get all registered event names.

```typescript
bus.eventNames(): string[]
```

**Returns:** `string[]` - Array of event names

---

#### `onError(handler)`

Register a global error handler.

```typescript
bus.onError(handler: ErrorHandler): this
```

**Parameters:**
- `handler` (ErrorHandler): Error callback function

**Returns:** `this` - for chaining

---

#### `clear()`

Remove all event listeners.

```typescript
bus.clear(): this
```

**Returns:** `this` - for chaining

---

### Events

EventBus emits the following internal events:

| Event | Description | Arguments |
|-------|-------------|-----------|
| `newListener` | Fired when a new listener is added | `(event, handler)` |
| `removeListener` | Fired when a listener is removed | `(event, handler)` |

---

## Advanced Usage

### Namespaced Event Buses

Create hierarchical event buses for complex applications:

```typescript
class ApplicationEventBus {
  private bus: EventBus;
  
  constructor() {
    this.bus = new EventBus();
  }
  
  get user() {
    return new UserEvents(this.bus);
  }
  
  get order() {
    return new OrderEvents(this.bus);
  }
  
  get api() {
    return new ApiEvents(this.bus);
  }
}

// Domain-specific event buses
class UserEvents {
  constructor(private bus: EventBus) {}
  
  onCreated(handler: Handler) {
    this.bus.on('user:created', handler);
  }
  
  onUpdated(handler: Handler) {
    this.bus.on('user:updated', handler);
  }
}
```

### Event Bus Hierarchies

Create parent-child event bus relationships:

```typescript
const rootBus = new EventBus();
const moduleBus = new EventBus({ parent: rootBus });

moduleBus.on('event', handler);
// Also triggers parent bus handlers
```

### Middleware

Add middleware for logging, metrics, or transformation:

```typescript
function createLoggingMiddleware(bus: EventBus) {
  bus.on('**', (event, ...args) => {
    const start = performance.now();
    
    // Pass through (you could modify args here)
    const result = args;
    
    // After handler (for sync events, this is immediate)
    const duration = performance.now() - start;
    console.log(`Event: ${event} (${duration.toFixed(2)}ms)`, args);
    
    return result;
  });
}
```

---

## TypeScript Support

EventBus is written in TypeScript and provides full type safety:

```typescript
import { EventBus, Handler } from 'eventbus';

// Define your event types
interface UserEvents {
  'user:created': { id: string; email: string; name: string };
  'user:updated': { id: string; changes: Partial<User> };
  'user:deleted': { id: string };
  'user:*': string; // Wildcard event name
}

// Create typed event bus
const bus = new EventBus<UserEvents>();

// Fully typed handlers
bus.on('user:created', (user) => {
  // user is automatically typed as { id: string; email: string; name: string }
  console.log(user.email);
});

bus.on('user:*', (event, data) => {
  // event is typed as string
  // data is typed based on specific event
});
```

---

## Best Practices

### 1. Use Consistent Naming Conventions

```typescript
// Good: Hierarchical naming with delimiters
bus.on('user:profile:updated', handler);
bus.on('order:item:added', handler);

// Avoid: Inconsistent patterns
bus.on('userUpdated', handler);
bus.on('user-profile-updated', handler);
```

### 2. Unsubscribe When Done

```typescript
// Good: Store handler reference
const handler = (data) => processData(data);
bus.on('data', handler);
// ... later
bus.off('data', handler);

// Good: Use once for one-time events
bus.once('app:ready', initializeApp);
```

### 3. Keep Handlers Lightweight

```typescript
// Good: Delegate heavy work
bus.on('data:received', (data) => {
  queue.enqueue({ type: 'process', data });
});

// Avoid: Heavy work in handler
bus.on('data:received', async (data) => {
  const result = await heavyComputation(data); // Can block other handlers
});
```

### 4. Use Error Boundaries

```typescript
bus.onError((event, error, args) => {
  // Log and alert, but don't throw
  logger.error(`Event ${event} failed`, error);
  monitoring.alert(error);
});
```

---

## Performance Tips

1. **Remove Unused Listeners**: Unsubscribe when no longer needed
   ```typescript
   bus.off('event', unusedHandler);
   ```

2. **Use Specific Events**: Prefer `user:created` over `**`
   ```typescript
   // Faster
   bus.on('user:created', handler);
   
   // Slower (pattern matching overhead)
   bus.on('user:*', handler);
   ```

3. **Batch Operations**: Combine multiple emits when possible
   ```typescript
   // Instead of multiple small emits
   bus.emit('batch:items', items.map(item => processItem(item)));
   ```

4. **Async for Heavy Work**: Use `emitAsync` for non-blocking handlers
   ```typescript
   await bus.emitAsync('heavy:task', data);
   ```

---

## Migration Guide

### From v1.x to v2.x

```typescript
// v1.x
const EventBus = require('eventbus');
const bus = new EventBus();

// v2.x
import { EventBus } from 'eventbus';
const bus = new EventBus();
```

### From Other Libraries

EventBus follows similar patterns to other popular event libraries:

```typescript
// Node.js EventEmitter
eventEmitter.on('event', handler);
eventEmitter.emit('event', data);

// EventBus
bus.on('event', handler);
bus.emit('event', data);
```

---

## FAQ

**Q: How is EventBus different from Node.js EventEmitter?**

A: EventBus provides wildcard pattern matching, async/await support, and automatic error isolation out of the box.

**Q: Can I use EventBus in the browser?**

A: Yes! EventBus works in both Node.js and browser environments.

**Q: Is EventBus tree-shakeable?**

A: Yes! EventBus uses ES modules and exports only what's needed.

**Q: How do I handle memory leaks?**

A: Always unsubscribe when done, or use `bus.clear()` to remove all listeners.

**Q: Can I prioritize events?**

A: Use the method chaining to control order: `bus.on().on().on()` executes in order.

---

## License

MIT License

Copyright (c) 2024 EventBus Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<p align="center">
  Made with ❤️ for event-driven architectures
</p>
