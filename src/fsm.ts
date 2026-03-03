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
