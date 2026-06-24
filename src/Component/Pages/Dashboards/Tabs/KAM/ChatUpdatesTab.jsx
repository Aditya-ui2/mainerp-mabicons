///chat updates

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
  FiMessageCircle,
  FiShield,
  FiActivity,
  FiLayout,
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

  /* ── premium design palette ── */
  const bg = isDarkMode ? 'bg-[#0f172a]' : 'bg-white';
  const bgSub = isDarkMode ? 'bg-slate-900/50' : 'bg-[#f8fbff]';
  const text = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const border = isDarkMode ? 'border-slate-800' : 'border-slate-100 shadow-sm';
  const inputBg = isDarkMode ? 'bg-slate-800/50' : 'bg-white border-slate-100 shadow-sm';
  const hover = isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-white hover:shadow-xl hover:shadow-blue-500/5';

  /* ═══════ SOCKET INIT ═══════ */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      userRef.current = jwtDecode(token);
    } catch (e) {
      console.error('Invalid token', e);
      return;
    }

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
      setSelectedClient((prev) => {
        if (prev && (msg.senderId === prev.id || msg.sender === prev.id)) {
          setMessages((m) => [...m, formatted]);
          markMessagesAsRead(prev.id, userRef.current.id).catch(() => { });
        } else {
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

        if (userRef.current) {
          await getUnreadMessageCount(userRef.current.id);
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

  /* ═══════ SELECT CLIENT ═══════ */
  const selectClient = useCallback(
    async (client) => {
      setSelectedClient(client);
      setMessages([]);
      setMobileShowChat(true);
      setTyping(false);
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

  const handleTyping = () => {
    if (selectedClient && socketRef.current?.connected) {
      socketRef.current.emit('typing', {
        userId: userRef.current.id,
        receiverId: selectedClient.id,
      });
    }
  };

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

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = formatDate(msg.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const clientDisplayName = (c) => c.clientName || c.name || c.companyName || c.email || 'Tactical Client';
  const clientInitials = (c) => {
    const n = clientDisplayName(c);
    return n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <div className="flex justify-between items-center text-left">
          <div className="space-y-3">
            <div className={`h-10 w-64 rounded-lg animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className={`h-5 w-48 rounded animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>
          <div className={`h-12 w-40 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
        </div>
        <div className={`h-[500px] rounded-[3rem] animate-pulse ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}></div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col h-full font-[Outfit] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
        <div className="flex items-center gap-4 text-left">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] shadow-xl shadow-blue-500/20">
            <FiMessageCircle className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-3xl lg:text-4xl font-black text-[#1E88E5] tracking-tight mb-1">
              Client Chat & Updates
            </h2>
            <div className="flex items-center gap-2 text-slate-600 font-bold text-left">
              <span className="text-sm">
                Real-Time Messaging • {clients.length} Active Accounts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className={`flex flex-1 rounded-[3.5rem] border-2 shadow-2xl overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-blue-500/5' : 'bg-white border-slate-50 shadow-blue-500/10'}`}
        style={{ height: 'calc(100vh - 350px)', minHeight: 600 }}>

        {/* Left: Premium Client Registry */}
        <div className={`${bgSub} border-r-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-50'} flex flex-col 
                         ${mobileShowChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-[350px] shrink-0`}>

          <div className="p-8">
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-black text-[#1E88E5] ml-2 text-left">Intelligence Registry</h3>
              <div className="relative group">
                <FiSearch className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} group-focus-within:text-blue-500`} />
                <input
                  type="text"
                  placeholder="Scan Accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full rounded-2xl border-2 px-6 py-4 pl-14 transition-all outline-none font-bold text-xs ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3 custom-scrollbar">
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-50">
                <FiUsers className="w-12 h-12" />
                <p className="text-sm font-black uppercase tracking-widest">No Clients Found</p>
              </div>
            ) : (
              filteredClients.map((c) => {
                const unread = unreadMap[c.id] || 0;
                const isActive = selectedClient?.id === c.id;
                return (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectClient(c)}
                    className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-300 text-left relative overflow-hidden group
                      ${isActive
                        ? isDarkMode
                          ? 'bg-blue-900/30 border-2 border-blue-500/50 shadow-xl shadow-blue-500/10'
                          : 'bg-blue-50 border-2 border-blue-500/20 shadow-xl shadow-blue-500/5'
                        : `border-2 border-transparent ${hover}`
                      }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white text-base font-black shadow-lg">
                        {clientInitials(c)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-black truncate leading-none capitalize mb-1.5 ${isActive ? 'text-[#1E88E5]' : text}`}>
                        {clientDisplayName(c)}
                      </p>
                      <p className={`text-[10px] font-bold truncate tracking-wide ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                        {c.companyName || 'Corporate Entity'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-rose-700 text-[10px] font-black text-white px-1.5 shadow-lg shadow-rose-500/30 border-2 border-white dark:border-slate-900">
                        {unread}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Tactical Message Hub */}
        <div className={`flex flex-col flex-1 relative ${!mobileShowChat ? 'hidden lg:flex' : 'flex'}`}>
          {!selectedClient ? (
            <div className="flex flex-col items-center justify-center h-full p-20 text-center">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-[#3FA9F5] to-[#0D47A1] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 mb-10 opacity-10 blur-sm absolute scale-150">
                <FiMessageSquare className="w-20 h-20" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#1E88E5] shadow-xl mb-6">
                  <FiLayout className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Select Communication Hub</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed capitalize">Choose a verified client from the strategy registry to initiate a secure tactical dispatch.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header Pad */}
              <div className={`flex items-center gap-4 px-8 py-6 border-b-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-[#f8fbff]'}`}>
                <motion.button
                  whileHover={{ x: -2 }}
                  className="lg:hidden p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700"
                  onClick={() => setMobileShowChat(false)}
                >
                  <FiChevronLeft size={20} className={text} />
                </motion.button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] flex items-center justify-center text-white text-base font-black shadow-xl">
                    {clientInitials(selectedClient)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-xl font-black tracking-tight capitalize ${text}`}>
                    {clientDisplayName(selectedClient)}
                  </p>
                  {typing ? (
                    <p className="text-[11px] font-black text-blue-500 tracking-widest uppercase animate-pulse">Tactical Node Typing...</p>
                  ) : (
                    <p className={`text-[10px] font-bold uppercase tracking-widest text-slate-400`}>Direct Communication Protocol Active</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full font-black text-[10px] border-2 uppercase tracking-widest ${isDarkMode ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    Active Node
                  </div>
                </div>
              </div>

              {/* Message Arena */}
              <div className="flex-1 overflow-y-auto px-8 py-10 space-y-2 custom-scrollbar bg-pattern-subtle">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4 opacity-40">
                    <FiMessageCircle className="w-14 h-14" />
                    <p className="text-xs font-black uppercase tracking-[0.3em]">No Transmission Records</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="flex items-center gap-6 my-10 font-[Outfit]">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 bg-white dark:bg-slate-900 rounded-full py-1 border border-slate-100 dark:border-slate-800">{date}</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                      </div>

                      <AnimatePresence initial={false}>
                        {msgs.map((msg) => {
                          const isMine = msg.sender === userRef.current?.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-6`}
                            >
                              <div className={`max-w-[70%] group flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <div className={`relative px-6 py-4 rounded-[1.75rem] shadow-xl ${isMine
                                  ? 'bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white rounded-tr-[0.5rem] shadow-blue-500/20'
                                  : isDarkMode
                                    ? 'bg-slate-800 text-white rounded-tl-[0.5rem] border border-slate-700 shadow-black/20'
                                    : 'bg-white text-slate-800 rounded-tl-[0.5rem] border border-slate-100 shadow-blue-500/5'
                                  }`}>
                                  {msg.type === 'document' ? (
                                    <div className="flex items-center gap-4 min-w-[200px]">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                                        <FiFile className={`w-6 h-6 ${isMine ? 'text-white' : 'text-blue-500'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-black truncate capitalize">{msg.fileName || 'Tactical Asset'}</p>
                                        <p className={`text-[10px] font-bold mt-0.5 ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                                          {(msg.fileSize / 1024).toFixed(1)} KB Registry
                                        </p>
                                      </div>
                                      {msg.fileUrl && (
                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                          className={`p-3 rounded-xl transition-all ${isMine ? 'bg-white/10 hover:bg-white/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                          <FiDownload className={`w-5 h-5 ${isMine ? 'text-white' : 'text-[#1E88E5]'}`} />
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm font-bold whitespace-pre-wrap break-words leading-relaxed capitalize">{msg.content}</p>
                                  )}
                                </div>
                                <div className={`flex items-center gap-2 mt-2 px-1 text-[10px] font-black uppercase tracking-widest ${isMine ? 'text-blue-400 shadow-none' : 'text-slate-400'}`}>
                                  <FiClock className="w-3 h-3" />
                                  {formatTime(msg.timestamp)}
                                  {isMine && (
                                    msg.read
                                      ? <FiCheckCircle size={12} className="text-emerald-500" />
                                      : <FiCheck size={12} className="text-blue-300" />
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

              {/* Tactical Dispatch Hub */}
              <div className={`px-8 py-6 border-t-2 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-white'}`}>
                {attachedFile && (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className={`mb-4 flex items-center justify-between px-6 py-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-blue-500/30' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FiFile className="text-[#1E88E5] shrink-0 w-5 h-5" />
                      <span className="text-sm font-black truncate capitalize">{attachedFile.name}</span>
                    </div>
                    <button onClick={() => { setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="p-1 rounded-full hover:bg-white/50 text-rose-500">
                      <FiX size={18} />
                    </button>
                  </motion.div>
                )}

                <div className="flex items-center gap-4">
                  <input ref={fileInputRef} id="kam-chat-file" type="file" accept={FILE_ACCEPT} className="hidden" onChange={handleFileChange} />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-2xl transition-all border-2 ${isDarkMode ? 'border-slate-700 bg-slate-800 hover:border-blue-500 text-slate-400' : 'border-slate-100 bg-slate-50 hover:border-blue-500 text-slate-400 hover:text-blue-500'}`}
                  >
                    <FiPaperclip className="w-6 h-6" />
                  </motion.button>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={(e) => { setNewMsg(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Dispatch tactical update..."
                      className={`w-full rounded-[1.5rem] border-2 px-8 py-4 transition-all outline-none font-bold text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!newMsg.trim() && !attachedFile}
                    className="p-4 rounded-[1.5rem] bg-gradient-to-br from-[#3FA9F5] via-[#1E88E5] to-[#0D47A1] text-white shadow-2xl shadow-blue-500/40 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                    <FiSend className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}