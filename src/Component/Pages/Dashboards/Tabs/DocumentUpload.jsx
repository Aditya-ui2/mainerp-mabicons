import { useState, useEffect } from 'react';
import { uploadClientDocuments } from '../../service/api';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Card, Typography, List, ListItem, IconButton, Progress } from "@material-tailwind/react";
import { TrashIcon, DocumentIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

export const DocumentUpload = ({ isOpen, onClose, clientId, isDarkMode }) => {
  const [files, setFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const documentTypes = {
    employeeMasterDatabase: 'Employee Master Database',
    currentSalaryStructure: 'Current Salary Structure',
    previousSalarySheets: 'Previous Salary Sheets',
    currentHRPolicies: 'Current HR Policies',
    leaveBalance: 'Leave Balance',
    // New document types
    companyLogo: 'Company Logo',
    letterhead: 'Letterhead',
    agreement: 'Agreement'
  };

  const onDrop = (acceptedFiles, documentType) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check if file size is less than 5MB (5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus(`Error: ${file.name} is too large. Maximum file size is 5MB.`);
        return;
      }
      setFiles(prev => ({
        ...prev,
        [documentType]: file
      }));
      setUploadProgress(prev => ({
        ...prev,
        [documentType]: 0
      }));
    }
  };

  // Add validation for clientId
  useEffect(() => {
    if (clientId === 'undefined' || !clientId) {
      setUploadStatus('Error: Invalid client ID. Please try again.');
    } else {
      setUploadStatus('');
    }
  }, [clientId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!clientId || clientId === 'undefined') {
      setUploadStatus('Error: Invalid client ID. Please try again.');
      return;
    }
  
    setIsLoading(true);
    setUploadStatus('');
  
    try {
      const formData = new FormData();
      formData.append('clientId', clientId);
  
      // Simulate progress for each file
      for (const [documentType, file] of Object.entries(files)) {
        if (file) {
          formData.append(documentType, file);
          
          // Simulate progress updates
          for (let progress = 0; progress <= 100; progress += 10) {
            setUploadProgress(prev => ({
              ...prev,
              [documentType]: progress
            }));
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
  
      const response = await uploadClientDocuments(formData);
      console.log('Upload response:', response);
      
      setUploadStatus('Documents uploaded successfully!');
      // Reset files and progress after successful upload
      setFiles({});
      setUploadProgress({});
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Error: ${error.message || 'Upload failed'}`);
    } finally {
      setIsLoading(false);
      setUploadProgress({});
    }
  };

  const handleDelete = (documentType) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentType];
      return newFiles;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[documentType];
      return newProgress;
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 z-[9999] flex items-center justify-center p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } rounded-xl p-6 w-[95%] max-w-5xl mx-auto shadow-2xl overflow-y-auto max-h-[90vh]`}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <Typography variant="h4" className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Upload Documents
            </Typography>
            <Typography variant="small" className="text-gray-500 mt-1">
              Upload your company documents in PDF, DOC, XLS, or image formats (max 5MB per file)
            </Typography>
          </div>
          <IconButton
            variant="text"
            color={isDarkMode ? 'white' : 'gray'}
            onClick={onClose}
            className="rounded-full hover:bg-opacity-10"
          >
            <FiX className="text-2xl" />
          </IconButton>
        </div>

        {uploadStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 ${
              uploadStatus.includes('Error')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
            {uploadStatus}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(documentTypes).map(([key, label]) => {
            const file = files[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-750' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-white'
                    } shadow-sm`}>
                      <DocumentIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-semibold text-sm">
                        {label}
                      </Typography>
                      {file && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Typography variant="small" className="text-gray-500 text-xs">
                            {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </Typography>
                          <Progress 
                            value={uploadProgress[key] || 0} 
                            size="sm" 
                            className="mt-1 w-[150px]"
                            color="blue"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => onDrop([e.target.files[0]], key)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png"
                      className="hidden"
                      id={key}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={key}
                      className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-white hover:bg-gray-200'
                      } shadow-sm`}
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 text-blue-500" />
                    </label>
                    {file && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => handleDelete(key)}
                          disabled={isLoading}
                          className="rounded-lg shadow-sm p-2"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className={`px-6 py-2.5 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            } shadow-sm hover:shadow-md`}
            disabled={isLoading || Object.keys(files).length === 0}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </span>
            ) : 'Upload Documents'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

DocumentUpload.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clientId: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool
};

DocumentUpload.defaultProps = {
  isDarkMode: false
};