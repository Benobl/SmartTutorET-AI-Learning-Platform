import { io, Socket } from "socket.io-client";

let socket: any;
let currentSocketUserId: string | null = null;

export const initializeSocket = (userId: string) => {
    // If socket exists but for a DIFFERENT user, purge it aggressively
    if (socket && currentSocketUserId !== userId) {
        console.log(`[Socket] WARNING: IDENTITY OVERLAP DETECTED. PURGING OLD SESSION. Old: ${currentSocketUserId}, New: ${userId}`);
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        currentSocketUserId = null;
    }

    if (!socket) {
        if (!userId) {
            console.error("[Socket] Cannot initialize without userId");
            return null;
        }
        // Fallback to current host if NEXT_PUBLIC_SOCKET_URL is missing
        let baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        if (!baseUrl && typeof window !== 'undefined') {
            baseUrl = `http://${window.location.hostname}:5001`;
        }
        const finalUrl = baseUrl || "http://localhost:5001";

        console.log(`[Socket] Initializing connection to ${finalUrl} for user ${userId}`);

        socket = io(finalUrl, {
            query: { userId },
            transports: ['websocket', 'polling'], // Ensure compatibility
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        currentSocketUserId = userId;

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
