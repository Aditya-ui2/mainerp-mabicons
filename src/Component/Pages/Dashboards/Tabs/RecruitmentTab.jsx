import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiUser, FiBriefcase, FiCalendar, FiFileText, FiUsers, FiTag, FiSend, FiFilter, FiPieChart, FiClock, FiZap, FiMail, FiXCircle } from 'react-icons/fi';
import { getRecruitmentRequests, uploadResumes, generateMeetLink, closeRecruitmentRequest, createRecruitmentPosition, getAllClients } from "../../../Pages/service/api";
import { jwtDecode } from "jwt-decode";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getLocalISODate, toLocalISODate } from '../../Utilities/dateUtils';

const RecruitmentTab = ({ isDarkMode }) => {
  const navigate = useNavigate(); // Move this to the top with other hooks
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recruitmentRequests, setRecruitmentRequests] = useState([]);
  const [sentCVs, setSentCVs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [clientFilters, setClientFilters] = useState({
    requests: '',
    shortlisted: '',
    sentCVs: '',
    sentCVStatus: ''
  });
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Add pagination states for each section
  const [pagination, setPagination] = useState({
    requests: { currentPage: 1, itemsPerPage: 5 },
    shortlisted: { currentPage: 1, itemsPerPage: 5 },
    sentCVs: { currentPage: 1, itemsPerPage: 5 }
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Add these new state variables at the top of your component
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [emailOption, setEmailOption] = useState('client'); // 'client' or 'both'

  // Add new state for meeting link loading
  const [isMeetingLinkLoading, setIsMeetingLinkLoading] = useState(false);

  // Add state for Create Request Modal
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [clients, setClients] = useState([]);
  const [newRequestData, setNewRequestData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    salary: '',
    priority: 'Medium',
    openings: 1,
    skills: '',
    experience: '',
    clientId: '',
    deadline: ''
  });

  // Add this near the top of the component where other state variables are defined
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedRequestToClose, setSelectedRequestToClose] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Add state for closed requests
  const [closedRequests, setClosedRequests] = useState([]);

  // Add new state for password protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const tabData = [
    {
      label: "Overview",
      value: "overview",
      icon: FiPieChart,
    },
    {
      label: "Recruitment Requests",
      value: "requests",
      icon: FiBriefcase,
    },
    {
      label: "Screened CVs Sent to Client",
      value: "sent-cvs",
      icon: FiSend,
    },
    {
      label: "CVs Shortlisted by Client",
      value: "shortlisted",
      icon: FiUsers,
    },
    {
      label: "Closed Requests",
      value: "closed",
      icon: FiXCircle,
    }
  ];

  // Add this helper function at the top of your file
  const formatInterviewTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      return isoString; // Return original string if parsing fails
    }
  };

  // Keep only the first useEffect where we process the API response
  useEffect(() => {
    const fetchRecruitmentRequests = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const teamLeaderId = decoded.id;
        
        const response = await getRecruitmentRequests(teamLeaderId);
        
        // Separate active and closed requests
        const active = response.requests.filter(req => req.status !== "Closed");
        const closed = response.requests.filter(req => req.status === "Closed");
        
        setRecruitmentRequests(active);
        setClosedRequests(closed);

        // Process shortlisted candidates
        const allShortlisted = active.flatMap(request => 
          (request.shortlisted || []).map(candidate => ({
            id: candidate.id,
            recruitmentId: request.id,
            name: candidate.originalName.split('.')[0],
            clientId: request.clientId,
            clientName: request.name,
            experience: request.experience,
            reason: candidate.reason,
            status: 'Shortlisted',
            webViewLink: candidate.webViewLink,
            fileId: candidate.fileId,
            interviewTime: candidate.interviewTime,
            isInterviewScheduled: candidate.isInterviewScheduled,
            meetLink: candidate.meetLink, // Add this line
            clientEmail: request.email || '',
          }))
        );
        
        console.log('Processed shortlisted:', allShortlisted);
        setShortlistedCandidates(allShortlisted);

        try {
          const clientsRes = await getAllClients();
          const clientsData = clientsRes.data?.clients || clientsRes.clients || (Array.isArray(clientsRes) ? clientsRes : []);
          setClients(clientsData);
        } catch (clientErr) {
          console.error('Error fetching clients:', clientErr);
        }

        // Process accepted requests and their CVs
        const acceptedRequests = active.filter(req => req.status === "Accepted");
        const processedCVs = acceptedRequests.flatMap(request => {
          // Get shortlisted file IDs for this request
          const shortlistedFileIds = (request.shortlisted || []).map(s => s.fileId);
          
          return request.uploadedCVs.map(cv => ({
            id: cv.fileId,
            clientName: request.name,
            position: request.position,
            candidateName: cv.originalName.split('.')[0], // Extract name from filename
            sentDate: toLocalISODate(request.updatedAt),
            status: shortlistedFileIds.includes(cv.fileId) ? 'Shortlisted' : 'Under Review',
            cvFileName: cv.originalName,
            webViewLink: cv.webViewLink
          }));
        });
        
        setSentCVs(processedCVs);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecruitmentRequests();
  }, []);

  // Update this line to include more statuses
  const pendingRequests = recruitmentRequests.filter(req => 
    ["Accepted", "Requested"].includes(req.status)
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => {
      const newFiles = [...prev, ...files];
      // Limit to 20 files and remove extras
      return newFiles.slice(0, 20);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendCV = async () => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      formData.append('teamLeaderId', decoded.id);
      formData.append('requestId', selectedRequest.id);
      
      selectedFiles.forEach((file) => {
        formData.append('resume', file);
      });

      const response = await uploadResumes(formData);
      
      // Update the recruitmentRequests state to reflect the new CVs
      setRecruitmentRequests(prev => 
        prev.map(request => 
          request.id === selectedRequest.id
            ? { ...request, uploadedCVs: [...request.uploadedCVs, ...response.uploadedFiles.resume] }
            : request
        )
      );

      // Add uploaded CVs to sentCVs
      const currentDate = getLocalISODate();
      const newSentCVs = response.uploadedFiles.resume.map(file => ({
        id: file.fileId,
        clientName: selectedRequest.name,
        position: selectedRequest.position,
        candidateName: file.originalName.split('.')[0],
        sentDate: currentDate,
        status: 'Under Review',
        cvFileName: file.originalName,
        webViewLink: file.webViewLink
      }));

      setSentCVs(prev => [...newSentCVs, ...prev]);

      // Close modal and reset state
      setIsModalOpen(false);
      setSelectedFiles([]);
      
      // Show success message
      alert('Resumes uploaded successfully!');
      
    } catch (error) {
      console.error('Failed to upload resumes:', error);
      alert(error.message || 'Failed to upload resumes. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentCVStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMobileCard = (item, type) => {
    if (type === 'request') {
      return (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiUser className="text-blue-500" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {item.clientName}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2 ">
              <FiBriefcase className="text-green-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {item.position}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <FiFileText className="text-purple-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {item.requirements}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <FiCalendar className="text-orange-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {item.date}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {item.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"
                >
                  <FiTag className="text-xs" />
                  {keyword}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <Button
                color="blue"
                size="sm"
                className="flex items-center gap-2 flex-1"
                onClick={() => {
                  setSelectedRequest(item);
                  setIsModalOpen(true);
                }}
              >
                <FiUpload className="text-sm" />
                {item.uploadedCVs && item.uploadedCVs.length > 0 ? 'Send More Resume' : 'Send CV'}
              </Button>
              
              <Button
                color="red"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedRequestToClose(item);
                  setIsCloseModalOpen(true);
                }}
              >
                <FiXCircle className="text-sm" />
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiUser className="text-blue-500" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {item.name}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                item.status === 'Scheduled' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-green-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {item.clientName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <FiFileText className="text-purple-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Experience: {item.experience}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <FiCalendar className="text-orange-500" />
              <div className="flex flex-col">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {item.interviewDate}
                </span>
                <span className="text-sm text-gray-500">
                  {item.interviewTime}
                </span>
              </div>
            </div>
            
            <Button
              color="green" 
              size="sm"
              className="flex items-center gap-2 w-full justify-center mt-3"
            >
              Start Interview
            </Button>
          </div>
        </motion.div>
      );
    }
  };

  const renderSentCVMobileCard = (item) => {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUser className="text-blue-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {item.candidateName}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getSentCVStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiBriefcase className="text-green-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {item.clientName} - {item.position}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiFileText className="text-purple-500" />
            <a 
              href={item.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              } underline cursor-pointer`}
            >
              {item.cvFileName}
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            <FiCalendar className="text-orange-500" />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              {item.sentDate}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Get unique client names from each section
  const getUniqueClients = (data, key = 'name') => {
    return [...new Set(data.map(item => item[key]))].sort();
  };

  // Add status options constant
  const CV_STATUS_OPTIONS = [
    'Under Review',
    'Shortlisted',
    'Rejected'
  ];

  // Update the filter dropdowns render function to handle both client and status filters
  const renderFilterDropdowns = (section, data, keyName = 'name') => {
    const clients = getUniqueClients(data, keyName);
    
    return (
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FiFilter className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <select
            value={clientFilters[section]}
            onChange={(e) => setClientFilters(prev => ({ ...prev, [section]: e.target.value }))}
            className={`
              form-select 
              rounded-lg 
              text-sm 
              border 
              ${isDarkMode ? 
                'bg-gray-700 border-gray-600 text-gray-300' : 
                'bg-white border-gray-300 text-gray-700'
              }
              focus:ring-blue-500 
              focus:border-blue-500
              p-2
            `}
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>

        {/* Add status filter for sent CVs section */}
        {section === 'sentCVs' && (
          <div className="flex items-center gap-2">
            <FiTag className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={clientFilters.sentCVStatus}
              onChange={(e) => setClientFilters(prev => ({ ...prev, sentCVStatus: e.target.value }))}
              className={`
                form-select 
                rounded-lg 
                text-sm 
                border 
                ${isDarkMode ? 
                  'bg-gray-700 border-gray-600 text-gray-300' : 
                  'bg-white border-gray-300 text-gray-700'
                }
                focus:ring-blue-500 
                focus:border-blue-500
                p-2
              `}
            >
              <option value="">All Status</option>
              {CV_STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // Filter functions for each section
  const filteredPendingRequests = pendingRequests.filter(req => 
    !clientFilters.requests || req.name === clientFilters.requests
  );

  const filteredShortlisted = shortlistedCandidates.filter(candidate => 
    !clientFilters.shortlisted || candidate.clientName === clientFilters.shortlisted
  );

  const filteredSentCVs = sentCVs.filter(cv => 
    (!clientFilters.sentCVs || cv.clientName === clientFilters.sentCVs) &&
    (!clientFilters.sentCVStatus || cv.status === clientFilters.sentCVStatus)
  );

  // Add pagination calculation function
  const getPaginatedData = (data, section) => {
    const { currentPage, itemsPerPage } = pagination[section];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return {
      currentItems: data.slice(indexOfFirstItem, indexOfLastItem),
      totalPages: Math.ceil(data.length / itemsPerPage),
      indexOfFirstItem,
      indexOfLastItem,
      totalItems: data.length
    };
  };

  // Update each section to use pagination
  // Recruitment Requests Section
  const { currentItems: currentRequests } = getPaginatedData(filteredPendingRequests, 'requests');

  // Shortlisted Candidates Section
  const { currentItems: currentShortlisted } = getPaginatedData(filteredShortlisted, 'shortlisted');

  // Sent CVs Section
  const { currentItems: currentSentCVs } = getPaginatedData(filteredSentCVs, 'sentCVs');

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      requests: { ...prev.requests, currentPage: 1 }
    }));
  }, [clientFilters.requests]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      shortlisted: { ...prev.shortlisted, currentPage: 1 }
    }));
  }, [clientFilters.shortlisted]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      sentCVs: { ...prev.sentCVs, currentPage: 1 }
    }));
  }, [clientFilters.sentCVs, clientFilters.sentCVStatus]);

  // Add Pagination component that can be reused
  const Pagination = ({ section, data }) => {
    const { currentPage, itemsPerPage } = pagination[section];
    const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem, totalItems } = getPaginatedData(data, section);

    const handlePageChange = (newPage) => {
      setPagination(prev => ({
        ...prev,
        [section]: { ...prev[section], currentPage: newPage }
      }));
    };

    return (
      <div className={`flex items-center justify-between px-4 py-3 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`flex items-center gap-1 ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index + 1}
                color={currentPage === index + 1 ? "blue" : "gray"}
                size="sm"
                onClick={() => handlePageChange(index + 1)}
                className={`min-w-[40px] ${
                  currentPage === index + 1 
                    ? 'bg-blue-500 text-white' 
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outlined"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`flex items-center gap-1 ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    );
  };

  // Add this new helper function at the top
  const getUpcomingInterviews = (candidates) => {
    return candidates
      .filter(candidate => candidate.interviewTime && new Date(candidate.interviewTime) >= new Date())
      .sort((a, b) => new Date(a.interviewTime) - new Date(b.interviewTime));
  };

  // Update the EmailModal component
  const CreateRequestModal = ({ isOpen, handleClose }) => {
    const handleCreateRequest = async (e) => {
      e.preventDefault();
      try {
        setIsCreatingRequest(true);
        // Add current leader ID
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const dataToSubmit = {
          ...newRequestData,
          teamLeaderId: decoded.id
        };
        // Format skills to an array if separated by comma
        if (typeof dataToSubmit.skills === 'string') {
          dataToSubmit.skills = dataToSubmit.skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        await createRecruitmentPosition(dataToSubmit);
        alert('Recruitment request created successfully!');
        
        // Reset state
        setNewRequestData({
          title: '', description: '', location: '', type: 'Full-time', salary: '',
          priority: 'Medium', openings: 1, skills: '', experience: '', clientId: '', deadline: ''
        });
        
        // Refresh the list directly
        const response = await getRecruitmentRequests(decoded.id);
        const active = response.requests.filter(req => req.status !== "Closed");
        setRecruitmentRequests(active);
        
        handleClose();
      } catch (err) {
        console.error('Failed to create request:', err);
        alert(err.message || 'Failed to create request.');
      } finally {
        setIsCreatingRequest(false);
      }
    };

    return (
      <Dialog
        open={isOpen}
        handler={handleClose}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl mx-auto overflow-y-auto max-h-[90vh]`}
      >
        <DialogHeader className={`${isDarkMode ? 'text-white' : 'text-gray-900'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <FiBriefcase className="text-xl text-blue-500" />
            Create Job Request
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4 overflow-y-auto pr-2">
          <form id="create-request-form" onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Selection */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Client <span className="text-red-500">*</span></label>
                <select
                  required
                  value={newRequestData.clientId}
                  onChange={(e) => setNewRequestData({...newRequestData, clientId: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select a Client</option>
                  {clients.map((client, idx) => (
                    <option key={client.id || idx} value={client.id}>
                      {client.name || client.companyName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Title <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FiBriefcase className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    required
                    value={newRequestData.title}
                    onChange={(e) => setNewRequestData({...newRequestData, title: e.target.value})}
                    placeholder="e.g. Senior Software Engineer"
                    className={`w-full pl-10 p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newRequestData.location}
                  onChange={(e) => setNewRequestData({...newRequestData, location: e.target.value})}
                  placeholder="e.g. Mumbai, India / Remote"
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Deadline */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deadline</label>
                <div className="relative">
                  <FiCalendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="date"
                    value={newRequestData.deadline}
                    min={getLocalISODate()}
                    onChange={(e) => setNewRequestData({...newRequestData, deadline: e.target.value})}
                    className={`w-full pl-10 p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Type, Priority, Openings, Experience */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Type</label>
                <select
                  value={newRequestData.type}
                  onChange={(e) => setNewRequestData({...newRequestData, type: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                <select
                  value={newRequestData.priority}
                  onChange={(e) => setNewRequestData({...newRequestData, priority: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Number of Openings</label>
                <input
                  type="number"
                  min="1"
                  value={newRequestData.openings}
                  onChange={(e) => setNewRequestData({...newRequestData, openings: parseInt(e.target.value)})}
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Experience Required</label>
                <input
                  type="text"
                  placeholder="e.g. 3-5 years"
                  value={newRequestData.experience}
                  onChange={(e) => setNewRequestData({...newRequestData, experience: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹10L - ₹15L PA"
                  value={newRequestData.salary}
                  onChange={(e) => setNewRequestData({...newRequestData, salary: e.target.value})}
                  className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Required Skills (comma separated)</label>
              <div className="relative">
                <FiTag className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="React, Node.js, MongoDB"
                  value={newRequestData.skills}
                  onChange={(e) => setNewRequestData({...newRequestData, skills: e.target.value})}
                  className={`w-full pl-10 p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Description</label>
              <textarea
                rows="4"
                placeholder="Detailed job description and requirements..."
                value={newRequestData.description}
                onChange={(e) => setNewRequestData({...newRequestData, description: e.target.value})}
                className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-blue-500 resize-none`}
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} space-x-2`}>
          <Button
            variant="outlined"
            onClick={handleClose}
            className={isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            type="submit"
            form="create-request-form"
            disabled={isCreatingRequest}
            className="flex items-center gap-2"
          >
            {isCreatingRequest ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Creating...
              </>
            ) : (
              <>
                <FiBriefcase className="text-sm" />
                Create Request
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  // Update the EmailModal component
  const EmailModal = ({ isOpen, handleClose, candidate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailOption, setEmailOption] = useState('client');
    const [candidateEmail, setCandidateEmail] = useState('');

    const handleSendEmail = async () => {
      try {
        setIsLoading(true);
        
        // Format date and time for the API
        const interviewDateTime = new Date(candidate.interviewTime);
        const formattedDate = interviewDateTime.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '-');
        
        const formattedTime = interviewDateTime.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        // Prepare the meeting data
        const meetingData = {
          interviewDate: formattedDate,
          interviewTime: formattedTime,
          clientId: candidate.clientId,
          recruitmentId: candidate.recruitmentId,
          fileId: candidate.fileId
        };

        // If both option is selected, include candidate email
        if (emailOption === 'both') {
          meetingData.candidateEmail = candidateEmail;
        }

        // Generate meeting link
        const response = await generateMeetLink(meetingData);
        
        // Show success message
        alert('Email sent successfully!');
        
        // Close modal and reset form
        handleClose();
        setCandidateEmail('');
        setEmailOption('client');
      } catch (error) {
        console.error('Failed to send email:', error);
        alert(error.message || 'Failed to send email. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Dialog
        open={isOpen}
        handler={handleClose}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md mx-auto`}
      >
        <DialogHeader className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="flex items-center gap-3">
            <FiMail className="text-xl text-blue-500" />
            Send Email
          </div>
        </DialogHeader>
        
        <DialogBody className="space-y-4">
          {/* Candidate Info */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="space-y-2">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Candidate</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {candidate?.originalName?.split('.')[0]}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Position</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {candidate?.position}
                </p>
              </div>
            </div>
          </div>

          {/* Email Options */}
          <div className="space-y-3">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Email Option:
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="client"
                  checked={emailOption === 'client'}
                  onChange={(e) => setEmailOption(e.target.value)}
                  className="form-radio"
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Send to Client Only
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="both"
                  checked={emailOption === 'both'}
                  onChange={(e) => setEmailOption(e.target.value)}
                  className="form-radio"
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Send to Both Client and Candidate
                </span>
              </label>
            </div>
          </div>

          {/* Candidate Email Input */}
          {emailOption === 'both' && (
            <div>
              <label className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Candidate's Email Address:
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className={`w-full p-2 rounded-md border ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Enter candidate's email"
                required
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter className="space-x-2">
          <Button
            variant="outlined"
            onClick={handleClose}
            className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSendEmail}
            disabled={isLoading || (emailOption === 'both' && !candidateEmail)}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Sending...
              </>
            ) : (
              <>
                <FiMail className="text-sm" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  // Update the handleGenerateMeetLink function
  const handleGenerateMeetLink = async (candidate) => {
    try {
      setIsMeetingLinkLoading(true);
      
      // Format date and time for the API
      const interviewDateTime = new Date(candidate.interviewTime);
      const formattedDate = interviewDateTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      
      const formattedTime = interviewDateTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const response = await generateMeetLink({
        interviewDate: formattedDate,
        interviewTime: formattedTime,
        clientId: candidate.clientId,
        candidateEmail: candidate.email || '',
        recruitmentId: candidate.recruitmentId,
        fileId: candidate.fileId
      });

      // Update the candidate's data with the meeting link
      setShortlistedCandidates(prev => 
        prev.map(c => 
          c.id === candidate.id 
            ? { ...c, meetingLink: response.meetingLink }
            : c
        )
      );

      // Show success message
      alert('Meeting link generated successfully!');
      
    } catch (error) {
      console.error('Failed to generate meeting link:', error);
      alert(error.message || 'Failed to generate meeting link. Please try again.');
    } finally {
      setIsMeetingLinkLoading(false);
    }
  };

  // Add this new component inside RecruitmentTab
  const CloseJobModal = ({ isOpen, handleClose, request }) => {
    return (
      <Dialog
        open={isOpen}
        handler={handleClose}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-md mx-auto`}
      >
        <DialogHeader className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="flex items-center gap-3">
            <FiXCircle className="text-xl text-red-500" />
            Close Job Request
          </div>
        </DialogHeader>
        
        <DialogBody className="space-y-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid gap-2">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Client
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {request?.name}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Position
                </p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {request?.position}
                </p>
              </div>
            </div>
          </div>
          
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Are you sure you want to close this job request? This action cannot be undone.
          </p>
        </DialogBody>

        <DialogFooter className="space-x-2">
          <Button
            variant="outlined"
            color="gray"
            onClick={handleClose}
            className="flex items-center gap-2"
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={async () => {
              try {
                setIsClosing(true);
                const token = localStorage.getItem("token");
                const decoded = jwtDecode(token);
                
                await closeRecruitmentRequest({
                  recruitmentId: request.id,
                  userType: 'teamLeader',
                  userId: decoded.id
                });

                // Update the local state to reflect the closed request
                setRecruitmentRequests(prev => 
                  prev.filter(req => req.id !== request.id)
                );

                // Show success message
                alert('Job request closed successfully!');
                handleClose();
              } catch (error) {
                console.error('Failed to close job request:', error);
                alert(error.message || 'Failed to close job request. Please try again.');
              } finally {
                setIsClosing(false);
              }
            }}
            className="flex items-center gap-2"
            disabled={isClosing}
          >
            {isClosing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Closing...
              </>
            ) : (
              <>
                <FiXCircle className="text-sm" />
                Close Job
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  // Add authentication check on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('recruitmentTabAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  // Add password verification function
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'recruitment@123') {  // Using a more secure password
      setIsAuthenticated(true);
      setIsPasswordError(false);
      localStorage.setItem('recruitmentTabAuth', 'true');
    } else {
      setIsPasswordError(true);
    }
  };

  // Add password protection UI
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center items-center min-h-[500px]"
      >
        <Card className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Authentication Required
            </Typography>
          </CardHeader>

          <CardBody className="flex flex-col gap-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <Typography
                  variant="small"
                  className={`mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Enter Password
                </Typography>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsPasswordError(false);
                  }}
                  className={isDarkMode ? 'text-white' : 'text-gray-900'}
                  error={isPasswordError}
                  containerProps={{ className: "min-w-[72px]" }}
                  label="Password"
                />
                {isPasswordError && (
                  <Typography
                    variant="small"
                    color="red"
                    className="mt-2 flex items-center gap-1 font-normal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Incorrect password
                  </Typography>
                )}
              </div>

              <Button type="submit" color="blue" className="w-full" size="lg">
                Access Recruitment Tab
              </Button>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-2.5"
    >
      <Tabs value={activeTab}>
        <TabsHeader
          className={`
            border-b
            ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}
            shadow-none
            rounded-none
            p-0
          `}
        >
          {tabData.map(({ label, value, icon: Icon }) => (
            <Tab
              key={value}
              value={value}
              onClick={() => setActiveTab(value)}
              className={`
                flex items-center gap-2
                px-6 py-4
                ${activeTab === value ? 
                  (isDarkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-500 border-b-2 border-blue-500') :
                  (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')
                }
                transition-colors duration-200
              `}
            >
              <Icon className={`w-5 h-5 ${activeTab === value ? 'text-current' : 'text-gray-500'}`} />
              <span>{label}</span>
            </Tab>
          ))}
        </TabsHeader>

        <TabsBody
          animate={{
            initial: { opacity: 0, y: 10 },
            mount: { opacity: 1, y: 0 },
            unmount: { opacity: 0, y: 10 },
          }}
        >
          {/* Overview Tab */}
          <TabPanel value="overview">
            {/* Stats Cards with enhanced design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`
                  relative overflow-hidden
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                  rounded-2xl shadow-lg p-6 border
                  ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                `}
              >
                <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                  <div className={`
                    w-full h-full rounded-full 
                    ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-100/50'}
                  `} />
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                      <FiBriefcase className="text-2xl text-blue-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {filteredPendingRequests.length}
                    </h3>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Active Requests
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Shortlisted
                    </p>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {filteredShortlisted.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <FiUsers className="text-xl text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      CVs Sent
                    </p>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {filteredSentCVs.length}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <FiSend className="text-xl text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Upcoming Interviews Section with enhanced design */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className={`
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                  rounded-2xl shadow-lg overflow-hidden
                  border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                `}
              >
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                        <FiCalendar className="text-white text-xl" />
                      </div>
                      <h2 className="text-white text-lg font-semibold">Upcoming Interviews</h2>
                    </div>
                    <span className={`
                      px-3 py-1 text-sm rounded-full
                      bg-white/10 backdrop-blur-sm text-white
                    `}>
                      {getUpcomingInterviews(shortlistedCandidates).length} Scheduled
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-4">
                    {getUpcomingInterviews(shortlistedCandidates).length > 0 ? (
                      getUpcomingInterviews(shortlistedCandidates).map((interview) => (
                        <motion.div
                          key={interview.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          className={`
                            relative p-4 rounded-xl border
                            ${isDarkMode ? 
                              'bg-gray-700/50 border-gray-600' : 
                              'bg-gray-50 border-gray-200'
                            }
                            backdrop-blur-sm
                          `}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`
                                p-2 rounded-lg
                                ${isDarkMode ? 'bg-gray-600' : 'bg-white'}
                                shadow-sm
                              `}>
                                <FiUser className="text-blue-500" />
                              </div>
                              <div>
                                <h3 className={`font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {interview.name}
                                </h3>
                                <p className={`text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {interview.clientName}
                                </p>
                              </div>
                            </div>
                            <div className={`
                              px-3 py-1.5 rounded-full text-xs font-medium
                              ${isDarkMode ? 
                                'bg-blue-500/10 text-blue-400' : 
                                'bg-blue-100 text-blue-800'
                              }
                              flex items-center gap-2
                            `}>
                              <FiClock className="text-xs" />
                              {formatInterviewTime(interview.interviewTime)}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-200'
                          }">
                            <div className="flex items-center gap-3">
                              <div className={`
                                p-1.5 rounded-lg
                                ${isDarkMode ? 'bg-gray-600' : 'bg-white'}
                              `}>
                                <FiBriefcase className="text-green-500" />
                              </div>
                              <span className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {interview.position}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <a
                                href={interview.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                              >
                                <FiFileText className="text-sm" />
                                View CV
                              </a>
                              <Button
                                color="green"
                                size="sm"
                                className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs"
                                onClick={() => {
                                  setSelectedCandidate(interview);
                                  setIsEmailModalOpen(true);
                                }}
                              >
                                <FiMail className="text-sm" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className={`
                        text-center py-12
                        ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                      `}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                          <FiCalendar className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No Upcoming Interviews</h3>
                        <p className="text-sm text-gray-500">
                          When interviews are scheduled, they'll appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions Section */}
             
          </TabPanel>

          {/* Recruitment Requests Tab */}
          <TabPanel value="requests">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiBriefcase className="text-white text-xl" />
                    <h2 className="text-white text-lg font-semibold">Recruitment Requests</h2>
                  </div>
                  <Button
                    color="white"
                    size="sm"
                    className="flex items-center gap-2 text-blue-600"
                    onClick={() => setIsCreateRequestModalOpen(true)}
                  >
                    <FiBriefcase className="text-sm" />
                    Create Request
                  </Button>
                </div>
              </div>

              <div className="p-4">
                  {renderFilterDropdowns('requests', pendingRequests)}
                  {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500 p-4">
                      {error}
                    </div>
                  ) : filteredPendingRequests.length === 0 ? (
                    <div className="text-center text-gray-500 p-4">
                      No recruitment requests found
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-max table-auto text-left">
                          <thead>
                            <tr>
                              {["Client", "Position", "Requirements", "Status", "Date", "Keywords", "Action"].map((head) => (
                                <th key={head} className={`border-b ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'} p-2.5 text-xs font-medium`}>
                                  {head}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentRequests.map((request) => (
                              <motion.tr 
                                key={request.id}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                              >
                                <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <FiUser className="text-sm text-blue-500" />
                                    {request.name}
                                  </div>
                                </td>
                                <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <FiBriefcase className="text-sm text-green-500" />
                                    {request.position}
                                  </div>
                                </td>
                                <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <FiFileText className="text-sm text-purple-500" />
                                    {`${request.experience} years, ${request.qualification}`}
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(request.status)}`}>
                                    {request.status}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    <FiCalendar className="text-sm text-orange-500" />
                                    {request.date}
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <div className="flex flex-wrap gap-1">
                                    {request.skills && request.skills.map((skill, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"
                                      >
                                        <FiTag className="text-xs" />
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      color="blue"
                                      size="sm"
                                      className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setIsModalOpen(true);
                                      }}
                                    >
                                      <FiUpload className="text-sm" />
                                      {request.uploadedCVs && request.uploadedCVs.length > 0 ? 'Send More Resume' : 'Send CV'}
                                    </Button>
                                    
                                    <Button
                                      color="red"
                                      size="sm"
                                      className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs"
                                      onClick={() => {
                                        setSelectedRequestToClose(request);
                                        setIsCloseModalOpen(true);
                                      }}
                                    >
                                      <FiXCircle className="text-sm" />
                                      Close
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                        <Pagination section="requests" data={filteredPendingRequests} />
                      </div>
                      
                      <div className="md:hidden space-y-3">
                        {currentRequests.map((request) => renderMobileCard(request, 'request'))}
                        <Pagination section="requests" data={filteredPendingRequests} />
                      </div>
                    </>
                  )}
              </div>
            </div>
          </TabPanel>

          {/* Shortlisted Candidates Tab */}
          <TabPanel value="shortlisted">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                <div className="flex items-center gap-3">
                  <FiUsers className="text-white text-xl" />
                  <h2 className="text-white text-lg font-semibold">Shortlisted Candidates</h2>
                </div>
              </div>
              <div className="p-4">
                {renderFilterDropdowns('shortlisted', shortlistedCandidates, 'clientName')}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        {["Candidate", "Client", "Position", "Experience", "Reason", "Status", "Interview Time", "Action"].map((head) => (
                          <th
                            key={head}
                            className={`border-b ${
                              isDarkMode 
                                ? 'border-gray-700 text-gray-300' 
                                : 'border-gray-200 text-gray-700'
                            } p-2.5 text-xs font-medium`}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentShortlisted.map((candidate) => (
                        <motion.tr 
                          key={candidate.id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <FiUser className="text-sm text-blue-500" />
                              {candidate.name}
                            </div>
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <FiBriefcase className="text-sm text-green-500" />
                              {candidate.clientName}
                            </div>
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {candidate.position}
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {candidate.experience}
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {candidate.reason}
                          </td>
                          <td className="p-2.5">
                            <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {candidate.status}
                            </span>
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {candidate.interviewTime ? (
                              <div className="flex items-center gap-2">
                                <FiCalendar className="text-sm text-blue-500" />
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-700 dark:text-blue-400">
                                  {formatInterviewTime(candidate.interviewTime)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No Interview Scheduled</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <a
                                href={candidate.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                              >
                                <FiFileText className="text-sm" />
                                View CV
                              </a>
                              
                              {candidate.meetLink ? (
                                <a
                                  href={candidate.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-green-500 rounded-lg hover:bg-green-600"
                                >
                                  <FiZap className="text-sm" />
                                  Join Meet
                                </a>
                              ) : (
                                <Button
                                  color="green"
                                  size="sm"
                                  className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs"
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setIsEmailModalOpen(true);
                                  }}
                                >
                                  <FiMail className="text-sm" />
                                  Schedule
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination section="shortlisted" data={filteredShortlisted} />
                </div>
                
                <div className="md:hidden space-y-3">
                  {currentShortlisted.map((candidate) => renderMobileCard(candidate, 'candidate'))}
                  <Pagination section="shortlisted" data={filteredShortlisted} />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Sent CVs Tab */}
          <TabPanel value="sent-cvs">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                <div className="flex items-center gap-3">
                  <FiSend className="text-white text-xl" />
                  <h2 className="text-white text-lg font-semibold">Sent CVs</h2>
                </div>
              </div>
              <div className="p-4">
                {renderFilterDropdowns('sentCVs', sentCVs, 'clientName')}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        {["Candidate", "Client", "Position", "CV File", "Sent Date", "Status"].map((head) => (
                          <th
                            key={head}
                            className={`border-b ${
                              isDarkMode 
                                ? 'border-gray-700 text-gray-300' 
                                : 'border-gray-200 text-gray-700'
                            } p-2.5 text-xs font-medium`}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSentCVs.map((cv) => (
                        <motion.tr 
                          key={cv.id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: cv.id * 0.1 }}
                          className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <FiUser className="text-sm text-blue-500" />
                              {cv.candidateName}
                            </div>
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {cv.clientName}
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {cv.position}
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <FiFileText className="text-sm text-purple-500" />
                              <a 
                                href={cv.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${
                                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                                } underline cursor-pointer`}
                              >
                                {cv.cvFileName}
                              </a>
                            </div>
                          </td>
                          <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-sm text-orange-500" />
                              {cv.sentDate}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-3 py-1 rounded-full text-xs ${getSentCVStatusColor(cv.status)}`}>
                              {cv.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination section="sentCVs" data={filteredSentCVs} />
                </div>
                
                <div className="md:hidden space-y-3">
                  {currentSentCVs.map((cv) => renderSentCVMobileCard(cv))}
                  <Pagination section="sentCVs" data={filteredSentCVs} />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Closed Requests Tab */}
          <TabPanel value="closed">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
                <div className="flex items-center gap-3">
                  <FiXCircle className="text-white text-xl" />
                  <h2 className="text-white text-lg font-semibold">Close Recruitment Requests</h2>
                </div>
              </div>
              
              <div className="p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 p-4">
                    {error}
                  </div>
                ) : recruitmentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <FiXCircle className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Active Requests</h3>
                    <p className="text-sm text-gray-500">
                      There are no active recruitment requests to close
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max table-auto text-left">
                      <thead>
                        <tr>
                          {["Client", "Position", "Requirements", "Status", "Created Date", "Actions"].map((head) => (
                            <th
                              key={head}
                              className={`border-b ${
                                isDarkMode 
                                  ? 'border-gray-700 text-gray-300' 
                                  : 'border-gray-200 text-gray-700'
                              } p-2.5 text-xs font-medium`}
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Get unique requests by filtering duplicates based on position and client */}
                        {recruitmentRequests
                          .reduce((unique, request) => {
                            const isDuplicate = unique.find(
                              item => item.position === request.position && 
                                     item.name === request.name
                            );
                            if (!isDuplicate) {
                              unique.push(request);
                            }
                            return unique;
                          }, [])
                          .map((request) => (
                            <motion.tr 
                              key={request.id}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="flex items-center gap-2">
                                  <FiUser className="text-sm text-blue-500" />
                                  {request.name}
                                </div>
                              </td>
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="flex items-center gap-2">
                                  <FiBriefcase className="text-sm text-green-500" />
                                  {request.position}
                                </div>
                              </td>
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="flex items-center gap-2">
                                  <FiFileText className="text-sm text-purple-500" />
                                  {`${request.experience} years, ${request.qualification}`}
                                </div>
                              </td>
                              <td className="p-2.5">
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  request.status === 'Accepted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {request.status}
                                </span>
                              </td>
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="flex items-center gap-2">
                                  <FiCalendar className="text-sm text-orange-500" />
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="p-2.5">
                                {request.status === 'Rejected' ? (
                                  <span className="px-3 py-1.5 rounded-full text-xs bg-red-100 text-red-800">
                                    Closed
                                  </span>
                                ) : (
                                  <Button
                                    color="red"
                                    size="sm"
                                    className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs"
                                    onClick={() => {
                                      setSelectedRequestToClose(request);
                                      setIsCloseModalOpen(true);
                                    }}
                                  >
                                    <FiXCircle className="text-sm" />
                                    Close Request
                                  </Button>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Below the table, show closed requests */}
                {closedRequests.length > 0 && (
                  <div className="mt-8">
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recently Closed Requests
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-max table-auto text-left">
                        <thead>
                          <tr>
                            {["Client", "Position", "Close Date", "Reason", "Status"].map((head) => (
                              <th
                                key={head}
                                className={`border-b ${
                                  isDarkMode 
                                    ? 'border-gray-700 text-gray-300' 
                                    : 'border-gray-200 text-gray-700'
                                } p-2.5 text-xs font-medium`}
                              >
                                {head}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {closedRequests.map((request) => (
                            <motion.tr 
                              key={request.id}
                              variants={tableRowVariants}
                              initial="hidden"
                              animate="visible"
                              className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {request.name}
                              </td>
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {request.position}
                              </td>
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {new Date(request.updatedAt).toLocaleDateString()}
                              </td>
                              <td className={`p-2.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {request.closeReason || 'Not specified'}
                              </td>
                              <td className="p-2.5">
                                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                  Closed
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabPanel>
        </TabsBody>
      </Tabs>

      {/* Updated Modal Styles */}
      <Dialog
        open={isModalOpen}
        handler={() => setIsModalOpen(false)}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-2xl mx-auto`}
      >
        <DialogHeader className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <div className="flex items-center gap-3">
            <FiUpload className="text-xl text-blue-500" />
            Send Resumes
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {/* Request Details */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Client</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRequest?.name}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Position</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRequest?.position}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <FiUpload className={`text-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Click to upload resumes or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Maximum 20 files allowed
                </p>
              </div>
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className={`max-h-60 overflow-y-auto rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="p-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      isDarkMode ? 'bg-gray-600' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-blue-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button
            variant="outlined"
            color="red"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedFiles([]);
            }}
            className="flex items-center gap-2"
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSendCV}
            disabled={selectedFiles.length === 0 || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Uploading...
              </>
            ) : (
              <>
                <FiSend />
                Send {selectedFiles.length} {selectedFiles.length === 1 ? 'Resume' : 'Resumes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        handleClose={() => {
          setIsEmailModalOpen(false);
          setSelectedCandidate(null);
          setCandidateEmail('');
          setEmailOption('client');
        }}
        candidate={selectedCandidate}
      />

      {/* Close Job Modal */}
      <CloseJobModal
        isOpen={isCloseModalOpen}
        handleClose={() => {
          setIsCloseModalOpen(false);
          setSelectedRequestToClose(null);
        }}
        request={selectedRequestToClose}
      />

      <CreateRequestModal
      isOpen={isCreateRequestModalOpen}
      handleClose={() => {
        setIsCreateRequestModalOpen(false);
      }}
    />


    </motion.div>
  );
};

export default RecruitmentTab;





