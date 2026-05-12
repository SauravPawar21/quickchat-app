import { io } from "socket.io-client";
import { BASE_URL } from "./api";

let socket = null;

export const initSocket = (userId) => {
  if (socket && socket.connected) {
    console.log("Socket already connected!");
    return socket;
  }
  socket = io(BASE_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected!", socket.id);
    socket.emit("joinRoom", userId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected!!");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
