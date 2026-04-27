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
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        // Use local fallback only if specifically running on localhost, otherwise default to Render production
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const finalUrl = baseUrl || (isLocal ? "http://localhost:5001" : "https://smarttutoret-ai-learning-platform.onrender.com");

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
