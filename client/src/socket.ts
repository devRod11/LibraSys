import { io } from "socket.io-client";

export const socket = io("https://librasys-backend.onrender.com", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
