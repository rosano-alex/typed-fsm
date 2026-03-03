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
   */
  onMessage: (
    message: Message<TPayload, TReply>,
    instance: { setState: (newState: States) => void; currentState: States }
  ) => void;
};
