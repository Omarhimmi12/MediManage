import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

export function initEcho(token) {
  // Dispose any existing instance first
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      // ignore
    }
    echoInstance = null;
  }

  try {
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: "medi-manage-key",
      cluster: "mt1",
      wsHost: window.location.hostname || "127.0.0.1",
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } catch (err) {
    console.warn("[Echo] Failed to initialize WebSocket:", err);
    echoInstance = null;
  }

  return echoInstance;
}

/**
 * Get the current Echo instance, or null if not initialized.
 */
export function getEcho() {
  return echoInstance;
}

/**
 * Disconnect and clean up Echo.
 */
export function destroyEcho() {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      // ignore
    }
    echoInstance = null;
  }
}

export default echoInstance;
