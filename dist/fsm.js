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
export function createFSM(descriptor) {
    let state = descriptor.initialState;
    const instance = {
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
//# sourceMappingURL=fsm.js.map