![Finite State Machine](misc/label.png)

A minimal, type-safe finite state machine (FSM) library for TypeScript.  States are first-class values. Transitions are compile-time checked. The machine (FSM) communicates via a message-passing interface, keeping callers and handlers fully decoupled.

<b>Example implementations can be found in the example folders.<b>

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



## API Reference

### `createFSM(descriptor)`

Creates and returns a running state machine instance.

```ts
const machine = createFSM<States, TPayload, TReply>(descriptor);
```

Generic type parameters are inferred automatically from the descriptor — you rarely need to annotate them explicitly.

---

### `Descriptor`

The configuration object passed to `createFSM`.

```ts
type Descriptor<States, TPayload, TReply> = {
  initialState: States;
  states: Record<States, State<States, TPayload, TReply>>;
  onChange?: (from: States, to: States) => void;
};
```

| Property       | Required | Description                                    |
| -------------- | -------- | ---------------------------------------------- |
| `initialState` | yes     | The state the machine starts in                |
| `states`       | yes      | A handler for every state in the union         |
| `onChange`     | no      | Called after every successful state transition |

---

### `State`

Defines how the machine behaves in a given state.

```ts
type State<States, TPayload, TReply> = {
  onMessage: (
    message: Message<TPayload, TReply>,
    instance: Instance<States, TPayload, TReply>
  ) => void | Promise<void>;
};
```

Each state receives the incoming `message` and the `instance` of the machine, allowing it to reply and/or transition.

---

### `Message`

A request sent to the machine.

```ts
type Message<TPayload, TReply> = {
  payload: TPayload;
  reply: (response: TReply) => void;
};
```

The `reply` callback lets the handler respond to the sender without any shared references. This enables clean request/response patterns without coupling caller and machine.

---

### `Instance`

The live machine returned by `createFSM`.

```ts
type Instance<States, TPayload, TReply> = {
  currentState: States;
  setState: (newState: States) => void;
  reset: () => void;
  send: (message: Message<TPayload, TReply>) => void;
};
```

| Member            | Description                                       |
| ----------------- | ------------------------------------------------- |
| `currentState`    | The currently active state                        |
| `setState(state)` | Transition to a new state (compile-time checked)  |
| `reset()`         | Return to `initialState`                          |
| `send(message)`   | Dispatch a message to the current state's handler |

---

## Type Safety

The `States` generic is inferred from the keys of `states`. This means:

- `setState` only accepts valid state names — typos are caught at compile time
- `initialState` is validated against the same union
- Exhaustiveness is enforced: every state in the union must have an entry in `states`

```ts
//  Valid
instance.setState('loading');

//  Compile error: Argument of type '"fetching"' is not assignable...
instance.setState('fetching');
```

---

## Patterns

### Request / Response

The `reply` function on `Message` allows callers to receive a typed response without knowing anything about the machine's internals:

```ts
machine.send({
  payload: { id: 42 },
  reply(response) {
    // response is fully typed as TReply
    console.log(response);
  },
});
```

### Transition Logging

Use `onChange` in the descriptor to trace state changes:

```ts
onChange(from, to) {
  console.log(`[FSM] ${from} → ${to}`);
}
```

### Async Handlers

`onMessage` supports `async`/`await` natively:

```ts
idle: {
  async onMessage(message, instance) {
    const result = await someAsyncOperation(message.payload);
    instance.setState("done");
    message.reply(result);
  },
},
```

---

## License

MIT
