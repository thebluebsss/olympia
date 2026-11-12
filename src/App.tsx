/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  History,
  Copy,
  Check,
  Crown,
  Lock,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  BookOpen,
} from 'lucide-react';
import type {
  OlympiaRoomState,
  ClientAction,
  RoomStage,
} from './types/olympia';
import {
  createInitialRoomState,
  applyClientAction,
  mergeRoomStates,
  stepBotActionIfNeeded,
  getRoomTieBreakerQuestions,
} from './utils/olympiaEngine';
import {
  createBrowserRoomSyncBridge,
  type BrowserRoomSyncBridge,
} from './utils/browserClusterSync';
import { ContestantScoreboard } from './components/ContestantScoreboard';
import { Round1KhoiDong } from './components/Round1KhoiDong';
import { Round2VCNV } from './components/Round2VCNV';
import { Round3TangToc } from './components/Round3TangToc';
import { Round4VeDich } from './components/Round4VeDich';
import {
  CsvQuestionBankModal,
  type DeckSelectionConfig,
  type QuestionBankStats,
} from './components/CsvQuestionBankModal';
import {
  AdminLoginModal,
  type AdminUser,
} from './components/AdminLoginModal';
import { EntryGateSection } from './components/layout/EntryGateSection';
import { LobbySection } from './components/layout/LobbySection';
import { TieBreakerAndGameOver } from './components/layout/TieBreakerAndGameOver';
import { SoloPracticeArena } from './components/SoloPracticeArena';
import { soundFX } from './utils/soundEffects';

function generateFreshClientId(): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : `${Math.random().toString(36).slice(2, 10)}${Math.random()
          .toString(36)
          .slice(2, 6)}`;
  return `climber-${rand}-${Date.now().toString(36).slice(-4)}`;
}

function getRoomCodeFromUrl(): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return (params.get('room') || '').trim().toUpperCase();
}

