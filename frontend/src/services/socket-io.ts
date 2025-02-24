import { io, Socket } from "socket.io-client";

export const socket: Socket = io(process.env.NEXT_PUBLIC_WSS_URL, {
  autoConnect: true,
  reconnection: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.warn("Connected to socket server", socket.id);
});

socket.on("disconnect", () => {
  console.warn("Disconnected from socket server");
});
