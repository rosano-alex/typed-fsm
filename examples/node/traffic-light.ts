import { createFSM, Message } from "../../src/fsm"; // adjust path as needed

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type TrafficPayload =
    | { kind: "tick" }          // advance to next phase
    | { kind: "query" };        // ask how long until next change

type TrafficReply =
    | { status: "ok" }
    | { status: "timeUntilChange"; seconds: number };

type TrafficState = "red" | "green" | "yellow";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reply(msg: Message<TrafficPayload, TrafficReply>, response: TrafficReply) {
    msg.reply(response);
}

// ---------------------------------------------------------------------------
// Machine definition
// ---------------------------------------------------------------------------

const light = createFSM<TrafficState, TrafficPayload, TrafficReply>({
    initialState: "red",

    onChange(from, to) {
        const icons: Record<TrafficState, string> = { red: "🔴", green: "🟢", yellow: "🟡" };
        console.log(`  ${icons[from]} ${from.padEnd(6)} →  ${icons[to]} ${to}`);
    },

    states: {
        red: {
            onMessage(msg, fsm) {
                switch (msg.payload.kind) {
                    case "tick":
                        fsm.setState("green");
                        reply(msg, { status: "ok" });
                        break;

                    case "query":
                        reply(msg, { status: "timeUntilChange", seconds: 60 });
                        break;
                }
            },
        },

        green: {
            onMessage(msg, fsm) {
                switch (msg.payload.kind) {
                    case "tick":
                        fsm.setState("yellow");
                        reply(msg, { status: "ok" });
                        break;

                    case "query":
                        reply(msg, { status: "timeUntilChange", seconds: 45 });
                        break;
                }
            },
        },

        yellow: {
            onMessage(msg, fsm) {
                switch (msg.payload.kind) {
                    case "tick":
                        fsm.setState("red");
                        reply(msg, { status: "ok" });
                        break;

                    case "query":
                        reply(msg, { status: "timeUntilChange", seconds: 5 });
                        break;
                }
            },
        },
    },
});

// ---------------------------------------------------------------------------
// Thin helper: wrap the send() call so callers get a typed reply back
// ---------------------------------------------------------------------------

function send(payload: TrafficPayload): TrafficReply {
    let response!: TrafficReply;
    light.send({ payload, reply: (r) => (response = r) });
    return response;
}

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

console.log("=== Traffic Light FSM ===\n");
console.log(`Initial state: ${light.currentState}\n`);

// Query the current state before any tick
const initial = send({ kind: "query" });
console.log(`Time until first change: ${(initial as any).seconds}s\n`);

console.log("Advancing through a full cycle:\n");

// Full cycle: red → green → yellow → red
send({ kind: "tick" }); // → green
send({ kind: "tick" }); // → yellow
send({ kind: "tick" }); // → red

console.log(`\nBack to: ${light.currentState}`);

// Query mid-cycle
send({ kind: "tick" }); // → green
const q = send({ kind: "query" });
console.log(`Current state: ${light.currentState}`);
console.log(`Time until change: ${(q as any).seconds}s`);

// Reset back to the initial state
console.log("\nResetting...");
light.reset();
console.log(`State after reset: ${light.currentState}`);
