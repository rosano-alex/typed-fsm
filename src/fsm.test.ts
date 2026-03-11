import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createFSM, Descriptor, Message } from './fsm';

type States = 'idle' | 'running' | 'stopped';
type Payload = { action: string };
type Reply = string;

describe('createFSM', () => {
  let descriptor: Descriptor<States, Payload, Reply>;

  beforeEach(() => {
    descriptor = {
      initialState: 'idle',

      states: {
        idle: {
          onMessage: (message, instance) => {
            if (message.payload.action === 'start') {
              instance.setState('running');
              message.reply('started');
            }
          },
        },

        running: {
          onMessage: (message, instance) => {
            if (message.payload.action === 'stop') {
              instance.setState('stopped');
              message.reply('stopped');
            }
          },
        },

        stopped: {
          onMessage: (message, instance) => {
            if (message.payload.action === 'reset') {
              instance.reset();
              message.reply('reset');
            }
          },
        },
      },
    };
  });

  test('machine starts in initial state', () => {
    const machine = createFSM(descriptor);

    expect(machine.currentState).toBe('idle');
  });

  test('setState transitions state', () => {
    const machine = createFSM(descriptor);

    machine.setState('running');

    expect(machine.currentState).toBe('running');
  });
});