export default function App() {
  const [clientId, setClientId] = useState<string>(() =>
    generateFreshClientId()
  );

  const [inRoom, setInRoom] = useState<boolean>(false);
  const [isSoloPractice, setIsSoloPractice] = useState<boolean>(false);
  const [entryMode, setEntryMode] = useState<'CHOOSE' | 'JOIN_INPUT'>(() =>
    getRoomCodeFromUrl() ? 'JOIN_INPUT' : 'CHOOSE'
  );
  const [myProfileName, setMyProfileName] = useState<string>('');
  const [myProfileSchool, setMyProfileSchool] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>(() =>
    getRoomCodeFromUrl()
  );
  const [entryError, setEntryError] = useState<string>('');
  const [isCreatingOrJoining, setIsCreatingOrJoining] =
    useState<boolean>(false);

  const [roomCode, setRoomCode] = useState<string>('');
  const [roomState, setRoomState] = useState<OlympiaRoomState>(() =>
    createInitialRoomState('OLYMPIA')
  );
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  const [showCsvBankModal, setShowCsvBankModal] = useState<boolean>(false);
  const [bankStats, setBankStats] = useState<QuestionBankStats | null>(null);
  const [deckConfig, setDeckConfig] = useState<DeckSelectionConfig>({
    mode: 'CSV_RANDOM',
    season: '',
    match: '',
    subjectFilter: '',
  });
  const [isApplyingDeck, setIsApplyingDeck] = useState<boolean>(false);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('olympia_admin_token');
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showAdminLoginModal, setShowAdminLoginModal] =
    useState<boolean>(false);
  const [pendingProtectedAction, setPendingProtectedAction] = useState<
    'OPEN_BANK' | 'REROLL_DECK' | null
  >(null);

  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showLogPanel, setShowLogPanel] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const browserSyncRef = useRef<BrowserRoomSyncBridge | null>(null);
  const roomStateRef = useRef<OlympiaRoomState>(roomState);
  roomStateRef.current = roomState;

  useEffect(() => {
    fetch('/api/questions/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.totalQuestions === 'number') {
          setBankStats(data);
        } else if (data?.stats) {
          setBankStats(data.stats);
        }
      })
      .catch(() => {});

    if (adminToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.authenticated && data.user) {
            setAdminUser(data.user);
          } else {
            setAdminToken(null);
            setAdminUser(null);
            try {
              localStorage.removeItem('olympia_admin_token');
            } catch {
              // ignore
            }
          }
        })
        .catch(() => {});
    }
  }, [adminToken]);

  useEffect(() => {
    if (!inRoom || !roomCode) return;

    let isMounted = true;
    const code = roomCode.trim().toUpperCase();

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', code);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }

    const sendActionToLocalServer = (act: ClientAction) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(
            JSON.stringify({ type: 'ACTION', roomCode: code, action: act })
          );
          return;
        } catch {
          // ignore
        }
      }
      fetch(`/api/rooms/${encodeURIComponent(code)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act }),
      }).catch(() => {});
    };

    const syncBridge = createBrowserRoomSyncBridge(code, clientId, {
      onRemoteState: (remoteState) => {
        if (!isMounted) return;
        setRoomState((prev) => mergeRoomStates(prev, remoteState));
      },
      onRemoteAction: (remoteAction) => {
        if (!isMounted) return;
        setRoomState((prev) => {
          const applied = applyClientAction(prev, remoteAction);
          return mergeRoomStates(prev, applied);
        });
      },
      onConnectedChange: (connected) => {
        if (connected && isMounted) {
          setWsConnected(true);
          if (
            roomStateRef.current.roomCode === code &&
            roomStateRef.current.questionDeck
          ) {
            syncBridge.publishState(roomStateRef.current);
          }
        }
      },
    });
    browserSyncRef.current = syncBridge;

    fetch(`/api/rooms/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted && data?.state) {
          setRoomState((prev) => {
            const merged =
              prev.roomCode === code
                ? mergeRoomStates(prev, data.state)
                : data.state;
            syncBridge.publishState(merged);
            return merged;
          });
        }
      })
      .catch(() => {});

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${window.location.host}/ws-olympia?room=${encodeURIComponent(
      code
    )}`;

    const connectWs = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);
          if (
            roomStateRef.current.roomCode === code &&
            roomStateRef.current.questionDeck
          ) {
            try {
              ws.send(
                JSON.stringify({
                  type: 'SYNC_STATE',
                  roomCode: code,
                  state: roomStateRef.current,
                })
              );
            } catch {
              // ignore
            }
          }
        };

        ws.onmessage = (ev) => {
          try {
            const parsed = JSON.parse(String(ev.data));
            if (parsed.type === 'ROOM_STATE' && parsed.state && isMounted) {
              setRoomState((prev) => mergeRoomStates(prev, parsed.state));
            }
          } catch {
            // ignore
          }
        };

        ws.onclose = () => {
          if (isMounted) setTimeout(connectWs, 1200);
        };
      } catch {
        // ignore
      }
    };

    connectWs();

    const pollTimer = setInterval(() => {
      if (!isMounted) return;
      fetch(`/api/rooms/${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data) => {
          if (isMounted && data?.state) {
            setRoomState((prev) => {
              let merged = mergeRoomStates(prev, data.state);
              const trimmedName = myProfileName.trim();
              const isRoomHost =
                merged.hostClientId === clientId ||
                merged.creatorClientId === clientId;
              const isKicked = Boolean(merged.kickedClientIds?.[clientId]);
              if (isKicked && !isRoomHost) {
                setInRoom(false);
                setRoomCode('');
                setEntryError(
                  'Bạn đã bị MC Chủ Phòng mời ra khỏi phòng thi đấu.'
                );
                return merged;
              }
              const hasSeat = merged.seats.some(
                (s) => s.claimedByClientId === clientId
              );
              const hasLeft = Boolean(merged.leftClientIds?.[clientId]);
              const hasEmptySeat = merged.seats.some(
                (s) => !s.claimedByClientId
              );
              if (
                merged.stage === 'LOBBY' &&
                trimmedName &&
                !isRoomHost &&
                !hasSeat &&
                !hasLeft &&
                !isKicked &&
                hasEmptySeat
              ) {
                const claimAction: ClientAction = {
                  type: 'JOIN_OR_CLAIM_SEAT',
                  name: trimmedName,
                  school: myProfileSchool.trim() || 'THPT Chuyên',
                  clientId,
                  isCreatingRoom: false,
                };
                merged = applyClientAction(merged, claimAction);
                sendActionToLocalServer(claimAction);
                syncBridge.publishAction(claimAction);
              }
              return merged;
            });
          }
        })
        .catch(() => {});
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      setWsConnected(false);
      syncBridge.close();
      browserSyncRef.current = null;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [inRoom, roomCode, clientId, myProfileName, myProfileSchool]);

  const dispatchAction = useCallback(
    (action: ClientAction, targetRoomCode?: string) => {
      const code = (targetRoomCode || roomCode).trim().toUpperCase();
      const nowTs = Date.now();
      const uniqueActionId =
        action.actionId ||
        `act-${nowTs}-${Math.random().toString(36).slice(2, 8)}`;
      const enrichedAction = {
        ...action,
        actionId: uniqueActionId,
        actionTimestampMs: action.actionTimestampMs || nowTs,
        clientId: (action as { clientId?: string }).clientId || clientId,
      } as ClientAction;

      const isBuzzerAction =
        enrichedAction.type === 'R1_BUZZ_COMMON' ||
        enrichedAction.type === 'R2_BUZZ_CNV' ||
        enrichedAction.type === 'R4_BUZZ_STEAL' ||
        enrichedAction.type === 'TB_BUZZ';

      if (!isBuzzerAction) {
        setRoomState((prev) => {
          const applied = applyClientAction(prev, enrichedAction);
          const next = mergeRoomStates(prev, applied);
          browserSyncRef.current?.publishState(next);
          return next;
        });
      } else {
        browserSyncRef.current?.publishAction(enrichedAction);
      }

      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        !targetRoomCode
      ) {
        wsRef.current.send(
          JSON.stringify({
            type: 'ACTION',
            roomCode: code,
            action: enrichedAction,
          })
        );
      } else {
        fetch(`/api/rooms/${encodeURIComponent(code)}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: enrichedAction }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.state) {
              setRoomState((prev) => {
                const merged = mergeRoomStates(prev, data.state);
                if (!isBuzzerAction) {
                  browserSyncRef.current?.publishState(merged);
                }
                return merged;
              });
            }
          })
          .catch(() => {});
      }
    },
    [roomCode, clientId]
  );

  const handleApplyDeckToRoom = async (
    cfg: DeckSelectionConfig,
    overrideToken?: string
  ) => {
    const activeToken = overrideToken || adminToken;
    if (!activeToken) {
      setPendingProtectedAction('REROLL_DECK');
      setShowAdminLoginModal(true);
      return;
    }

    setDeckConfig(cfg);
    if (!inRoom || !roomCode) return;

    setIsApplyingDeck(true);
    try {
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(roomCode)}/select-deck`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({
            mode: cfg.mode,
            season: cfg.season,
            match: cfg.match,
            subjectFilter: cfg.subjectFilter,
            clientId,
          }),
        }
      );
      if (res.status === 401) {
        setAdminToken(null);
        setAdminUser(null);
        setPendingProtectedAction('REROLL_DECK');
        setShowAdminLoginModal(true);
        return;
      }
      const data = await res.json();
      if (data?.state) {
        setRoomState((prev) => {
          const merged = mergeRoomStates(prev, data.state);
          browserSyncRef.current?.publishState(merged);
          return merged;
        });
      }
    } catch {
      // ignore
    } finally {
      setIsApplyingDeck(false);
    }
  };

  const handleProtectedDeckAction = (
    actionType: 'OPEN_BANK' | 'REROLL_DECK'
  ) => {
    if (adminToken && adminUser) {
      if (actionType === 'OPEN_BANK') {
        setShowCsvBankModal(true);
      } else {
        handleApplyDeckToRoom(deckConfig, adminToken);
      }
      return;
    }
    setPendingProtectedAction(actionType);
    setShowAdminLoginModal(true);
  };

  const handleAdminLoginSuccess = (token: string, user: AdminUser) => {
    setAdminToken(token);
    setAdminUser(user);
    try {
      localStorage.setItem('olympia_admin_token', token);
    } catch {
      // ignore
    }
    setShowAdminLoginModal(false);

    if (pendingProtectedAction === 'OPEN_BANK') {
      setShowCsvBankModal(true);
    } else if (pendingProtectedAction === 'REROLL_DECK') {
      handleApplyDeckToRoom(deckConfig, token);
    }
    setPendingProtectedAction(null);
  };

  const handleAdminLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAdminToken(null);
    setAdminUser(null);
    setShowCsvBankModal(false);
    try {
      localStorage.removeItem('olympia_admin_token');
    } catch {
      // ignore
    }
  };

  const handleCreateRoom = async () => {
    const trimmedName = myProfileName.trim();
    if (!trimmedName) {
      setEntryError(
        'Vui lòng nhập Họ và tên MC Chủ phòng của bạn trước khi Tạo phòng!'
      );
      return;
    }
    setEntryError('');
    setIsCreatingOrJoining(true);
    soundFX.playRoundStart();

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          name: trimmedName,
          school: myProfileSchool.trim() || 'MC Điều Phối Olympia',
          clientId,
          deckMode: deckConfig.mode,
          season: deckConfig.season,
          match: deckConfig.match,
          subjectFilter: deckConfig.subjectFilter,
        }),
      });
      const data = await res.json();
      if (data?.roomCode && data?.state) {
        setRoomCode(data.roomCode);
        setRoomState(data.state);
        setInRoom(true);
      }
    } catch {
      setEntryError(
        'Không thể kết nối máy chủ để tạo phòng. Vui lòng thử lại.'
      );
    } finally {
      setIsCreatingOrJoining(false);
    }
  };

  const handleStartDemoMatch = async () => {
    const trimmedName = myProfileName.trim() || 'MC Chủ Phòng';
    const trimmedSchool = myProfileSchool.trim() || 'Ban Điều Phối Olympia';
    setMyProfileName(trimmedName);
    setMyProfileSchool(trimmedSchool);
    setEntryError('');
    setIsCreatingOrJoining(true);
    soundFX.playRoundStart();

    try {
      const res = await fetch('/api/rooms/create-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          name: trimmedName,
          school: trimmedSchool,
          clientId,
          deckMode: deckConfig.mode,
          season: deckConfig.season,
          match: deckConfig.match,
          subjectFilter: deckConfig.subjectFilter,
        }),
      });
      const data = await res.json();
      if (data?.roomCode && data?.state) {
        setRoomCode(data.roomCode);
        setRoomState(data.state);
        setInRoom(true);
      }
    } catch {
      setEntryError('Không thể khởi tạo trận đấu Demo. Vui lòng thử lại.');
    } finally {
      setIsCreatingOrJoining(false);
    }
  };

  const handleStartSoloPractice = () => {
    const trimmedName = myProfileName.trim() || 'Nhà Leo Núi';
    const trimmedSchool = myProfileSchool.trim() || 'THPT Chuyên';
    setMyProfileName(trimmedName);
    setMyProfileSchool(trimmedSchool);
    setEntryError('');
    soundFX.playRoundStart();
    setInRoom(false);
    setIsSoloPractice(true);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = myProfileName.trim();
    const code = joinCodeInput.trim().toUpperCase();

    if (!trimmedName) {
      setEntryError(
        'Vui lòng nhập Họ và tên Nhà Leo Núi của bạn trước khi Tham gia phòng!'
      );
      return;
    }
    if (!code || code.length < 3) {
      setEntryError(
        'Vui lòng nhập Mã phòng hợp lệ (ví dụ: 6 ký tự từ MC Chủ phòng)!'
      );
      return;
    }

    setEntryError('');
    setIsCreatingOrJoining(true);
    soundFX.playBuzzer();

    try {
      let activeClientId = clientId;
      try {
        const checkRes = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
        const checkData = await checkRes.json();
        if (checkData?.state) {
          const existingSeat = checkData.state.seats?.find(
            (s: { claimedByClientId: string | null }) =>
              s.claimedByClientId === activeClientId
          );
          const isRoomHostTab =
            checkData.state.hostClientId === activeClientId ||
            checkData.state.creatorClientId === activeClientId;
          if (existingSeat || isRoomHostTab) {
            activeClientId = generateFreshClientId();
            setClientId(activeClientId);
          }
        }
      } catch {
        // ignore
      }

      const action: ClientAction = {
        type: 'JOIN_OR_CLAIM_SEAT',
        name: trimmedName,
        school: myProfileSchool.trim() || 'THPT Chuyên',
        clientId: activeClientId,
        isCreatingRoom: false,
      };
      const res = await fetch(
        `/api/rooms/${encodeURIComponent(code)}/action`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (data?.state) {
        setRoomCode(code);
        setRoomState(data.state);
        setInRoom(true);
      }
    } catch {
      setEntryError('Không thể tham gia phòng. Vui lòng kiểm tra lại Mã phòng.');
    } finally {
      setIsCreatingOrJoining(false);
    }
  };

  const myPositions = roomState.seats
    .filter((s) => s.claimedByClientId === clientId)
    .map((s) => s.position);

  const myPosition: 1 | 2 | 3 | 4 | null = myPositions[0] ?? null;

  const handleLeaveRoomToGate = () => {
    myPositions.forEach((pos) => {
      dispatchAction({ type: 'LEAVE_SEAT', position: pos, clientId });
    });
    setInRoom(false);
    setRoomCode('');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard?.writeText(roomCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInviteLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode);
    navigator.clipboard?.writeText(url.toString()).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const occupiedSeatsCount = roomState.seats.filter((s) =>
    Boolean(s.claimedByClientId)
  ).length;

  const isHost = Boolean(
    clientId &&
      (roomState.hostClientId === clientId ||
        roomState.creatorClientId === clientId)
  );

  const canHostStartMatch = isHost && occupiedSeatsCount === 4;

  useEffect(() => {
    if (!inRoom || !isHost) return;
    if (roomState.stage === 'LOBBY' || roomState.stage === 'GAME_OVER') return;

    const hasBots = roomState.seats.some((s) =>
      s.claimedByClientId?.startsWith('BOT_SIM_')
    );
    if (!hasBots) return;

    const timer = window.setInterval(() => {
      const botAction = stepBotActionIfNeeded(roomStateRef.current, Date.now());
      if (botAction) {
        dispatchAction(botAction);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [inRoom, isHost, roomState.stage, roomState.seats, dispatchAction]);

  let hudActivePos: 1 | 2 | 3 | 4 | null = null;
  let hudBuzzedPos: 1 | 2 | 3 | 4 | null = null;
  let hudStarPos: 1 | 2 | 3 | 4 | null = null;

  if (roomState.stage === 'ROUND_1_KHOI_DONG') {
    if (
      roomState.round1.subPhase === 'PERSONAL_READY' ||
      roomState.round1.subPhase === 'PERSONAL_ACTIVE' ||
      roomState.round1.subPhase === 'PERSONAL_TURN_DONE'
    ) {
      hudActivePos = roomState.round1.activePosition;
    }
    hudBuzzedPos = roomState.round1.buzzedPosition;
  } else if (roomState.stage === 'ROUND_2_VCNV') {
    hudActivePos = roomState.round2.selectorPosition;
    hudBuzzedPos = roomState.round2.cnvBuzzerPosition;
  } else if (roomState.stage === 'ROUND_4_VE_DICH') {
    hudActivePos = roomState.round4.activePosition;
    hudBuzzedPos = roomState.round4.stealerPosition;
    if (roomState.round4.starActiveThisQ) {
      hudStarPos = roomState.round4.activePosition;
    }
  } else if (roomState.stage === 'TIE_BREAKER') {
    hudBuzzedPos = roomState.tieBreaker.buzzedPosition;
  }

  const tieBreakerQuestions = getRoomTieBreakerQuestions(roomState);

  return (
    <div className="min-h-screen bg-[#0A192F] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setShowRulesModal(false);
          }}
          className="text-lg font-display font-extrabold tracking-tight text-amber-400 whitespace-nowrap shrink-0"
        >
          Đường Lên Đỉnh Olympia
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {inRoom && (
            <button
              onClick={handleLeaveRoomToGate}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Đổi Phòng Khác
            </button>
          )}
          <button
            onClick={() => {
              if (isSoloPractice) {
                setIsSoloPractice(false);
              } else {
                handleStartSoloPractice();
              }
            }}
            className={`inline-flex items-center gap-1.5 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isSoloPractice
                ? 'text-sky-300 underline underline-offset-8 decoration-2 decoration-sky-400'
                : 'text-sky-300 hover:text-sky-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            {isSoloPractice ? 'Đang Ôn Tập 1 Người' : 'Chế Độ Ôn Tập 1 Người'}
          </button>
          <button
            onClick={() => handleProtectedDeckAction('OPEN_BANK')}
            className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {adminUser ? (
              <Database className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            Kho Câu Hỏi CSV (
            {(bankStats?.totalQuestions ?? 21630).toLocaleString('vi-VN')} câu)
          </button>
          <button
            onClick={() => setShowRulesModal((prev) => !prev)}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showRulesModal
                ? 'text-white font-semibold underline underline-offset-8 decoration-2 decoration-amber-400'
                : ''
            }`}
          >
            Thể Lệ Luật Chơi
          </button>
          {inRoom && (
            <button
              onClick={() => setShowLogPanel((prev) => !prev)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Nhật Ký Điểm ({roomState.logs.length})
            </button>
          )}
          <button
            onClick={toggleSound}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" /> Âm thanh: Bật
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" /> Âm thanh: Tắt
              </>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {adminUser ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-emerald-300 hidden sm:inline">
                Quyền BTC ({adminUser.username})
              </span>
              <button
                type="button"
                onClick={handleAdminLogout}
                title="Đăng xuất quyền Ban Tổ Chức"
                className="text-slate-400 hover:text-rose-300 inline-flex items-center gap-1 font-semibold cursor-pointer ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Thoát</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setPendingProtectedAction(null);
                setShowAdminLoginModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-400/40 rounded-lg cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng Nhập Quyền Đổi Đề</span>
              <span className="sm:hidden">BTC</span>
            </button>
          )}

          {inRoom ? (
            <button
              onClick={handleCopyRoomCode}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Đã chép mã: {roomCode}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Mã Phòng: {roomCode} ({occupiedSeatsCount}/4)
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => handleProtectedDeckAction('OPEN_BANK')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {adminUser ? (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              Quản Lý & Chọn Đề CSV
            </button>
          )}
        </div>
      </header>

      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => {
          setShowAdminLoginModal(false);
          setPendingProtectedAction(null);
        }}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <CsvQuestionBankModal
        isOpen={showCsvBankModal && Boolean(adminUser)}
        onClose={() => setShowCsvBankModal(false)}
        inRoom={inRoom}
        roomCode={roomCode}
        isHost={isHost}
        adminToken={adminToken}
        currentDeck={roomState.questionDeck}
        deckConfig={deckConfig}
        onChangeDeckConfig={setDeckConfig}
        onApplyDeckToRoom={handleApplyDeckToRoom}
        onStatsUpdated={setBankStats}
      />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {showRulesModal && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-semibold text-amber-400 uppercase">
                  THỂ LỆ THI ĐẤU TRỰC TUYẾN 4 NGƯỜI THẬT (TRẢ LỜI TỰ LUẬN)
                </div>
                <h2 className="text-2xl font-display font-extrabold text-white">
                  Luật Chơi Chuẩn Đường Lên Đỉnh Olympia
                </h2>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg cursor-pointer"
              >
                Đóng bảng luật chơi
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-300 leading-relaxed">
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-base font-bold text-amber-300">
                  1. Khởi Động (Lần lượt 4 người + Bấm chuông chung)
                </h3>
                <p>
                  • <strong>Lượt Cá Nhân:</strong> Lần lượt Vị trí 1 → 2 → 3 →
                  4 trả lời tự luận 6 câu hỏi riêng (+10đ/câu đúng, sai không
                  trừ điểm).
                </p>
                <p>
                  • <strong>Lượt Chung (12 câu):</strong> Cả 4 người chơi cùng
                  bấm chuông giành quyền trả lời: Đúng <strong>+10 điểm</strong>
                  , Sai <strong>-5 điểm</strong>.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-base font-bold text-amber-300">
                  2. Vượt Chướng Ngại Vật (4 Hàng ngang & 5 Mảnh ghép)
                </h3>
                <p>
                  • Lần lượt từng thí sinh chọn mở Hàng ngang gợi ý (+10đ cho
                  mỗi người trả lời đúng trong 15 giây).
                </p>
                <p>
                  • Bấm chuông giải Chướng Ngại Vật bất cứ lúc nào (+60đ / +50đ
                  / +40đ / +30đ / +20đ). Giải sai bị khóa quyền phần thi này.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-base font-bold text-amber-300">
                  3. Tăng Tốc (4 câu hỏi · Chấm thời gian 0.01s)
                </h3>
                <p>
                  • Qua 4 câu hỏi tự luận (15s, 20s, 25s, 30s), cả 4 người chơi
                  gửi đáp án độc lập.
                </p>
                <p>
                  • Trong số những người trả lời đúng: Nhanh nhất{' '}
                  <strong>+40đ</strong>, thứ nhì <strong>+30đ</strong>, thứ ba{' '}
                  <strong>+20đ</strong>, thứ tư <strong>+10đ</strong>.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-base font-bold text-amber-300">
                  4. Về Đích (Gói câu hỏi 20đ/30đ & Cướp điểm)
                </h3>
                <p>
                  • Lần lượt Vị trí 1 → 2 → 3 → 4 chọn gói 3 câu hỏi (
                  <strong>20đ</strong> hoặc <strong>30đ</strong>) và có 1 quyền
                  đặt <strong>★ Ngôi Sao Hy Vọng</strong>.
                </p>
                <p>
                  • Nếu trả lời sai, 3 thí sinh còn lại có 5 giây bấm chuông
                  giành quyền trả lời.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSoloPractice && (
          <SoloPracticeArena
            playerName={myProfileName.trim() || 'Nhà Leo Núi'}
            playerSchool={myProfileSchool.trim() || 'THPT Chuyên'}
            initialSubjectFilter={deckConfig.subjectFilter}
            onExitPractice={() => setIsSoloPractice(false)}
          />
        )}

        {!inRoom && !isSoloPractice && (
          <EntryGateSection
            myProfileName={myProfileName}
            setMyProfileName={setMyProfileName}
            myProfileSchool={myProfileSchool}
            setMyProfileSchool={setMyProfileSchool}
            entryError={entryError}
            setEntryError={setEntryError}
            entryMode={entryMode}
            setEntryMode={setEntryMode}
            joinCodeInput={joinCodeInput}
            setJoinCodeInput={setJoinCodeInput}
            isCreatingOrJoining={isCreatingOrJoining}
            bankStats={bankStats}
            deckConfig={deckConfig}
            adminUser={adminUser}
            onProtectedDeckAction={handleProtectedDeckAction}
            onCreateRoom={handleCreateRoom}
            onStartDemoMatch={handleStartDemoMatch}
            onStartSoloPractice={handleStartSoloPractice}
            onJoinRoom={handleJoinRoom}
          />
        )}

        {inRoom && !isSoloPractice && (
          <>
            {roomState.stage !== 'LOBBY' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    {(
                      [
                        {
                          id: 'ROUND_1_KHOI_DONG',
                          label: '1. Khởi Động',
                          order: 1,
                        },
                        {
                          id: 'ROUND_2_VCNV',
                          label: '2. Vượt Chướng Ngại Vật',
                          order: 2,
                        },
                        {
                          id: 'ROUND_3_TANG_TOC',
                          label: '3. Tăng Tốc',
                          order: 3,
                        },
                        {
                          id: 'ROUND_4_VE_DICH',
                          label: '4. Về Đích',
                          order: 4,
                        },
                      ] as const
                    ).map((step) => {
                      const stageOrder: Record<RoomStage, number> = {
                        LOBBY: 0,
                        ROUND_1_KHOI_DONG: 1,
                        ROUND_2_VCNV: 2,
                        ROUND_3_TANG_TOC: 3,
                        ROUND_4_VE_DICH: 4,
                        TIE_BREAKER: 5,
                        GAME_OVER: 6,
                      };
                      const currentOrder = stageOrder[roomState.stage] ?? 0;
                      const isCurrent = roomState.stage === step.id;
                      const isCompleted = currentOrder > step.order;
                      return (
                        <span
                          key={step.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold select-none ${
                            isCurrent
                              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/50'
                              : isCompleted
                                ? 'text-emerald-400'
                                : 'text-slate-500'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : !isCurrent ? (
                            <Lock className="w-3 h-3 text-slate-600" />
                          ) : null}
                          {step.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {roomState.questionDeck && (
                      <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300">
                        <Database className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{roomState.questionDeck.label}</span>
                      </span>
                    )}
                    {isHost ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/60 text-amber-300 font-extrabold">
                        <Crown className="w-3.5 h-3.5 fill-amber-400" />
                        MC Chủ Phòng:{' '}
                        {roomState.hostName || myProfileName || 'MC'}
                      </span>
                    ) : myPosition ? (
                      <span className="text-emerald-400 font-semibold">
                        Vị trí của bạn: Số {myPosition} (
                        {roomState.seats[myPosition - 1].name})
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Khán giả theo dõi (MC:{' '}
                        {roomState.hostName || 'Chủ phòng'})
                      </span>
                    )}
                    <span className="text-slate-400">
                      Phòng:{' '}
                      <strong className="font-mono text-amber-300">
                        {roomCode}
                      </strong>
                    </span>
                    {isHost && (
                      <button
                        onClick={() =>
                          dispatchAction({ type: 'RESET_ROOM', clientId })
                        }
                        className="text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Quay về Phòng Chờ
                      </button>
                    )}
                  </div>
                </div>

                {isHost && (
                  <div className="px-4 py-2 bg-slate-900/90 border border-amber-500/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-amber-300">
                      [MC] Quản lý 4 vị trí thí sinh (Đổi chỗ / Kick):
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {roomState.seats.map((s) => {
                        const p = s.position;
                        const nextPos = ((p % 4) + 1) as 1 | 2 | 3 | 4;
                        return (
                          <div
                            key={p}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800"
                          >
                            <span className="font-mono font-bold text-amber-300">
                              VT{p}:
                            </span>
                            <span className="text-slate-200 max-w-24 truncate">
                              {s.claimedByClientId ? s.name : '(Trống)'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                dispatchAction({
                                  type: 'MC_SWAP_SEATS',
                                  posA: p,
                                  posB: nextPos,
                                  clientId,
                                })
                              }
                              className="px-1.5 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold cursor-pointer"
                            >
                              ⇄ VT{nextPos}
                            </button>
                            {s.claimedByClientId && (
                              <button
                                type="button"
                                onClick={() =>
                                  dispatchAction({
                                    type: 'MC_KICK_PLAYER',
                                    position: p,
                                    clientId,
                                  })
                                }
                                className="px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold cursor-pointer"
                              >
                                ✕ Kick
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ContestantScoreboard
                  seats={roomState.seats}
                  myPositions={myPositions}
                  activePosition={hudActivePos}
                  buzzedPosition={hudBuzzedPos}
                  starPosition={hudStarPos}
                />
              </div>
            )}

            {showLogPanel && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 max-h-56 overflow-y-auto">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                  <span className="inline-flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    Nhật ký sự kiện thời gian thực (Phòng {roomCode})
                  </span>
                  <button
                    onClick={() => setShowLogPanel(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
                {roomState.logs.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có sự kiện nào.</p>
                ) : (
                  <ul className="space-y-1.5 text-xs">
                    {roomState.logs.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-center justify-between gap-4 py-1 border-b border-slate-800/70"
                      >
                        <span className="text-slate-300">
                          <span className="font-mono text-slate-500 mr-1.5">
                            {l.timestamp}
                          </span>
                          <strong className="text-sky-300">[{l.round}]</strong>{' '}
                          {l.text}
                        </span>
                        {l.delta && (
                          <span className="font-mono font-bold text-amber-300 shrink-0">
                            {l.delta}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {roomState.stage === 'LOBBY' && (
              <LobbySection
                roomCode={roomCode}
                roomState={roomState}
                clientId={clientId}
                isHost={isHost}
                canHostStartMatch={canHostStartMatch}
                occupiedSeatsCount={occupiedSeatsCount}
                wsConnected={wsConnected}
                copiedCode={copiedCode}
                copiedLink={copiedLink}
                isApplyingDeck={isApplyingDeck}
                adminUser={adminUser}
                myProfileName={myProfileName}
                myProfileSchool={myProfileSchool}
                onCopyRoomCode={handleCopyRoomCode}
                onCopyInviteLink={handleCopyInviteLink}
                onLeaveRoom={handleLeaveRoomToGate}
                onProtectedDeckAction={handleProtectedDeckAction}
                onDispatch={dispatchAction}
              />
            )}

            {roomState.stage === 'ROUND_1_KHOI_DONG' && (
              <Round1KhoiDong
                room={roomState}
                clientId={clientId}
                isHost={isHost}
                myPositions={myPositions}
                onDispatch={dispatchAction}
              />
            )}

            {roomState.stage === 'ROUND_2_VCNV' && (
              <Round2VCNV
                room={roomState}
                clientId={clientId}
                isHost={isHost}
                myPositions={myPositions}
                onDispatch={dispatchAction}
              />
            )}

            {roomState.stage === 'ROUND_3_TANG_TOC' && (
              <Round3TangToc
                room={roomState}
                clientId={clientId}
                isHost={isHost}
                myPositions={myPositions}
                onDispatch={dispatchAction}
              />
            )}

            {roomState.stage === 'ROUND_4_VE_DICH' && (
              <Round4VeDich
                room={roomState}
                clientId={clientId}
                isHost={isHost}
                myPositions={myPositions}
                onDispatch={dispatchAction}
              />
            )}

            {(roomState.stage === 'TIE_BREAKER' ||
              roomState.stage === 'GAME_OVER') && (
              <TieBreakerAndGameOver
                roomState={roomState}
                clientId={clientId}
                isHost={isHost}
                myPosition={myPosition}
                tieBreakerQuestions={tieBreakerQuestions}
                onDispatch={dispatchAction}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
