/**
 * Backend configuration for Socket.IO connection
 */

// Production backend URL (Render)
export const BACKEND_URL = "https://olympia-mzrw.onrender.com";

// Socket.IO connection configuration
export const SOCKET_CONFIG = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
};
