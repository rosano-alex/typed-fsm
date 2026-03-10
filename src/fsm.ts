/**
 * Prevents TypeScript from re-inferring a generic type.
 *
 * Without this, `initialState` could cause the compiler
 * to widen the state union incorrectly.
 *
 * This trick forces the compiler to respect the
 * existing inferred union instead of recomputing it.
 */
type NoInfer<T> = [T][T extends any ? 0 : never];
/**
 * Message represents a request sent to the state machine.
 *
 * TPayload
 *   The data sent to the machine.
 *
 * TReply
 *   The type returned to the requester.
 *
 * The reply function allows the machine to respond
 * without needing to know anything about the caller.
 *
 * This keeps the machine loosely coupled and actor-like.
 */
export type Message<TPayload = unknown, TReply = unknown> = {
  // message data
  payload: TPayload;

  /**
   * Respond back to the sender.
   * This allows request/response interaction patterns.
   */
  reply: (response: TReply) => void;
};

/**
 * A State describes how the machine behaves when
 * it receives a message while currently in that state.
 *
 * States never mutate shared data directly.
 * Instead they interact through the machine instance.
 */
export type State<
  States extends string,
  TPayload = unknown,
  TReply = unknown,
> = {
  /**
   * Message handler for this state.
   *
   * Parameters:
   *  message
   *      incoming request with payload and reply channel
   *
   *  instance
   *      the running machine instance which allows transitions
   *
   * Return type allows async handlers.
   */
  onMessage: (
    message: Message<TPayload, TReply>,
    instance: Instance<States, TPayload, TReply>
  ) => void | Promise<void>;
};

/**
 * Descriptor defines the structure of the machine.
 *
 * This is a purely declarative configuration.
 * No runtime behavior exists here.
 */
export type Descriptor<
  States extends string,
  TPayload = unknown,
  TReply = unknown,
> = {
  /**
   * Initial state when the machine is created.
   *
   * NoInfer prevents this property from influencing
   * the inferred state union.
   */
  initialState: NoInfer<States>;

  /**
   * Mapping of all states in the machine.
   *
   * Record enforces that every state in the union
   * has a corresponding implementation.
   */
  states: Record<States, State<States, TPayload, TReply>>;

  /**
   * Optional lifecycle hook triggered after
   * a successful state transition.
   *
   * Useful for:
   *   logging
   *   metrics
   *   debugging
   *   analytics
   */
  onChange?: (from: States, to: States) => void;
};

/**
 * Instance represents the runtime machine.
 *
 * This is what callers interact with.
 */
export type Instance<
  States extends string,
  TPayload = unknown,
  TReply = unknown,
> = {
  /**
   * The machine's currently active state.
   */
  currentState: States;
  /**
   * Transition the machine to a new state.
   *
   * Compile-time safety ensures only valid
   * states can be transitioned to.
   */
  setState: (newState: States) => void;

  /**
   * Reset the machine back to the initial state.
   */
  reset: () => void;

  /**
   * Send a message to the machine.
   *
   * The machine will dispatch the message
   * to the handler of the current state.
   */
  send: (message: Message<TPayload, TReply>) => void;
};

/**
 * Factory function that creates a state machine instance.
 *
 * The generic parameters are inferred automatically
 * from the descriptor passed in.
 *
 * Example inference:
 *
 *   states = { idle, running }
 *
 *   => States = "idle" | "running"
 */

export function createFSM<
  States extends string,
  TPayload = unknown,
  TReply = unknown,
>(
  descriptor: Descriptor<States, TPayload, TReply>
): Instance<States, TPayload, TReply> {
  let state = descriptor.initialState;

  const instance: Instance<States, TPayload, TReply> = {
    get currentState() {
      return state;
    },

    setState(newState) {
      const previous = state;
      state = newState;
      descriptor.onChange?.(previous, newState);
    },

    reset() {
      const previous = state;
      state = descriptor.initialState;
      descriptor.onChange?.(previous, state);
    },

    send(message) {
      const handler = descriptor.states[state];
      return handler.onMessage(message, instance);
    },
  };

  return instance;
}
