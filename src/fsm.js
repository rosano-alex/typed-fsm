"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFSM = createFSM;
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
function createFSM(descriptor) {
    var state = descriptor.initialState;
    var instance = {
        get currentState() {
            return state;
        },
        setState: function (newState) {
            var _a;
            var previous = state;
            state = newState;
            (_a = descriptor.onChange) === null || _a === void 0 ? void 0 : _a.call(descriptor, previous, newState);
        },
        reset: function () {
            var _a;
            var previous = state;
            state = descriptor.initialState;
            (_a = descriptor.onChange) === null || _a === void 0 ? void 0 : _a.call(descriptor, previous, state);
        },
        send: function (message) {
            var handler = descriptor.states[state];
            return handler.onMessage(message, instance);
        },
    };
    return instance;
}
