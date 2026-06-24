import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Input, Button, Avatar, Chip, Dialog , DialogHeader, DialogBody, DialogFooter } from "@material-tailwind/react";
import { 
  PaperAirplaneIcon, 
  ChatBubbleLeftIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckIcon,
  PaperClipIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/solid";
import { requestTask, getChatHistory, getClientDetails } from '../Component/Pages/service/api';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import { BASE_URL } from '../Component/Pages/service/api';
import { motion } from 'framer-motion';

const ChatWindow = ({ 
  uploadedDocuments, 
  onTaskRequest, 
  isRequestingTask, 
  taskRequestError 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();
  const userInfo = useRef(null);
  const [teamLeaderId, setTeamLeaderId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: '',
    dueDate: new Date().toISOString().slice(0, 16) // Format: "YYYY-MM-DDThh:mm"
  });

  const [validationError, setValidationError] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [showSuccessTooltip, setShowSuccessTooltip] = useState(false);

  // Optional: Add useEffect to detect system dark mode preference
  useEffect(() => {
    // Check if user prefers dark mode
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    // Optional: Listen for changes in system dark mode preference
    const handler = (e) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handler);

    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  // Initialize socket connection and fetch chat history
  useEffect(() => {
    const initializeChat = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      userInfo.current = jwtDecode(token);
      console.log('Decoded user info:', userInfo.current);

      // First fetch client details to get team leader ID
      try {
        const response = await getClientDetails(userInfo.current.id);
        console.log('Client details response:', response);
        
        // Extract teamLeader ID from the nested response
        if (response.success && response.data.teamLeader?._id) {
          const teamLeaderId = response.data.teamLeader._id;
          setTeamLeaderId(teamLeaderId);
          console.log('Team Leader ID:', teamLeaderId);

          // Initialize socket after getting team leader ID
          socketRef.current = io(BASE_URL, {
            transports: ['websocket'],
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
          });

          // Socket event listeners
          socketRef.current.on('connect', () => {
            console.log('Socket connected successfully');
            socketRef.current.emit('user_connected', {
              userId: userInfo.current.id,
              userType: userInfo.current.role || 'client',
              teamLeaderId: teamLeaderId
            });
          });

          socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
          });

          socketRef.current.on('receive_message', (message) => {
            console.log('Received socket message:', message);
            if (message) {
              const newMessage = {
                id: message._id || Date.now(),
                sender: message.sender,
                timestamp: new Date(message.createdAt || Date.now()),
                type: message.messageType,
                isUser: message.sender === userInfo.current?.id,
                avatar: '?',
                content: message.messageType === 'text' ? message.content : null,
                ...(message.messageType === 'document' ? {
                  fileName: message.document?.fileName || 'Document',
                  fileSize: message.document?.fileSize || 0,
                  fileType: message.document?.fileType,
                  fileUrl: message.document?.webViewLink,
                } : {}),
                senderType: message.senderType,
                receiverType: message.receiverType,
                read: false
              };

              setMessages(prev => [...prev, newMessage]);
            }
          });

          // Fetch chat history
          const chatHistory = await getChatHistory(userInfo.current.id, teamLeaderId);
          console.log('Chat history:', chatHistory);

          if (Array.isArray(chatHistory)) {
            const formattedMessages = chatHistory.map(msg => ({
              id: msg._id,
              sender: msg.sender,
              timestamp: new Date(msg.createdAt),
              type: msg.messageType,
              // Handle document messages
              ...(msg.messageType === 'document' && msg.document ? {
                fileName: msg.document.fileName,
                fileSize: msg.document.fileSize,
                fileType: msg.document.fileType,
                fileUrl: msg.document.webViewLink,
              } : {
                // Handle text messages
                content: msg.content
              }),
              // Add other necessary properties
              senderType: msg.senderType,
              receiverType: msg.receiverType,
              read: msg.read
            }));
            setMessages(formattedMessages);
          }
        } else {
          console.error('No team leader found in client details:', response);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('receive_message');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Add this useEffect near your other useEffect hooks
  useEffect(() => {
    if (showSuccessTooltip) {
      const timer = setTimeout(() => {
        setShowSuccessTooltip(false);
      }, 3000);

      // Cleanup the timer
      return () => clearTimeout(timer);
    }
  }, [showSuccessTooltip]);

  const handleSend = async () => {
    if ((!message.trim() && !attachedFile) || !userInfo.current || !teamLeaderId) return;
    if (!socketRef.current?.connected) return;

    if (attachedFile) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const messageData = {
            senderId: userInfo.current.id,
            senderType: userInfo.current.role || 'client',
            receiverId: teamLeaderId,
            receiverType: 'TeamLeader',
            messageType: 'document',
            file: {
              buffer: reader.result,
              originalname: attachedFile.name,
              mimetype: attachedFile.type,
              size: attachedFile.size
            }
          };

          // Add optimistic update
          const optimisticMessage = {
            id: Date.now(),
            sender: userInfo.current.id,
            timestamp: new Date(),
            type: 'document',
            fileName: attachedFile.name,
            fileSize: attachedFile.size,
            fileType: attachedFile.type,
            senderType: userInfo.current.role || 'client',
            receiverType: 'TeamLeader',
            read: false,
            isUser: true,
            avatar: '?'
          };

          // Update UI immediately
          setMessages(prev => [...prev, optimisticMessage]);

          // Clear file input and state
          const fileInput = document.getElementById('file-upload');
          if (fileInput) fileInput.value = '';
          setAttachedFile(null);

          // Emit socket event
          socketRef.current.emit('private_message', messageData, (response) => {
            if (response.error) {
              console.error('Error sending file:', response.error);
              // Optionally remove the optimistic message if there was an error
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
      } catch (error) {
        console.error('Error sending document:', error);
      }
      return;
    }

    // Regular text message handling
    const messageData = {
      senderId: userInfo.current.id,
      senderType: userInfo.current.role || 'client',
      receiverId: teamLeaderId,
      receiverType: 'TeamLeader',
      messageType: 'text',
      content: message,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', messageData);

    try {
      socketRef.current.emit('private_message', messageData);

      // Update the optimistic message format to match received messages
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: message,
        sender: userInfo.current.id,
        timestamp: new Date(),
        type: 'text',
        isUser: true,
        avatar: '?',
        senderType: userInfo.current.role || 'client',
        receiverType: 'TeamLeader',
        read: false
      }]);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Validate required fields
    if (!taskDetails.title || !taskDetails.description || !userInfo.current || !taskDetails.category) {
      setValidationError('Title, description, client ID, and category are required.');
      return;
    }

    try {
      const taskPayload = {
        title: taskDetails.title,
        description: taskDetails.description,
        clientId: userInfo.current.id,
        category: taskDetails.category,
        priority: taskDetails.priority,
        ...(taskDetails.category === 'Deadline' 
          ? { dueDate: new Date(taskDetails.dueDate).toISOString() }
          : {}
        )
      };

      const response = await requestTask(taskPayload);
      console.log('Task requested successfully:', response);
      
      // First, close the modal
      setShowTaskForm(false);
      
      // Then show the success toast
      setShowSuccessTooltip(true);
      
      // Call the onTaskRequest callback
      onTaskRequest(taskDetails);
      
      // Reset the form
      setTaskDetails({
        title: '',
        description: '',
        priority: 'Medium',
        category: '',
        dueDate: new Date().toISOString().slice(0, 16) // Format: "YYYY-MM-DDThh:mm"
      });

      // Hide the toast after 3 seconds
      setTimeout(() => {
        setShowSuccessTooltip(false);
      }, 3000);

    } catch (error) {
      console.error('Error requesting task:', error);
      setValidationError(error.message || 'Failed to create task');
    }
  };

  const handleTaskResponse = (taskId, status) => {
    setMessages(messages.map(msg => 
      msg.id === taskId ? { ...msg, status } : msg
    ));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add file validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size should not exceed 5MB');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Add file type validation
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'application/zip',  // Added ZIP support
        'application/x-zip-compressed'  // Added alternative ZIP MIME type
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported. Please upload PDF, DOC, DOCX, JPG, PNG, or ZIP files.');
        e.target.value = ''; // Clear the file input
        return;
      }

      setAttachedFile(file);
    }
  };

  // Add this useEffect to scroll to bottom when messages update
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Card className="p-4 h-[600px] flex flex-col bg-white dark:bg-gray-900 shadow-xl">
        {/* Chat Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <ChatBubbleLeftIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <Typography variant="h6" className="font-bold dark:text-white">
               Chat With Mabicons
            </Typography>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-grow overflow-auto mb-4 space-y-4 messages-container scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 pr-2">
          {messages.map((message, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={message.id}
              className={`flex items-start gap-4 ${message.sender === userInfo.current?.id ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full 
                ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-purple-400 to-purple-600'} 
                flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {message.avatar || '?'}
              </div>
              
              <div className={`max-w-[70%] ${message.sender === userInfo.current?.id ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender === userInfo.current?.id
                    ? isDarkMode 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                } ${message.sender === userInfo.current?.id ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                  {message.type === 'document' ? (
                    <div className={`flex items-center gap-3 p-3 rounded-lg 
                      ${isDarkMode ? 'bg-opacity-50' : 'bg-opacity-75'}`}
                    >
                      <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full hover:bg-opacity-80 
                          transition-all duration-200 cursor-pointer"
                      >
                        <div className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-gray-600' : 'bg-blue-50'
                        }`}>
                          <DocumentIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {message.fileName || 'Document'}
                          </p>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {((message.fileSize || 0) / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <Typography className={`text-sm ${
                      message.sender === userInfo.current?.id
                        ? 'text-white'
                        : isDarkMode 
                          ? 'text-white' 
                          : 'text-gray-900'
                    }`}>
                      {message.content}
                    </Typography>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${
                    message.sender === userInfo.current?.id ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                  {message.sender === userInfo.current?.id && (
                    <span className={`text-xs ${message.read ? 'text-blue-500' : 'text-gray-400'}`}>
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
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
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {/* File Upload Button with Tooltip */}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            />
            <div className="relative group">
              <Button
                variant="text"
                size="sm"
                className="p-1.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <PaperClipIcon className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  Attach File
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-gray-800 rotate-45 transform origin-top"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Request Button with Tooltip */}
            <div className="relative group">
              <Button
                variant="text"
                size="sm"
                className="p-1.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowTaskForm(true)}
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  Request Task
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-gray-800 rotate-45 transform origin-top"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Message Input and Send Button */}
            <div className="flex-grow relative flex items-center gap-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Send a message to Mabicons..."
                className="w-full px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 
                  border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white 
                  placeholder-gray-400 dark:placeholder-gray-500"
              />
              <Button
                size="sm"
                variant="text"
                className="!absolute right-1 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleSend}
              >
                <PaperAirplaneIcon className="h-4 w-4 text-blue-500" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Request Form Dialog */}
      <Dialog 
        open={showTaskForm} 
        handler={() => setShowTaskForm(false)}
        className="min-w-[350px] dark:bg-gray-800"
      >
        <DialogHeader className="dark:text-white border-b dark:border-gray-700">
          Request New Task
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              value={taskDetails.title}
              onChange={(e) => setTaskDetails(prev => ({...prev, title: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
                transition-all duration-200"
              required
            />
            <textarea
              placeholder="Task Description"
              value={taskDetails.description}
              onChange={(e) => setTaskDetails(prev => ({...prev, description: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
                transition-all duration-200 min-h-[100px]"
              required
            />
            <select
              value={taskDetails.category}
              onChange={(e) => setTaskDetails(prev => ({...prev, category: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                transition-all duration-200"
              required
            >
              <option value="" className="dark:bg-gray-700">Select Category</option>
              <option value="Deadline" className="dark:bg-gray-700">Deadline-Based</option>
            </select>

            <select
              value={taskDetails.priority}
              onChange={(e) => setTaskDetails(prev => ({...prev, priority: e.target.value}))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                transition-all duration-200"
            >
              <option value="Low" className="dark:bg-gray-700">Low</option>
              <option value="Medium" className="dark:bg-gray-700">Medium</option>
              <option value="High" className="dark:bg-gray-700">High</option>
            </select>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={taskDetails.dueDate}
                onChange={(e) => setTaskDetails(prev => ({...prev, dueDate: e.target.value}))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  transition-all duration-200"
                required
              />
            </div>
          </form>
          {taskRequestError && (
            <p className="text-red-500 mt-2">{taskRequestError}</p>
          )}
        </DialogBody>
        <DialogFooter className="border-t dark:border-gray-700">
          <Button
            variant="text"
            onClick={() => setShowTaskForm(false)}
            className="mr-2 dark:text-gray-300 hover:dark:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleTaskSubmit}
            disabled={isRequestingTask}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isRequestingTask ? 'Requesting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Success Toast */}
      {showSuccessTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
        >
          <CheckIcon className="h-5 w-5" />
          <span>Task request submitted successfully!</span>
        </motion.div>
      )}
    </>
  );
};

export default ChatWindow;





