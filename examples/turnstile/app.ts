import { createTurnstile } from "./turnstile";
import { Message } from "../../src/fsm";

const turnstile = createTurnstile();

function send(payload: any) {
  const msg: Message<typeof payload, string> = {
    payload,

    reply(response) {
      console.log("Reply:", response);
      console.log("Current State:", turnstile.currentState);
      console.log("-------------------");
    },
  };

  turnstile.send(msg);
}

console.log("Initial State:", turnstile.currentState);
console.log("-------------------");

send({ type: "push" });
send({ type: "coin" });
send({ type: "coin" });
send({ type: "push" });
send({ type: "push" });
