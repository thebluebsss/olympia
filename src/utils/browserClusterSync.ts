import type { OlympiaRoomState, ClientAction } from '../types/olympia';

const TOPIC_PREFIX = 'olympia_52e66cb9_v3';
const WS_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

function encodeRemainingLength(len: number): Uint8Array {
  const bytes: number[] = [];
  do {
    let encoded = len % 128;
    len = Math.floor(len / 128);
    if (len > 0) encoded = encoded | 128;
    bytes.push(encoded);
  } while (len > 0);
  return new Uint8Array(bytes);
}

function encodeUtf8String(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const strBytes = encoder.encode(str);
  const out = new Uint8Array(2 + strBytes.length);
  out[0] = (strBytes.length >> 8) & 0xff;
  out[1] = strBytes.length & 0xff;
  out.set(strBytes, 2);
  return out;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function buildConnectPacket(clientId: string): Uint8Array {
  const vh = new Uint8Array([
    0x00,
    0x04,
    0x4d,
    0x51,
    0x54,
    0x54,
    0x04,
    0x02,
    0x00,
    0x3c,
  ]);
  const pl = encodeUtf8String(clientId);
  const rem = concatBytes(vh, pl);
  return concatBytes(
    new Uint8Array([0x10]),
    encodeRemainingLength(rem.length),
    rem
  );
}

function buildSubscribePacket(topic: string, packetId: number): Uint8Array {
  const vh = new Uint8Array([(packetId >> 8) & 0xff, packetId & 0xff]);
  const pl = concatBytes(encodeUtf8String(topic), new Uint8Array([0x00]));
  const rem = concatBytes(vh, pl);
  return concatBytes(
    new Uint8Array([0x82]),
    encodeRemainingLength(rem.length),
    rem
  );
}

function buildPublishPacket(
  topic: string,
  payloadStr: string,
  retain: boolean
): Uint8Array {
  const encoder = new TextEncoder();
  const topicBytes = encodeUtf8String(topic);
  const payloadBytes = encoder.encode(payloadStr);
  const rem = concatBytes(topicBytes, payloadBytes);
  return concatBytes(
    new Uint8Array([retain ? 0x31 : 0x30]),
    encodeRemainingLength(rem.length),
    rem
  );
}

export interface BrowserRoomSyncBridge {
  publishState: (state: OlympiaRoomState) => void;
  publishAction: (action: ClientAction) => void;
  close: () => void;
}

export function createBrowserRoomSyncBridge(
  roomCode: string,
  clientId: string,
  callbacks: {
    onRemoteState: (state: OlympiaRoomState) => void;
    onRemoteAction: (action: ClientAction) => void;
    onConnectedChange?: (connected: boolean) => void;
  }
): BrowserRoomSyncBridge {
  const code = roomCode.trim().toUpperCase();
  const roomTopic = `${TOPIC_PREFIX}/rooms/${code}`;
  const actionTopic = `${TOPIC_PREFIX}/actions/${code}`;
  const decoder = new TextDecoder();

  let disposed = false;
  const openSockets = new Set<WebSocket>();
  const cleanupFns: Array<() => void> = [];

  // 1. Same-browser BroadcastChannel for instant multi-tab sync
  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(`olympia_bc_${code}`);
      bc.onmessage = (ev) => {
        if (disposed || !ev.data) return;
        const data = ev.data;
        if (data.originId === clientId) return;
        if (data.type === 'STATE' && data.state) {
          callbacks.onRemoteState(data.state);
        } else if (data.type === 'ACTION' && data.action) {
          callbacks.onRemoteAction(data.action);
        }
      };
    }
  } catch {
    // ignore
  }

  // 2. Cross-device / cross-origin MQTT over WebSocket
  for (const url of WS_BROKERS) {
    let ws: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let recvBuf: Uint8Array = new Uint8Array(0);

    const connect = () => {
      if (disposed) return;
      try {
        ws = new WebSocket(url, 'mqtt');
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          if (disposed || !ws) return;
          const mqttClientId = `web_${clientId}_${Math.random()
            .toString(36)
            .slice(2, 6)}`;
          ws.send(buildConnectPacket(mqttClientId) as unknown as ArrayBuffer);
          ws.send(buildSubscribePacket(roomTopic, 1) as unknown as ArrayBuffer);
          ws.send(
            buildSubscribePacket(actionTopic, 2) as unknown as ArrayBuffer
          );
          openSockets.add(ws);
          callbacks.onConnectedChange?.(true);

          pingTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(
                new Uint8Array([0xc0, 0x00]) as unknown as ArrayBuffer
              );
            }
          }, 25000);
        };

        ws.onmessage = (ev) => {
          if (disposed || !(ev.data instanceof ArrayBuffer)) return;
          const chunk = new Uint8Array(ev.data);
          recvBuf = concatBytes(recvBuf, chunk);

          while (recvBuf.length >= 2) {
            const packetType = recvBuf[0] >> 4;
            const flags = recvBuf[0] & 0x0f;
            let mult = 1;
            let remLen = 0;
            let idx = 1;
            let complete = false;

            while (idx < recvBuf.length) {
              const b = recvBuf[idx++];
              remLen += (b & 127) * mult;
              mult *= 128;
              if ((b & 128) === 0) {
                complete = true;
                break;
              }
              if (mult > 128 * 128 * 128) {
                recvBuf = new Uint8Array(0);
                return;
              }
            }

            if (!complete || recvBuf.length < idx + remLen) break;

            const body = recvBuf.subarray(idx, idx + remLen);
            recvBuf = recvBuf.subarray(idx + remLen);

            if (packetType === 3 && body.length >= 2) {
              const tLen = (body[0] << 8) | body[1];
              if (body.length < 2 + tLen) continue;
              const topic = decoder.decode(body.subarray(2, 2 + tLen));
              const qos = (flags >> 1) & 0x03;
              const offset = 2 + tLen + (qos > 0 ? 2 : 0);
              if (body.length < offset) continue;
              const jsonStr = decoder.decode(body.subarray(offset));
              try {
                const parsed = JSON.parse(jsonStr);
                if (!parsed || parsed.originId === clientId) continue;
                if (topic === roomTopic && parsed.state) {
                  callbacks.onRemoteState(parsed.state as OlympiaRoomState);
                } else if (topic === actionTopic && parsed.action) {
                  callbacks.onRemoteAction(parsed.action as ClientAction);
                }
              } catch {
                // ignore
              }
            }
          }
        };

        const handleClose = () => {
          if (ws) openSockets.delete(ws);
          if (pingTimer) {
            clearInterval(pingTimer);
            pingTimer = null;
          }
          if (openSockets.size === 0) {
            callbacks.onConnectedChange?.(false);
          }
          if (!disposed && !retryTimer) {
            retryTimer = setTimeout(() => {
              retryTimer = null;
              connect();
            }, 2500);
          }
        };

        ws.onerror = handleClose;
        ws.onclose = handleClose;
      } catch {
        // ignore
      }
    };

    connect();

    cleanupFns.push(() => {
      if (pingTimer) clearInterval(pingTimer);
      if (retryTimer) clearTimeout(retryTimer);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    });
  }

  return {
    publishState(state: OlympiaRoomState) {
      if (disposed) return;
      try {
        bc?.postMessage({ type: 'STATE', originId: clientId, state });
      } catch {
        // ignore
      }
      const pkt = buildPublishPacket(
        roomTopic,
        JSON.stringify({ originId: clientId, ts: Date.now(), state }),
        true
      );
      openSockets.forEach((s) => {
        if (s.readyState === WebSocket.OPEN) {
          try {
            s.send(pkt as unknown as ArrayBuffer);
          } catch {
            // ignore
          }
        }
      });
    },
    publishAction(action: ClientAction) {
      if (disposed) return;
      try {
        bc?.postMessage({ type: 'ACTION', originId: clientId, action });
      } catch {
        // ignore
      }
      const pkt = buildPublishPacket(
        actionTopic,
        JSON.stringify({ originId: clientId, ts: Date.now(), action }),
        false
      );
      openSockets.forEach((s) => {
        if (s.readyState === WebSocket.OPEN) {
          try {
            s.send(pkt as unknown as ArrayBuffer);
          } catch {
            // ignore
          }
        }
      });
    },
    close() {
      disposed = true;
      try {
        bc?.close();
      } catch {
        // ignore
      }
      cleanupFns.forEach((fn) => fn());
      openSockets.clear();
    },
  };
}
