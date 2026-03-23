import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMessageCircle, FiUser } from 'react-icons/fi';
import { getChatMessages, sendChatMessage } from '../../../service/api';

const TeamChatTab = ({ department }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.id || decoded.userId || '');
        const raw = decoded.name || decoded.email?.split('@')[0] || '';
        setCurrentUserName(raw.replace(/\s*\(.*?\)\s*$/, '').trim());
      }
    } catch { /* ignore */ }
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [department]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await getChatMessages(department);
      setMessages(res.data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      await sendChatMessage({ department, message: text.trim() });
      setText('');
      fetchMessages();
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="p-2.5 rounded-xl" style={{ background: '#ede9fe' }}>
          <FiMessageCircle style={{ width: '22px', height: '22px', color: '#6366f1' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Chat</h2>
          <p className="text-xs text-gray-500">{department} Department</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <FiMessageCircle style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto' }} />
            <p className="text-gray-400 mt-3 font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            const color = getAvatarColor(msg.senderName);
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: color }}
                  >
                    {getInitials(msg.senderName)}
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                  {!isMe && (
                    <p className="text-xs font-medium mb-1" style={{ color }}>{msg.senderName}</p>
                  )}
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={isMe
                      ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderBottomRightRadius: '4px' }
                      : { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {msg.message}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-3 rounded-xl text-white transition-all"
          style={{ background: text.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#d1d5db' }}
        >
          <FiSend style={{ width: '20px', height: '20px' }} />
        </button>
      </form>
    </div>
  );
};

export default TeamChatTab;
