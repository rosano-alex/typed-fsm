# typed-fsm

A minimal, type-safe finite state machine (FSM) library for TypeScript.  States are first-class values. Transitions are compile-time checked.

## Installation

Copy `fsm.ts` into your project, or import from wherever you're hosting it:

```ts
import { createFSM } from './fsm';
```

## Core Concepts

| Concept      | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| `Message`    | A request sent to the machine, carrying a `payload` and a `reply` callback             |
| `State`      | A handler that defines how the machine responds to messages in a given state           |
| `Descriptor` | A declarative config — initial state, all state handlers, and optional lifecycle hooks |
| `Instance`   | The live, running machine returned by `createFSM`                                      |

---

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

## License

MIT
