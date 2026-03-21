import { useState, useEffect, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiSend,
  FiPaperclip,
  FiX,
  FiMessageSquare,
  FiUsers,
  FiCheck,
  FiCheckCircle,
  FiFile,
  FiDownload,
  FiClock,
  FiChevronLeft,
} from 'react-icons/fi';
import {
  getChatHistory,
  markMessagesAsRead,
  getUnreadMessageCount,
  getAllClients,
  BASE_URL,
} from '../../../service/api';

/* ────── helpers ────── */
const formatTime = (d) => {
  const dt = new Date(d);
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const formatDate = (d) => {
  const dt = new Date(d);
  const today = new Date();
  if (dt.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dt.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const FILE_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.zip';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* ═══════════════════════════════════════════════════════ */
export default function ChatUpdatesTab({ isDarkMode }) {
  /* ── state ── */
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});       // { clientId: count }
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const socketRef = useRef(null);
  const userRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ── dark-mode palette ── */
  const bg = isDarkMode ? 'bg-[#1e1b2e]' : 'bg-white';
  const bgSub = isDarkMode ? 'bg-[#282440]' : 'bg-[#f7f5fc]';
  const text = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const border = isDarkMode ? 'border-[#3a3556]' : 'border-[#ece8f8]';
  const inputBg = isDarkMode ? 'bg-[#322d4a]' : 'bg-[#f2f0fa]';
  const hover = isDarkMode ? 'hover:bg-[#3a3556]' : 'hover:bg-[#ece8f8]';

  /* ═══════ SOCKET INIT ═══════ */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    userRef.current = jwtDecode(token);

    socketRef.current = io(BASE_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('user_connected', {
        userId: userRef.current.id,
        userType: userRef.current.role || 'TeamLeader',
      });
    });

    socketRef.current.on('receive_message', (msg) => {
      if (!msg) return;
      const formatted = formatIncoming(msg);
      // If this message is for the currently-open conversation, append it
      setSelectedClient((prev) => {
        if (prev && (msg.senderId === prev.id || msg.sender === prev.id)) {
          setMessages((m) => [...m, formatted]);
          // Mark read immediately
          markMessagesAsRead(prev.id, userRef.current.id).catch(() => {});
        } else {
          // Update unread badge
          const fromId = msg.senderId || msg.sender;
          if (fromId) {
            setUnreadMap((u) => ({ ...u, [fromId]: (u[fromId] || 0) + 1 }));
          }
        }
        return prev;
      });
    });

    socketRef.current.on('user_typing', ({ userId }) => {
      setSelectedClient((prev) => {
        if (prev && userId === prev.id) {
          setTyping(true);
          setTimeout(() => setTyping(false), 2000);
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('receive_message');
        socketRef.current.off('user_typing');
        socketRef.current.disconnect();
      }
    };
  }, []);

  /* ═══════ LOAD CLIENTS ═══════ */
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllClients();
        const list = Array.isArray(res) ? res : res?.data ?? res?.clients ?? [];
        setClients(list);
        setFilteredClients(list);

        // Fetch unread counts per client
        if (userRef.current) {
          const unreadRes = await getUnreadMessageCount(userRef.current.id);
          if (unreadRes?.count !== undefined) {
            // Backend returns total count – we'll track per-sender when messages arrive
          }
        }
      } catch (e) {
        console.error('Failed to load clients', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── search filter ── */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredClients(clients);
    } else {
      const q = search.toLowerCase();
      setFilteredClients(
        clients.filter(
          (c) =>
            (c.clientName || c.name || '').toLowerCase().includes(q) ||
            (c.companyName || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q),
        ),
      );
    }
  }, [search, clients]);

  /* ═══════ SELECT CLIENT → LOAD HISTORY ═══════ */
  const selectClient = useCallback(
    async (client) => {
      setSelectedClient(client);
      setMessages([]);
      setMobileShowChat(true);
      setTyping(false);

      // Clear unread for this client
      setUnreadMap((u) => ({ ...u, [client.id]: 0 }));

      try {
        const history = await getChatHistory(userRef.current.id, client.id);
        if (Array.isArray(history)) {
          setMessages(history.map(formatIncoming));
        }
        await markMessagesAsRead(client.id, userRef.current.id);
      } catch (e) {
        console.error('Error loading chat', e);
      }
    },
    [],
  );

  /* ── scroll to bottom on new messages ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ═══════ SEND MESSAGE ═══════ */
  const handleSend = async () => {
    if ((!newMsg.trim() && !attachedFile) || !selectedClient || !socketRef.current?.connected) return;

    if (attachedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const payload = {
          senderId: userRef.current.id,
          senderType: userRef.current.role || 'TeamLeader',
          receiverId: selectedClient.id,
          receiverType: 'Client',
          messageType: 'document',
          file: {
            buffer: reader.result,
            originalname: attachedFile.name,
            mimetype: attachedFile.type,
            size: attachedFile.size,
          },
        };

        const optimistic = {
          id: Date.now(),
          sender: userRef.current.id,
          timestamp: new Date(),
          type: 'document',
          fileName: attachedFile.name,
          fileSize: attachedFile.size,
          fileType: attachedFile.type,
          senderType: userRef.current.role || 'TeamLeader',
          receiverType: 'Client',
          read: false,
        };
        setMessages((m) => [...m, optimistic]);
        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        socketRef.current.emit('private_message', payload, (resp) => {
          if (resp?.error) {
            setMessages((m) => m.filter((x) => x.id !== optimistic.id));
            return;
          }
          setMessages((m) =>
            m.map((x) =>
              x.id === optimistic.id
                ? { ...x, id: resp._id, fileUrl: resp.document?.webViewLink }
                : x,
            ),
          );
        });
      };
      reader.readAsArrayBuffer(attachedFile);
      return;
    }

    // Text message
    const payload = {
      senderId: userRef.current.id,
      senderType: userRef.current.role || 'TeamLeader',
      receiverId: selectedClient.id,
      receiverType: 'Client',
      messageType: 'text',
      content: newMsg,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('private_message', payload);

    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        content: newMsg,
        sender: userRef.current.id,
        timestamp: new Date(),
        type: 'text',
        senderType: userRef.current.role || 'TeamLeader',
        receiverType: 'Client',
        read: false,
      },
    ]);
    setNewMsg('');
  };

  /* ── typing indicator emit ── */
  const handleTyping = () => {
    if (selectedClient && socketRef.current?.connected) {
      socketRef.current.emit('typing', {
        userId: userRef.current.id,
        receiverId: selectedClient.id,
      });
    }
  };

  /* ── file attach ── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert('File must be under 5 MB');
      e.target.value = '';
      return;
    }
    setAttachedFile(file);
  };

  /* ── format incoming message ── */
  function formatIncoming(msg) {
    return {
      id: msg._id || msg.id || Date.now(),
      sender: msg.senderId || msg.sender,
      content: msg.content,
      timestamp: new Date(msg.createdAt || msg.timestamp || Date.now()),
      type: msg.messageType || msg.type || 'text',
      senderType: msg.senderType,
      receiverType: msg.receiverType,
      read: msg.read,
      fileName: msg.document?.fileName,
      fileSize: msg.document?.fileSize,
      fileType: msg.document?.fileType,
      fileUrl: msg.document?.webViewLink,
    };
  }

  /* ── group messages by date ── */
  const groupedMessages = messages.reduce((acc, msg) => {
    const key = formatDate(msg.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const clientDisplayName = (c) => c.clientName || c.name || c.companyName || c.email || 'Client';
  const clientInitials = (c) => {
    const n = clientDisplayName(c);
    return n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  /* ═════════════════════════════════════════════════════ */
  /*  RENDER                                               */
  /* ═════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
          <FiMessageSquare size={22} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${text}`}>Client Chat & Updates</h2>
          <p className={`text-sm ${textSub}`}>
            Real-time messaging with {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Main container ── */}
      <div className={`${bg} rounded-2xl ${border} border shadow-sm overflow-hidden flex`}
           style={{ height: 'calc(100vh - 260px)', minHeight: 480 }}>

        {/* ═══ LEFT: Contact List ═══ */}
        <div className={`${bgSub} ${border} border-r flex flex-col
                         ${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0`}>
          {/* search */}
          <div className="p-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg}`}>
              <FiSearch className={textSub} />
              <input
                type="text"
                placeholder="Search clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`bg-transparent outline-none text-sm w-full ${text}`}
              />
              {search && (
                <button onClick={() => setSearch('')} className={textSub}>
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>

          {/* contact list */}
          <div className="flex-1 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-full ${textSub}`}>
                <FiUsers size={36} className="mb-2 opacity-40" />
                <p className="text-sm">No clients found</p>
              </div>
            ) : (
              filteredClients.map((c) => {
                const unread = unreadMap[c.id] || 0;
                const isActive = selectedClient?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectClient(c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
                      ${isActive
                        ? isDarkMode
                          ? 'bg-violet-900/40 border-l-4 border-violet-400'
                          : 'bg-violet-50 border-l-4 border-violet-500'
                        : `border-l-4 border-transparent ${hover}`
                      }`}
                  >
                    {/* avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600
                                    flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {clientInitials(c)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${text}`}>{clientDisplayName(c)}</p>
                      {c.companyName && (
                        <p className={`text-xs truncate ${textSub}`}>{c.companyName}</p>
                      )}
                    </div>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full
                                       bg-violet-500 text-[10px] font-bold text-white px-1">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ═══ RIGHT: Chat Panel ═══ */}
        <div className={`flex flex-col flex-1
                         ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {!selectedClient ? (
            /* empty state */
            <div className={`flex flex-col items-center justify-center h-full ${textSub}`}>
              <FiMessageSquare size={52} className="mb-3 opacity-30" />
              <p className="text-lg font-medium">Select a client to start chatting</p>
              <p className="text-sm mt-1">Choose from your client list on the left</p>
            </div>
          ) : (
            <>
              {/* ── Chat header ── */}
              <div className={`flex items-center gap-3 px-4 py-3 ${bgSub} ${border} border-b`}>
                <button
                  className="md:hidden mr-1"
                  onClick={() => { setMobileShowChat(false); }}
                >
                  <FiChevronLeft size={20} className={text} />
                </button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600
                                flex items-center justify-center text-white text-xs font-bold">
                  {clientInitials(selectedClient)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${text}`}>
                    {clientDisplayName(selectedClient)}
                  </p>
                  {typing ? (
                    <p className="text-xs text-violet-500 animate-pulse">typing…</p>
                  ) : (
                    selectedClient.companyName && (
                      <p className={`text-xs truncate ${textSub}`}>{selectedClient.companyName}</p>
                    )
                  )}
                </div>
              </div>

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
                {messages.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full ${textSub}`}>
                    <FiMessageSquare size={36} className="opacity-25 mb-2" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      {/* date separator */}
                      <div className="flex items-center gap-2 my-3">
                        <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <span className={`text-[10px] font-medium px-2 ${textSub}`}>{date}</span>
                        <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      </div>

                      <AnimatePresence initial={false}>
                        {msgs.map((msg) => {
                          const isMine = msg.sender === userRef.current?.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                                  isMine
                                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-sm'
                                    : isDarkMode
                                      ? 'bg-[#322d4a] text-gray-100 rounded-bl-sm'
                                      : 'bg-[#ece8f8] text-gray-800 rounded-bl-sm'
                                }`}
                              >
                                {msg.type === 'document' ? (
                                  <div className="flex items-center gap-2">
                                    <FiFile size={18} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{msg.fileName || 'Document'}</p>
                                      {msg.fileSize && (
                                        <p className={`text-[10px] ${isMine ? 'text-violet-200' : textSub}`}>
                                          {(msg.fileSize / 1024).toFixed(1)} KB
                                        </p>
                                      )}
                                    </div>
                                    {msg.fileUrl && (
                                      <a
                                        href={msg.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`p-1 rounded ${isMine ? 'hover:bg-white/20' : hover}`}
                                      >
                                        <FiDownload size={16} />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                )}

                                {/* meta row */}
                                <div className={`flex items-center justify-end gap-1 mt-1
                                                 ${isMine ? 'text-violet-200' : textSub}`}>
                                  <FiClock size={10} />
                                  <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                                  {isMine && (
                                    msg.read
                                      ? <FiCheckCircle size={11} className="text-green-300" />
                                      : <FiCheck size={11} />
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Attached file preview ── */}
              {attachedFile && (
                <div className={`mx-4 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl ${inputBg} ${text} text-sm`}>
                  <FiFile size={16} className="text-violet-500 shrink-0" />
                  <span className="truncate flex-1">{attachedFile.name}</span>
                  <button onClick={() => { setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                    <FiX size={14} className={textSub} />
                  </button>
                </div>
              )}

              {/* ── Input bar ── */}
              <div className={`flex items-center gap-2 px-4 py-3 ${bgSub} ${border} border-t`}>
                <input
                  ref={fileInputRef}
                  id="kam-chat-file"
                  type="file"
                  accept={FILE_ACCEPT}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-xl ${hover} ${textSub} transition-colors`}
                  title="Attach file"
                >
                  <FiPaperclip size={18} />
                </button>

                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => { setNewMsg(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message…"
                  className={`flex-1 px-4 py-2 rounded-xl ${inputBg} outline-none text-sm ${text}
                              placeholder:${textSub} focus:ring-2 focus:ring-violet-400/40 transition`}
                />

                <button
                  onClick={handleSend}
                  disabled={!newMsg.trim() && !attachedFile}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white
                             shadow hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
