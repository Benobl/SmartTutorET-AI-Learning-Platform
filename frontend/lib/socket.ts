import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            query: { userId },
        });

        socket.on("connect", () => {
            console.log("Connected to socket server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from socket server");
        });
    }
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
