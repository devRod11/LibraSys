import { io } from "socket.io-client";

export const socket = io("https://librasys-v3.onrender.com", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
