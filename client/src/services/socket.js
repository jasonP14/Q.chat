import { io } from "socket.io-client";

// Create socket instance but don't connect immediately
export const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3001", {
  autoConnect: false,
  // Additional options
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

if (import.meta.env.DEV) {
  socket.onAny((event, ...args) => {
    console.log(`[socket] ${event}`, args);
  });

  socket.on("connect_error", (err) => {
    console.error("[socket] Connection error:", err);
  });
}