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

  test('send dispatches message to current state', () => {
    const machine = createFSM(descriptor);

    const reply = vi.fn();

    const msg: Message<Payload, Reply> = {
      payload: { action: 'start' },
      reply,
    };

    machine.send(msg);

    expect(machine.currentState).toBe('running');
    expect(reply).toHaveBeenCalledWith('started');
  });

  test('state handlers change behavior after transition', () => {
    const machine = createFSM(descriptor);

    const reply = vi.fn();

    machine.send({
      payload: { action: 'start' },
      reply,
    });

    expect(machine.currentState).toBe('running');

    machine.send({
      payload: { action: 'stop' },
      reply,
    });

    expect(machine.currentState).toBe('stopped');
    expect(reply).toHaveBeenCalledWith('stopped');
  });

  test('reset returns machine to initial state', () => {
    const machine = createFSM(descriptor);

    const reply = vi.fn();

    machine.send({
      payload: { action: 'start' },
      reply,
    });

    expect(machine.currentState).toBe('running');

    machine.reset();

    expect(machine.currentState).toBe('idle');
  });

  test('onChange lifecycle hook fires', () => {
    const onChange = vi.fn();

    const machine = createFSM({
      ...descriptor,
      onChange,
    });

    machine.setState('running');

    expect(onChange).toHaveBeenCalledWith('idle', 'running');
  });

  test('async handlers work correctly', async () => {
    const asyncDescriptor: Descriptor<States, Payload, Reply> = {
      initialState: 'idle',

      states: {
        idle: {
          async onMessage(message, instance) {
            if (message.payload.action === 'start') {
              await Promise.resolve();
              instance.setState('running');
              message.reply('started');
            }
          },
        },

        running: {
          onMessage: () => {},
        },

        stopped: {
          onMessage: () => {},
        },
      },
    };

    const machine = createFSM(asyncDescriptor);

    const reply = vi.fn();

    await machine.send({
      payload: { action: 'start' },
      reply,
    });

    expect(machine.currentState).toBe('running');
    expect(reply).toHaveBeenCalledWith('started');
  });
});
