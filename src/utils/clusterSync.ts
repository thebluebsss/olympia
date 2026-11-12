import net from 'net';
import fs from 'fs';
import type { OlympiaRoomState, ClientAction } from '../types/olympia.ts';

const DISK_CACHE_PATH = '/tmp/olympia_rooms_v3.json';
const TOPIC_PREFIX = 'olympia_52e66cb9_v3';
const SERVER_INSTANCE_ID = `srv-${Math.random().toString(36).slice(2, 10)}`;

const BROKER_HOSTS = ['broker.emqx.io', 'broker.hivemq.com'];

interface ClusterHandlers {
  onRemoteState: (roomCode: string, state: OlympiaRoomState) => void;
  onRemoteAction: (roomCode: string, action: ClientAction) => void;
}

let activeHandlers: ClusterHandlers | null = null;
const activeSockets = new Map<string, net.Socket>();
let initialSyncResolved = false;
let initialSyncWaiters: Array<() => void> = [];

function resolveInitialSync() {
  if (initialSyncResolved) return;
  initialSyncResolved = true;
  const waiters = [...initialSyncWaiters];
  initialSyncWaiters = [];
  waiters.forEach((fn) => fn());
}

export function waitForClusterSync(timeoutMs = 700): Promise<void> {
  if (initialSyncResolved) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve();
    }, timeoutMs);
    initialSyncWaiters.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function loadRoomsFromDisk(): Map<string, OlympiaRoomState> {
  const map = new Map<string, OlympiaRoomState>();
  try {
    if (fs.existsSync(DISK_CACHE_PATH)) {
      const raw = fs.readFileSync(DISK_CACHE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, OlympiaRoomState>;
      for (const [code, state] of Object.entries(parsed)) {
        if (code && state && state.roomCode) {
          map.set(code.toUpperCase(), state);
        }
      }
    }
  } catch {
    // ignore corrupt disk cache
  }
  return map;
}

export function saveRoomsToDisk(rooms: Map<string, OlympiaRoomState>): void {
  try {
    const obj: Record<string, OlympiaRoomState> = {};
    for (const [code, state] of rooms.entries()) {
      obj[code] = state;
    }
    fs.writeFileSync(DISK_CACHE_PATH, JSON.stringify(obj), 'utf8');
  } catch {
    // ignore disk write errors
  }
}

function encodeRemainingLength(len: number): Buffer {
  const bytes: number[] = [];
  do {
    let encoded = len % 128;
    len = Math.floor(len / 128);
    if (len > 0) encoded = encoded | 128;
    bytes.push(encoded);
  } while (len > 0);
  return Buffer.from(bytes);
}

function encodeUtf8String(str: string): Buffer {
  const b = Buffer.from(str, 'utf8');
  const len = Buffer.alloc(2);
  len.writeUInt16BE(b.length, 0);
  return Buffer.concat([len, b]);
}

function buildMqttConnectPacket(clientId: string): Buffer {
  const variableHeader = Buffer.from([
    0x00,
    0x04,
    0x4d,
    0x51,
    0x54,
    0x54, // "MQTT"
    0x04, // Protocol level 4 (MQTT 3.1.1)
    0x02, // Clean session
    0x00,
    0x3c, // Keepalive 60s
  ]);
  const payload = encodeUtf8String(clientId);
  const remaining = Buffer.concat([variableHeader, payload]);
  return Buffer.concat([
    Buffer.from([0x10]),
    encodeRemainingLength(remaining.length),
    remaining,
  ]);
}

function buildMqttSubscribePacket(topic: string, packetId: number): Buffer {
  const variableHeader = Buffer.alloc(2);
  variableHeader.writeUInt16BE(packetId, 0);
  const payload = Buffer.concat([encodeUtf8String(topic), Buffer.from([0x00])]);
  const remaining = Buffer.concat([variableHeader, payload]);
  return Buffer.concat([
    Buffer.from([0x82]),
    encodeRemainingLength(remaining.length),
    remaining,
  ]);
}

function buildMqttPublishPacket(
  topic: string,
  payloadStr: string,
  retain: boolean
): Buffer {
  const topicBuf = encodeUtf8String(topic);
  const payloadBuf = Buffer.from(payloadStr, 'utf8');
  const remaining = Buffer.concat([topicBuf, payloadBuf]);
  const headerByte = retain ? 0x31 : 0x30;
  return Buffer.concat([
    Buffer.from([headerByte]),
    encodeRemainingLength(remaining.length),
    remaining,
  ]);
}

function connectBroker(host: string) {
  let socket: net.Socket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let recvBuffer = Buffer.alloc(0);

  const cleanup = () => {
    activeSockets.delete(host);
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (socket) {
      socket.removeAllListeners();
      socket.destroy();
      socket = null;
    }
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectBroker(host);
      }, 2500);
    }
  };

  try {
    socket = net.connect(1883, host, () => {
      if (!socket) return;
      const cid = `olympia_${SERVER_INSTANCE_ID}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      socket.write(buildMqttConnectPacket(cid));
      socket.write(buildMqttSubscribePacket(`${TOPIC_PREFIX}/rooms/+`, 1));
      socket.write(buildMqttSubscribePacket(`${TOPIC_PREFIX}/actions/+`, 2));
      activeSockets.set(host, socket);

      setTimeout(resolveInitialSync, 350);

      pingTimer = setInterval(() => {
        if (socket && !socket.destroyed) {
          socket.write(Buffer.from([0xc0, 0x00]));
        }
      }, 25000);
    });

    socket.on('data', (chunk: Buffer) => {
      recvBuffer = Buffer.concat([recvBuffer, chunk]);
      while (recvBuffer.length >= 2) {
        const packetType = recvBuffer[0] >> 4;
        const flags = recvBuffer[0] & 0x0f;
        let multiplier = 1;
        let remainingLength = 0;
        let idx = 1;
        let completeLength = false;

        while (idx < recvBuffer.length) {
          const encodedByte = recvBuffer[idx++];
          remainingLength += (encodedByte & 127) * multiplier;
          multiplier *= 128;
          if ((encodedByte & 128) === 0) {
            completeLength = true;
            break;
          }
          if (multiplier > 128 * 128 * 128) {
            recvBuffer = Buffer.alloc(0);
            return;
          }
        }

        if (!completeLength || recvBuffer.length < idx + remainingLength) {
          break;
        }

        const body = recvBuffer.subarray(idx, idx + remainingLength);
        recvBuffer = recvBuffer.subarray(idx + remainingLength);

        if (packetType === 3 && body.length >= 2) {
          // PUBLISH packet
          const topicLen = body.readUInt16BE(0);
          if (body.length < 2 + topicLen) continue;
          const topic = body.subarray(2, 2 + topicLen).toString('utf8');
          const qos = (flags >> 1) & 0x03;
          const payloadOffset = 2 + topicLen + (qos > 0 ? 2 : 0);
          if (body.length < payloadOffset) continue;
          const jsonStr = body.subarray(payloadOffset).toString('utf8');

          try {
            const parsed = JSON.parse(jsonStr);
            if (!parsed || parsed.originId === SERVER_INSTANCE_ID) {
              continue;
            }
            if (
              topic.startsWith(`${TOPIC_PREFIX}/rooms/`) &&
              parsed.state &&
              activeHandlers
            ) {
              const roomCode = topic
                .slice(`${TOPIC_PREFIX}/rooms/`.length)
                .trim()
                .toUpperCase();
              activeHandlers.onRemoteState(
                roomCode,
                parsed.state as OlympiaRoomState
              );
            } else if (
              topic.startsWith(`${TOPIC_PREFIX}/actions/`) &&
              parsed.action &&
              activeHandlers
            ) {
              const roomCode = topic
                .slice(`${TOPIC_PREFIX}/actions/`.length)
                .trim()
                .toUpperCase();
              activeHandlers.onRemoteAction(
                roomCode,
                parsed.action as ClientAction
              );
            }
          } catch {
            // ignore malformed JSON
          }
        }
      }
    });

    socket.on('error', cleanup);
    socket.on('close', cleanup);
  } catch {
    cleanup();
  }
}

export function initServerClusterSync(handlers: ClusterHandlers): void {
  activeHandlers = handlers;
  for (const host of BROKER_HOSTS) {
    connectBroker(host);
  }
}

export function publishRoomStateToCluster(
  roomCode: string,
  state: OlympiaRoomState
): void {
  const code = roomCode.trim().toUpperCase();
  const payload = JSON.stringify({
    originId: SERVER_INSTANCE_ID,
    ts: Date.now(),
    state,
  });
  const packet = buildMqttPublishPacket(
    `${TOPIC_PREFIX}/rooms/${code}`,
    payload,
    true // retain = true so cold-starting instances immediately receive the room
  );
  for (const sock of activeSockets.values()) {
    try {
      if (!sock.destroyed) sock.write(packet);
    } catch {
      // ignore
    }
  }
}

export function publishActionToCluster(
  roomCode: string,
  action: ClientAction
): void {
  const code = roomCode.trim().toUpperCase();
  const payload = JSON.stringify({
    originId: SERVER_INSTANCE_ID,
    ts: Date.now(),
    action,
  });
  const packet = buildMqttPublishPacket(
    `${TOPIC_PREFIX}/actions/${code}`,
    payload,
    false
  );
  for (const sock of activeSockets.values()) {
    try {
      if (!sock.destroyed) sock.write(packet);
    } catch {
      // ignore
    }
  }
}
