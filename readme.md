![Finite State Machine](misc/typed.png)

A minimal, type-safe finite state machine (FSM) library for TypeScript. States are first-class values. Transitions are compile-time checked. The machine communicates via message-passing, keeping callers and handlers fully decoupled.

**Example implementations can be found in the example folders.**

## Installation

Copy `fsm.ts` into your project:

```ts
import { createFSM } from './fsm';
```

## Quick Start

```ts
import { createFSM } from './fsm';

type States = 'idle' | 'loading' | 'error';
type Payload = { url: string };
type Reply = { data: string } | { error: string };

const machine = createFSM<States, Payload, Reply>({
  initialState: 'idle',

  states: {
    idle: {
      async onMessage(message, instance) {
        instance.setState('loading');
        message.reply({ data: 'starting...' });
      },
    },
    loading: {
      async onMessage(message, instance) {
        try {
          const result = await fetch(message.payload.url);
          const data = await result.text();
          message.reply({ data });
          instance.setState('idle');
        } catch {
          instance.setState('error');
          message.reply({ error: 'fetch failed' });
        }
      },
    },
    error: {
      onMessage(message, instance) {
        message.reply({ error: 'machine is in error state' });
        instance.reset();
      },
    },
  },

  onChange(from, to) {
    console.log(`[FSM] ${from} → ${to}`);
  },
});

// Send a message
machine.send({
  payload: { url: 'https://example.com/api' },
  reply(response) {
    console.log('Response:', response);
  },
});
```

## API

### `createFSM(descriptor)`

Creates and returns a running state machine. Takes a descriptor with:

| Property       | Required | Description                                   |
| -------------- | -------- | --------------------------------------------- |
| `initialState` | yes      | The state the machine starts in               |
| `states`       | yes      | A handler for every state in the union        |
| `onChange`     | no       | Called after every successful state transition |

Each state defines an `onMessage(message, instance)` handler (sync or async). The `message` carries a `payload` and a `reply` callback. The `instance` exposes:

| Method/Property   | Description                                       |
| ----------------- | ------------------------------------------------- |
| `currentState`    | The currently active state                        |
| `setState(state)` | Transition to a new state (compile-time checked)  |
| `reset()`         | Return to `initialState`                          |
| `send(message)`   | Dispatch a message to the current state's handler |

## Type Safety

The `States` generic is inferred from the keys of `states`, so `setState` only accepts valid state names, `initialState` is validated against the same union, and every state must have a handler — all enforced at compile time.

```ts
instance.setState('loading');   // valid
instance.setState('fetching');  // compile error
```

## License

MIT
