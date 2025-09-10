// src/utils/pusher.ts
import Pusher from "pusher-js";
Pusher.logToConsole = true;
const pusher = new Pusher("f57ef841cfda156f64c6", {
  cluster: "ap2",
//   forceTLS: true,
  disableStats: true,
});

export default pusher;


