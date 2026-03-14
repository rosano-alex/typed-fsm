import { createFSM } from "../../src/fsm";

type TurnstileStates =
    | "locked"
    | "unlocked";

type TurnstilePayload =
    | { type: "coin" }
    | { type: "push" };

type TurnstileReply = string;

export function createTurnstile() {
    return createFSM<TurnstileStates, TurnstilePayload, TurnstileReply>({
        initialState: "locked",

        onChange(from, to) {
            console.log(`STATE CHANGE: ${from} -> ${to}`);
        },

        states: {
            locked: {
                onMessage(message, machine) {
                    const event = message.payload;

                    switch (event.type) {
                        case "coin":
                            machine.setState("unlocked");

                            message.reply("Coin accepted. Turnstile unlocked.");
                            break;

                        case "push":
                            message.reply("ALARM! Turnstile is locked.");
                            break;
                    }
                },
            },

            unlocked: {
                onMessage(message, machine) {
                    const event = message.payload;

                    switch (event.type) {
                        case "push":
                            machine.setState("locked");

                            message.reply("You passed through the gate.");
                            break;

                        case "coin":
                            message.reply("Already unlocked. Thank you!");
                            break;
                    }
                },
            },
        },
    });
}
