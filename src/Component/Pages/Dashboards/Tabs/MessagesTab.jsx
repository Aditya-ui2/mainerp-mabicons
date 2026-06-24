import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSend, FiPaperclip, FiChevronDown, FiX } from 'react-icons/fi';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { getChatHistory, markMessagesAsRead, getUnreadMessageCount, getClientsForTeamLeader } from '../../../Pages/service/api';
import { BASE_URL } from '../../../Pages/service/api';
import { DocumentIcon } from '@heroicons/react/24/solid';

const MessagesTab = ({ isDarkMode }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  
  const userInfo = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return jwtDecode(token);
  }, []);

  // Fetch chat history when a client is selected
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!userInfo?.id || !selectedClient?.id) return;
      
      try {
        console.log('Fetching chat history for:', userInfo.id, selectedClient.id);
        const response = await getChatHistory(userInfo.id, selectedClient.id);
        console.log('Chat history:', response);
        
        // Transform the chat history into the message format
        const formattedMessages = response.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          time: new Date(msg.createdAt),
          isUser: msg.sender === userInfo.id,
          type: msg.messageType,
          content: msg.content,
          senderType: msg.senderType,
          receiverType: msg.receiverType,
          read: msg.read,
          avatar: getInitials(msg.sender === userInfo.id ? userInfo.name : selectedClient.name),
          // Add document properties if it's a document message
          ...(msg.messageType === 'document' && msg.document ? {
            fileName: msg.document.fileName,
            fileSize: msg.document.fileSize,
            fileType: msg.document.fileType,
            fileUrl: msg.document.webViewLink
          } : {})
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    fetchChatHistory();
  }, [selectedClient, userInfo]);

  // Single useEffect for initialization with proper cleanup
  useEffect(() => {
    let mounted = true;
    
    if (!userInfo) return;

    const initializeChat = async () => {
      try {
        if (!socketRef.current) {
          socketRef.current = io(BASE_URL, {
            transports: ['websocket'],
            auth: { token: localStorage.getItem('token') }
          });

          // Socket connection handlers
          socketRef.current.on('connect', () => {
            console.log('Socket connected successfully!');
            socketRef.current.emit('user_connected', {
              userId: userInfo.id,
              userType: userInfo.role,
              name: userInfo.name
            });
          });

          // Update the receive_message handler
          socketRef.current.on('receive_message', (message) => {
            console.log('Received message:', message);
            if (mounted && message) {
              const newMessage = {
                id: message._id,
                sender: message.sender,
                time: new Date(message.createdAt),
                isUser: message.sender === userInfo.id,
                type: message.messageType,
                content: message.content,
                senderType: message.senderType,
                receiverType: message.receiverType,
                read: message.read,
                avatar: getInitials(message.sender === userInfo.id ? userInfo.name : selectedClient?.name)
              };

              // Add document-specific properties
              if (message.messageType === 'document' && message.document) {
                newMessage.fileName = message.document.fileName;
                newMessage.fileSize = message.document.fileSize;
                newMessage.fileType = message.document.fileType;
                newMessage.fileUrl = message.document.webViewLink;
              }

              setMessages(prev => [...prev, newMessage]);
            }
          });

          // Listen for client connection status (optional)
          socketRef.current.on('client_connected', (data) => {
            console.log('Client connected:', data);
            // You could update UI to show client is online
          });

          socketRef.current.on('client_disconnected', (data) => {
            console.log('Client disconnected:', data);
            // You could update UI to show client is offline
          });
        }

        // Initial clients fetch - only if we don't have clients
        if (clients.length === 0) {
          const payload = { teamLeaderId: userInfo.id };
          const response = await getClientsForTeamLeader(payload);
          
          if (mounted) {
            const transformedClients = response.clients.map(client => ({
              id: client._id || '',
              name: client.name || 'Unknown',
              avatar: getInitials(client.name),
              type: 'Client'
            }));

            setClients(transformedClients);
            if (transformedClients.length > 0 && !selectedClient) {
              setSelectedClient(transformedClients[0]);
            }
          }
        }
      } catch (error) {
        console.error('Chat initialization error:', error);
      }
    };

    initializeChat();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.off('receive_message');
        socketRef.current.off('client_connected');
        socketRef.current.off('client_disconnected');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userInfo, selectedClient]);

  // Handle sending message
  const handleSendMessage = () => {
    if ((!newMessage.trim() && !attachedFile) || !selectedClient || !userInfo) return;

    try {
      if (attachedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          const messageData = {
            senderId: userInfo.id,
            senderType: userInfo.role,
            receiverId: selectedClient.id,
            receiverType: 'Client',
            messageType: 'document',
            file: {
              buffer: reader.result,
              originalname: attachedFile.name,
              mimetype: attachedFile.type,
              size: attachedFile.size
            }
          };

          // Add optimistic update immediately
          const optimisticMessage = {
            id: Date.now(),
            sender: userInfo.id,
            time: new Date(),
            isUser: true,
            type: 'document',
            fileName: attachedFile.name,
            fileSize: attachedFile.size,
            fileType: attachedFile.type,
            avatar: getInitials(userInfo.name),
            content: '', // Add empty content for consistency
            senderType: userInfo.role,
            receiverType: 'Client',
            read: false
          };

          // Update UI immediately
          setMessages(prev => [...prev, optimisticMessage]);

          // Clear file input and state
          setAttachedFile(null);

          // Emit socket event
          socketRef.current.emit('private_message', messageData, (response) => {
            if (response.error) {
              console.error('Error sending file:', response.error);
              // Remove the optimistic message if there was an error
              setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
              return;
            }

            // Update the optimistic message with the real data
            setMessages(prev => prev.map(msg => 
              msg.id === optimisticMessage.id 
                ? {
                    ...msg,
                    id: response._id,
                    fileUrl: response.document?.webViewLink,
                    fileName: response.document?.fileName,
                    fileSize: response.document?.fileSize,
                    fileType: response.document?.fileType
                  }
                : msg
            ));
          });
        };

        reader.readAsArrayBuffer(attachedFile);
      } else {
        // Text message format
        const messageData = {
          senderId: userInfo.id,
          senderType: userInfo.role,
          receiverId: selectedClient.id,
          receiverType: 'Client',
          messageType: 'text',
          content: newMessage.trim()
        };

        socketRef.current.emit('private_message', messageData);
        
        // Add text message to local state
        setMessages(prev => [...prev, {
          sender: userInfo.id,
          content: newMessage,
          time: new Date(),
          isUser: true,
          type: 'text',
          avatar: getInitials(userInfo.name)
        }]);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Helper function for initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0] || '')
      .join('')
      .toUpperCase() || '?';
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    setIsDropdownOpen(false);
    
    // Mark messages as read when selecting a client
    try {
      await markMessagesAsRead(client.id, userInfo.id);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Add handleTyping function
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
  };

  // Add file handling functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add file validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size should not exceed 5MB');
        return;
      }

      // Add file type validation
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'application/zip',
        'application/x-zip-compressed'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Please upload PDF, DOC, DOCX, JPG, PNG, or ZIP files.');
        return;
      }

      setAttachedFile(file);
    }
  };

  // Update message rendering to handle documents
  const renderMessage = (message) => {
    if (message.type === 'document') {
      return (
        <div className={`flex items-center gap-3 p-3 rounded-lg 
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <a 
            href={message.fileUrl || message.document?.webViewLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 flex-grow hover:bg-opacity-80 
              transition-all duration-200 cursor-pointer"
          >
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-600' : 'bg-blue-50'
            }`}>
              <DocumentIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-grow">
              <p className={`text-sm font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } hover:underline`}>
                {message.fileName || message.document?.fileName}
              </p>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {((message.fileSize || message.document?.fileSize) / 1024).toFixed(2)} KB
              </p>
            </div>
          </a>
        </div>
      );
    }

    // Regular text message rendering
    return (
      <p className={`text-sm ${
        isDarkMode ? 'text-gray-100' : message.isUser ? 'text-white' : 'text-gray-800'
      }`}>
        {message.content}
      </p>
    );
  };

  // Rest of your JSX remains mostly the same, but update the input handling:
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8 h-full"
    >
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 
        ${isDarkMode ? 'border border-gray-700' : 'border border-gray-100'}
        flex flex-col h-[calc(100vh-200px)]`}>
        
        {/* Header with Client Selector */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FiMessageSquare className={`${isDarkMode ? 'text-purple-400' : 'text-purple-500'} text-2xl`} />
            <h2 className="text-2xl font-bold">Messages</h2>
          </div>
          
          {/* Client Selector Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg
                ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                transition-colors duration-200`}
            >
              <div className={`w-8 h-8 rounded-full 
                ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-purple-400 to-purple-600'}
                flex items-center justify-center text-white text-sm font-bold`}>
                {selectedClient?.avatar || '?'}
              </div>
              <span>{selectedClient?.name || 'Select Client'}</span>
              <FiChevronDown className={`transform transition-transform duration-200 
                ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-full min-w-[200px] rounded-lg shadow-lg 
                ${isDarkMode ? 'bg-gray-700' : 'bg-white'} 
                border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                style={{ zIndex: 1000 }}
              >
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-left
                      ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}
                      ${selectedClient?.id === client.id ? 
                        (isDarkMode ? 'bg-gray-600' : 'bg-gray-100') : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full z-50
                      ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-purple-400 to-purple-600'}
                      flex items-center justify-center text-white text-sm font-bold`}>
                      {client.avatar}
                    </div>
                    <span>{client.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Messages Container */}
        <div className="flex-grow overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={message.id}
              className={`flex items-start gap-4 ${message.isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full 
                ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-purple-400 to-purple-600'} 
                flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {message.avatar || '?'}
              </div>
              
              <div className={`max-w-[70%] ${message.isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.isUser
                    ? isDarkMode 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700' 
                      : 'bg-gray-100'
                } ${message.isUser ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                  {renderMessage(message)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${
                    message.isUser ? 'text-right' : 'text-left'
                  }`}>
                    {message.time.toLocaleString()}
                  </span>
                  {/* Optional: Show read status */}
                  {message.isUser && (
                    <span className={`text-xs ${message.read ? 'text-blue-500' : 'text-gray-400'}`}>
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className={`flex flex-col gap-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg
          ${isDarkMode ? 'border border-gray-600' : 'border border-gray-200'}`}>
          {attachedFile && (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
            }`}>
              <DocumentIcon className="h-5 w-5 text-blue-500" />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {attachedFile.name}
              </span>
              <button
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-gray-700 rounded-full"
              >
                <FiX className="text-gray-400 hover:text-gray-200" />
              </button>
            </div>
          )}
          
          <div className="flex gap-4">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={attachedFile ? "Add a message or send file" : "Type your message..."}
              className={`flex-grow px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-600 text-white placeholder-gray-400' : 'bg-white text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200`}
            />
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            />
            <button 
              onClick={() => document.getElementById('file-upload').click()}
              className="p-2 text-purple-500 hover:text-purple-600 transition-colors duration-200
                hover:bg-purple-100 rounded-lg">
              <FiPaperclip size={20} />
            </button>
            
            <button 
              onClick={handleSendMessage}
              className={`px-6 py-2 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'} 
                text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-all duration-200
                hover:shadow-md transform hover:-translate-y-0.5`}>
              <FiSend />
              Send
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessagesTab;
