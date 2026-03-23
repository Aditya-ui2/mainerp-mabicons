import React, { useState, useEffect, useCallback } from 'react';
import {
  FiRefreshCw,
  FiChevronDown,
  FiDownload,
  FiEye,
  FiStar,
  FiFileText,
  FiFile,
  FiX,
  FiLoader,
  FiDatabase,
  FiClock,
  FiCheckCircle,
  FiUsers,
} from 'react-icons/fi';
import {
  getResumeBankStats,
  getResumeRoleTypes,
  getResumeBankResumes,
  getResumeDetails,
  updateResumeDetails,
  syncResumesFromSharePoint,
  syncResumesFromSharePointDrive,
  toggleStarResumes,
  bulkUpdateResumeStatus,
  assignResumesToPosition,
  getResumeDownloadUrl,
} from '../../../service/api';

const ResumeBankTab = () => {
  // State
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [roleTypes, setRoleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSource, setSyncSource] = useState(null); // 's3' or 'sharepoint'
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    roleType: '',
    status: '',
    isStarred: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const statusOptions = [
    'Available', 'Shortlisted', 'Contacted', 'Interview Scheduled', 'Hired', 'Rejected', 'Not Interested'
  ];

  const statusColors = {
    'Available': { backgroundColor: '#dcfce7', color: '#166534' },
    'Shortlisted': { backgroundColor: '#dbeafe', color: '#1e40af' },
    'Contacted': { backgroundColor: '#fef9c3', color: '#854d0e' },
    'Interview Scheduled': { backgroundColor: '#ede9fe', color: '#6b21a8' },
    'Hired': { backgroundColor: '#d1fae5', color: '#065f46' },
    'Rejected': { backgroundColor: '#fee2e2', color: '#991b1b' },
    'Not Interested': { backgroundColor: '#f3f4f6', color: '#374151' }
  };

  // Fetch data
  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      // Remove empty params
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const response = await getResumeBankResumes(params);
      setResumes(response.data || []);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchStats = async () => {
    try {
      const response = await getResumeBankStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRoleTypes = async () => {
    try {
      const response = await getResumeRoleTypes();
      setRoleTypes(response.roles || []);
    } catch (error) {
      console.error('Failed to fetch role types:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRoleTypes();
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Handlers
  const handleSync = async (source = 's3') => {
    try {
      setSyncing(true);
      setSyncSource(source);
      setShowSyncMenu(false);
      if (source === 'sharepoint') {
        await syncResumesFromSharePointDrive({});
      } else {
        await syncResumesFromSharePoint({});
      }
      await fetchStats();
      await fetchRoleTypes();
      await fetchResumes();
      alert(`Resumes synced successfully from ${source === 'sharepoint' ? 'SharePoint' : 'S3'}!`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync resumes: ' + (error.message || 'Unknown error'));
    } finally {
      setSyncing(false);
      setSyncSource(null);
    }
  };

  const handleSyncRole = async (roleType) => {
    try {
      setSyncing(true);
      await syncResumesFromSharePoint({ roleType });
      await fetchStats();
      await fetchResumes();
      alert(`Resumes for ${roleType} synced successfully!`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Failed to sync: ' + (error.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStar = async (resumeId, currentStatus) => {
    try {
      await toggleStarResumes([resumeId], !currentStatus);
      fetchResumes();
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleBulkStar = async (isStarred) => {
    if (selectedResumes.length === 0) return;
    try {
      await toggleStarResumes(selectedResumes, isStarred);
      setSelectedResumes([]);
      fetchResumes();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedResumes.length === 0) return;
    try {
      await bulkUpdateResumeStatus(selectedResumes, status);
      setSelectedResumes([]);
      fetchResumes();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      const response = await getResumeDownloadUrl(resumeId);
      // Create a temporary link to force download
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.setAttribute('download', response.fileName || 'resume');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to get download link');
    }
  };

  const handlePreviewResume = async (resumeId, fileName) => {
    try {
      const response = await getResumeDownloadUrl(resumeId);
      setPreviewUrl(response.downloadUrl);
      setPreviewFileName(fileName || response.fileName || 'Resume');
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Failed to load resume preview');
    }
  };

  const handleViewDetails = async (resumeId) => {
    try {
      const response = await getResumeDetails(resumeId);
      setSelectedResume(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  const handleUpdateResume = async (resumeId, data) => {
    try {
      await updateResumeDetails(resumeId, data);
      setShowDetailModal(false);
      fetchResumes();
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedResumes(resumes.map(r => r.id));
    } else {
      setSelectedResumes([]);
    }
  };

  const handleSelectResume = (resumeId) => {
    setSelectedResumes(prev => 
      prev.includes(resumeId) 
        ? prev.filter(id => id !== resumeId)
        : [...prev, resumeId]
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resume Bank</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage {stats?.total?.toLocaleString() || 0} resumes from SharePoint
          </p>
        </div>
        <div className="relative">
          {syncing ? (
            <button disabled className="px-4 py-2 rounded-lg opacity-50 flex items-center gap-2" style={{ backgroundColor: '#2563eb', color: '#fff' }}>
              <FiLoader className="animate-spin" size={20} />
              Syncing from {syncSource === 'sharepoint' ? 'SharePoint' : 'S3'}...
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowSyncMenu(!showSyncMenu)}
                className="px-4 py-2 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: '#2563eb', color: '#fff' }}
              >
                <FiRefreshCw size={18} />
                Refresh Resumes
                <FiChevronDown size={16} />
              </button>
              {showSyncMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                  <button
                    onClick={() => handleSync('s3')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-3"
                  >
                    <span className="text-orange-500 text-lg">☁️</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Sync from AWS S3</p>
                      <p className="text-xs text-gray-500">Import from S3 bucket</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleSync('sharepoint')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg flex items-center gap-3 border-t dark:border-gray-700"
                  >
                    <span className="text-blue-500 text-lg">📁</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Sync from SharePoint</p>
                      <p className="text-xs text-gray-500">Import from SharePoint drive</p>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* Total Resumes */}
          <div
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: 'var(--bg-modal, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.15)'
            }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
              <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}></div>
            </div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Total Resumes</p>
                <p className="text-3xl font-extrabold mt-1" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stats.total?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
                <FiDatabase size={20} color="#ffffff" />
              </div>
            </div>
          </div>

          {/* Recently Added */}
          <div
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: 'var(--bg-modal, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.15)'
            }}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
              <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)' }}></div>
            </div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>Recently Added</p>
                <p className="text-3xl font-extrabold mt-1" style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stats.recentlyAdded?.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #4f46e5)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                <FiClock size={20} color="#ffffff" />
              </div>
            </div>
          </div>

          {/* Status cards */}
          {stats.byStatus && Object.entries(stats.byStatus).slice(0, 4).map(([status, count]) => (
            <div
              key={status}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: 'var(--bg-modal, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.15)'
              }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
                <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}></div>
              </div>
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>{status}</p>
                  <p className="text-3xl font-extrabold mt-1" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {count?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
                  <FiCheckCircle size={20} color="#ffffff" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, skills, role..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          {/* Role Filter */}
          <select
            value={filters.roleType}
            onChange={(e) => handleFilterChange('roleType', e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Roles</option>
            {roleTypes.map(role => (
              <option key={role.name} value={role.name}>{role.name} ({role.count})</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Starred Filter */}
          <select
            value={filters.isStarred}
            onChange={(e) => handleFilterChange('isStarred', e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All</option>
            <option value="true">Starred Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedResumes.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg flex items-center justify-between">
          <span className="text-blue-800 dark:text-blue-200">
            {selectedResumes.length} resume(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStar(true)}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ⭐ Star Selected
            </button>
            <select
              onChange={(e) => e.target.value && handleBulkStatus(e.target.value)}
              className="px-3 py-1 border rounded bg-white dark:bg-gray-700"
              defaultValue=""
            >
              <option value="" disabled>Change Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button
              onClick={() => setSelectedResumes([])}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Resume Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedResumes.length === resumes.length && resumes.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Star</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    <svg className="animate-spin mx-auto" style={{ width: 32, height: 32, color: '#3b82f6' }} viewBox="0 0 24 24">
                      <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="mt-2">Loading resumes...</p>
                  </td>
                </tr>
              ) : resumes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No resumes found. Click "Sync Resumes" to import from S3 or SharePoint.
                  </td>
                </tr>
              ) : (
                resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedResumes.includes(resume.id)}
                        onChange={() => handleSelectResume(resume.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStar(resume.id, resume.isStarred)}
                        className="hover:scale-110 transition-transform"
                      >
                        <FiStar size={18} style={{ color: resume.isStarred ? '#eab308' : '#9ca3af', fill: resume.isStarred ? '#eab308' : 'none' }} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {resume.fileType === 'pdf' ? <FiFileText size={18} style={{ color: '#ef4444' }} /> : <FiFile size={18} style={{ color: '#6b7280' }} />}
                        <button
                          onClick={() => handlePreviewResume(resume.id, resume.fileName)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px] text-left"
                          title="Click to preview"
                        >
                          {resume.fileName}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-sm">
                        {resume.roleType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {resume.candidateName || '-'}
                        </p>
                        {resume.email && (
                          <p className="text-gray-500 text-xs">{resume.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={statusColors[resume.status] || { backgroundColor: '#f3f4f6', color: '#374151' }}>
                        {resume.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatFileSize(resume.fileSize)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(resume.id)}
                          className="p-1 rounded hover:opacity-80"
                          title="Download"
                        >
                          <FiDownload size={18} style={{ color: '#2563eb' }} />
                        </button>
                        <button
                          onClick={() => handlePreviewResume(resume.id, resume.fileName)}
                          className="p-1 rounded hover:opacity-80"
                          title="Preview Resume"
                        >
                          <FiEye size={18} style={{ color: '#16a34a' }} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Type Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Roles Overview</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {roleTypes.map(role => (
                <div 
                  key={role.name}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handleFilterChange('roleType', filters.roleType === role.name ? '' : role.name)}
                >
                  <span className={`text-sm truncate ${filters.roleType === role.name ? 'font-semibold text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {role.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {role.count}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSyncRole(role.name); }}
                      title={`Sync ${role.name}`}
                    >
                      <FiRefreshCw size={14} style={{ color: '#3b82f6' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Roles Chart (simple bar representation) */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Top Roles Distribution</h3>
            <div className="space-y-3">
              {stats?.topRoles?.slice(0, 5).map(role => {
                const percentage = (role.count / stats.total) * 100;
                return (
                  <div key={role._id} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-gray-600 dark:text-gray-400 truncate">{role._id}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">{role.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white truncate">{previewFileName}</h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
                  style={{ backgroundColor: '#2563eb', color: '#fff' }}
                >
                  <FiDownload size={16} />
                  Download
                </a>
                <button
                  onClick={() => { setShowPreviewModal(false); setPreviewUrl(null); }}
                  className="p-1"
                  style={{ color: '#6b7280' }}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {previewFileName.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Resume Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <FiFileText size={64} style={{ color: '#9ca3af' }} />
                  <p className="text-gray-500 dark:text-gray-400">Preview not available for this file type</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedResume && (
        <ResumeDetailModal
          resume={selectedResume}
          onClose={() => setShowDetailModal(false)}
          onUpdate={handleUpdateResume}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
};

// Resume Detail Modal Component
const ResumeDetailModal = ({ resume, onClose, onUpdate, statusOptions }) => {
  const [formData, setFormData] = useState({
    candidateName: resume.candidateName || '',
    email: resume.email || '',
    phone: resume.phone || '',
    experience: resume.experience || '',
    skills: resume.skills?.join(', ') || '',
    currentCompany: resume.currentCompany || '',
    currentLocation: resume.currentLocation || '',
    preferredLocation: resume.preferredLocation || '',
    currentSalary: resume.currentSalary || '',
    expectedSalary: resume.expectedSalary || '',
    noticePeriod: resume.noticePeriod || '',
    status: resume.status || 'Available',
    rating: resume.rating || 0,
    contactNotes: resume.contactNotes || '',
    tags: resume.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    onUpdate(resume.id, updateData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{resume.fileName}</h2>
              <p className="text-sm text-gray-500">{resume.roleType}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Candidate Name</label>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label>
                <input
                  type="text"
                  placeholder="e.g., 3-5 years"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company</label>
                <input
                  type="text"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({...formData, currentCompany: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Location</label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData({...formData, preferredLocation: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notice Period</label>
                <input
                  type="text"
                  placeholder="e.g., 30 days"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({...formData, noticePeriod: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Salary</label>
                <input
                  type="text"
                  value={formData.currentSalary}
                  onChange={(e) => setFormData({...formData, currentSalary: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Salary</label>
                <input
                  type="text"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({...formData, expectedSalary: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="React, Node.js, Python"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="urgent, senior, remote"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className={`text-2xl ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Notes</label>
              <textarea
                value={formData.contactNotes}
                onChange={(e) => setFormData({...formData, contactNotes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="Notes about conversations..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResumeBankTab;
