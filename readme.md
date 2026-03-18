# typed-fsm

A minimal, type-safe finite state machine (FSM) library for TypeScript.

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

## License

MIT
