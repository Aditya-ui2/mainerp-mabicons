import React, { useState, useCallback } from 'react';
import { Card, Typography, List, ListItem, IconButton, Progress } from "@material-tailwind/react";
import { TrashIcon, DocumentIcon, ArrowUpTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useDropzone } from 'react-dropzone';

const DocumentUpload = ({ onFileUpload }) => {
  const [documents, setDocuments] = useState([]);
  
  // Document types
  const documentTypes = {
    employeeMasterDatabase: 'Employee Master Database',
    currentSalaryStructure: 'Current Salary Structure',
    previousSalarySheets: 'Previous Salary Sheets',
    currentHRPolicies: 'Current HR Policies',
    leaveBalance: 'Leave Balance',
    companyLogo: 'Company Logo',
    letterhead: 'Letterhead',
    agreement: 'Agreement'
  };
  
  // Selected document type
  const [selectedType, setSelectedType] = useState('employeeMasterDatabase');

  const onDrop = useCallback((acceptedFiles) => {
    const newDocs = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file,
      progress: 100,
      timestamp: new Date(),
      type: selectedType
    }));
    setDocuments(prev => [...prev, ...newDocs]);
    
    // Send to chat window
    newDocs.forEach(doc => {
      onFileUpload({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        timestamp: doc.timestamp,
        type: selectedType
      });
    });
  }, [onFileUpload, selectedType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const handleDelete = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  return (
    <Card className="p-6 sm:p-8 dark:bg-gray-900/95 shadow-2xl backdrop-blur-sm border dark:border-gray-800">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <DocumentIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <Typography variant="h5" className="font-bold text-gray-800 dark:text-gray-100">
              Upload Documents
            </Typography>
            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
              Drag & drop your files to get started
            </Typography>
          </div>
        </div>
      </div>

      {/* Document Type Selector */}
      <div className="mb-6">
        <Typography variant="small" className="text-gray-700 dark:text-gray-300 mb-2 block">
          Select Document Type
        </Typography>
        <div className="flex flex-wrap gap-3">
          {Object.entries(documentTypes).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                ${selectedType === type 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden border-2 border-dashed rounded-2xl 
          p-8 sm:p-12 mb-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out group
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/20 dark:border-blue-400' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
          }
          before:absolute before:inset-0 before:bg-gradient-to-b 
          before:from-blue-50/0 before:to-blue-50/20 dark:before:from-blue-900/0 dark:before:to-blue-900/20
          dark:bg-gray-900/50
        `}
      >
        <input {...getInputProps()} />
        <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-105">
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl
            flex items-center justify-center
            transition-all duration-300
            ${isDragActive 
              ? 'bg-blue-100 dark:bg-blue-900/40' 
              : 'bg-gray-100 dark:bg-gray-800'
            }
          `}>
            <ArrowUpTrayIcon className={`
              h-8 w-8 transition-colors duration-300
              ${isDragActive 
                ? 'text-blue-500 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
              }
            `} />
          </div>
          <Typography className={`
            text-lg sm:text-xl font-medium transition-colors duration-300
            ${isDragActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300'
            }
          `}>
            {isDragActive
              ? "Drop your files here"
              : "Drag & drop files here, or click to browse"
            }
          </Typography>
          <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-2">
            Supported formats: PDF, DOC, DOCX, TXT
          </Typography>
        </div>
      </div>

      {/* Enhanced File List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="text-gray-700 dark:text-gray-300">
              Uploaded Files ({documents.length})
            </Typography>
          </div>
          <List className="p-0 space-y-3">
            {documents.map((doc) => (
              <ListItem
                key={doc.id}
                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl
                         transition-all duration-200 hover:scale-[1.01]
                         bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md
                         border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 
                              transition-transform duration-300 group-hover:scale-110">
                    <DocumentTextIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography 
                        variant="h6" 
                        className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px] sm:max-w-[300px]"
                      >
                        {doc.name}
                      </Typography>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.type === 'agreement' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : doc.type === 'employeeMasterDatabase' || doc.type === 'currentSalaryStructure' || doc.type === 'previousSalarySheets'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : doc.type === 'currentHRPolicies' || doc.type === 'leaveBalance'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : doc.type === 'companyLogo' || doc.type === 'letterhead'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {documentTypes[doc.type] || 'Document'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <Typography variant="small" className="flex items-center gap-1">
                        <span className="font-medium">{(doc.size / (1024 * 1024)).toFixed(2)}</span>
                        <span className="text-gray-400 dark:text-gray-500">MB</span>
                      </Typography>
                      <span className="hidden sm:inline">•</span>
                      <Typography variant="small" className="hidden sm:block">
                        {doc.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </div>
                    <div className="mt-2 w-full sm:w-[200px]">
                      <Progress 
                        value={doc.progress} 
                        size="sm" 
                        className="h-1"
                        color={doc.progress === 100 ? "blue" : "blue"}
                      />
                    </div>
                  </div>
                </div>
                <IconButton
                  variant="text"
                  color="red"
                  onClick={() => handleDelete(doc.id)}
                  className="mt-2 sm:mt-0 opacity-0 group-hover:opacity-100
                           transition-all duration-300 hover:scale-110
                           hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* Enhanced Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-6 px-4 rounded-xl border-2 border-dashed
                      border-gray-200 dark:border-gray-700">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          <Typography variant="h6" className="text-gray-600 dark:text-gray-300 mb-1">
            No documents yet
          </Typography>
          <Typography variant="small" className="text-gray-500 dark:text-gray-400">
            Upload your first document to get started
          </Typography>
        </div>
      )}

      {/* Document Cards Grid - Similar to the screenshot */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee Master Database */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Employee Master Database
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Current Salary Structure */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Current Salary Structure
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Previous Salary Sheets */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Previous Salary Sheets
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Current HR Policies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Current HR Policies
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Leave Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Leave Balance
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Company Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Company Logo
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Letterhead */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Letterhead
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>

        {/* Agreement - Added as requested */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <Typography variant="h6" className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Agreement
          </Typography>
          <Typography variant="small" className="text-yellow-500 dark:text-yellow-400 mb-4 block">
            Document not uploaded yet
          </Typography>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Not Available
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-gray-900 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Upload
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentUpload;

