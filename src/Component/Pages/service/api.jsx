import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

// API base URL from environment variable
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// Create axios instance with specific headers
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
  },
  withCredentials: false  // Changed to false since the server might not be expecting credentials
});

// Remove the default headers configuration since we're setting them in the instance
// axios.defaults.headers.common['Content-Type'] = 'application/json';
// axios.defaults.headers.common['Accept'] = 'application/json';

const saveToken = (token, userType, name, department) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
    if (name) localStorage.setItem('userName', name);
    if (department) localStorage.setItem('department', department);
    setAuthToken(token);
  }
};

const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};
export const getStoredAuthToken = () => {
  const rawToken = localStorage.getItem('token');
  if (!rawToken) return null;

  const sanitized = String(rawToken).replace(/^"|"$/g, '').trim();
  if (!sanitized || sanitized === 'null' || sanitized === 'undefined') return null;

  return sanitized;
};

// Add request interceptor to always use fresh token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle expired/invalid tokens globally
let _sessionExpiredShown = false;
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isMockToken = getStoredAuthToken()?.endsWith('.mock-signature');

    if (error.response?.status === 401 && !_sessionExpiredShown) {
      const isLoginRoute = window.location.pathname.includes('/login') || window.location.pathname === '/';
      const errorMessage = error.response.data?.message?.toLowerCase() || "";
      const isAuthError = errorMessage.includes('token') || errorMessage.includes('session') || errorMessage.includes('auth') || errorMessage.includes('expired');
      const isBlockOrPasswordChange = errorMessage.includes('blocked') || errorMessage.includes('disabled') || errorMessage.includes('password has changed') || errorMessage.includes('password changed');

      if (!isLoginRoute && (isAuthError || isBlockOrPasswordChange || !error.response.data?.message)) {
        // Only auto-logout if NOT using a mock token, OR if it's explicitly a block or password change
        if (!isMockToken || isBlockOrPasswordChange) {
          _sessionExpiredShown = true;
          toast.error(isBlockOrPasswordChange ? error.response.data?.message || 'Access denied / Password changed. Logging out...' : 'Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('userName');
          localStorage.removeItem('department');
          setTimeout(() => { _sessionExpiredShown = false; window.location.href = '/'; }, 1500);
        } else {
          console.warn('API returned 401 for mock token. Ignoring auto-logout redirect.');
        }

      } else if (error.response.data?.message) {
        // If it's a 401 but not auth-related (misconfigured backend), just show the error
        toast.error(error.response.data.message);
      }
    }
    return Promise.reject(error);
  }
);


// Update the login function to include specific headers
export const superAdminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/superAdmin/login', credentials);
    if (response.data.token) {
      saveToken(response.data.token, 'superAdmin', response.data.user?.name, response.data.user?.department);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || error.message;
  }
};

export const getSuperAdminDashboardStats = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/superAdmin/dashboard-stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch dashboard stats. Please try again.'
    };
  }
};

export const getDashboardKpiDetails = async (type) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/superAdmin/dashboard-kpi-details', {
      params: { type },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch dashboard KPI details. Please try again.'
    };
  }
};

// Similar updates for other login functions
export const adminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/admin/login', credentials);
    if (response.data.token) {
      saveToken(response.data.token, 'admin', response.data.user?.name, response.data.user?.department);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const teamLeaderLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/teamLeader/login', credentials);
    if (response.data.token) {
      saveToken(response.data.token, 'teamLeader', response.data.user?.name, response.data.user?.department);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const employeeLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/employee/login', credentials);
    if (response.data.token) {
      saveToken(response.data.token, 'employee');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const departmentTeamLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/department/login', credentials);
    if (response.data.token) {
      const dept = response.data.user?.department;
      const userType = dept === 'HR Operations' ? 'hrOperations' : (dept === 'HR Recruitment' ? 'hrRecruitment' : 'departmentTeam');
      saveToken(response.data.token, userType, response.data.user?.name, dept);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update the clientSignup function
export const clientSignup = async (clientData) => {
  try {
    const response = await axiosInstance.post('/client/signup', {
      name: clientData.name,
      email: clientData.email,
      companyName: clientData.companyName,
      corporateAddress: clientData.corporateAddress,
      contactNumber: clientData.contactNumber,
      gstNumber: clientData.gstNumber,
      panNumber: clientData.panNumber,
      cinNumber: clientData.cinNumber,
      numberOfCompanies: clientData.numberOfCompanies,
      spocName: clientData.spocName,
      spocContact: clientData.spocContact,
      website: clientData.website,
      authorizedSignatory: {
        name: clientData.authorizedSignatory.name,
        email: clientData.authorizedSignatory.email,
        contact: clientData.authorizedSignatory.contact
      },
      ownerDirectorDetails: clientData.ownerDirectorDetails
    });

    // If signup is successful, set the token in axios headers
    if (response.data.token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    if (error.response) {
      throw {
        message: error.response.data.message || 'Registration failed',
        status: error.response.status
      };
    }
    throw {
      message: 'Network error. Please check your connection.',
      status: 500
    };
  }
};

export const uploadAdminImage = async (adminId, image) => {
  const formData = new FormData();
  formData.append("adminId", adminId);
  formData.append("image", image);

  const token = localStorage.getItem('token');

  try {
    const response = await axios.post(`${BASE_URL}/admin/uploadDP`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload image' };
  }
};


export const getAllTeamLeaders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/teamLeader/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all team leaders:', error);
    throw error.response?.data || { message: 'Failed to fetch team leaders.' };
  }
};

export const createAdmin = async (adminData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/admin/create', {
      name: adminData.name,
      email: adminData.email
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create admin:', error);
    throw error.response?.data || {
      message: 'Failed to create admin. Please try again.'
    };
  }
};

export const getAllAdmins = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    throw error.response?.data || {
      message: 'Failed to fetch admins. Please try again.'
    };
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/admin/delete', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { adminId }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete admin:', error);
    throw error.response?.data || {
      message: 'Failed to delete admin. Please try again.'
    };
  }
};


export const clientLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/client/login', credentials);
    if (response.data.token) {
      saveToken(response.data.token, 'client');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const candidateLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/login', credentials);
    if (response.data.token) {
      saveToken(response.data.token, 'candidate', response.data.data?.name);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadCandidateKYC = async (formData) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/upload-kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitCandidateKYC = async () => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/submit-kyc');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCandidateProfile = async () => {
  try {
    const response = await axiosInstance.get('/recruitment/candidate/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyCandidateKYC = async (data) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/verify-kyc', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const bulkVerifyCandidateKYC = async (data) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/bulk-verify-kyc', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const attachFinalOfferLetter = async (formData) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/attach-final-offer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateCandidateCredentials = async (candidateId) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/generate-credentials', { candidateId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const shareCandidateCredentials = async (candidateId) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidate/share-credentials', { candidateId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Task-related API endpoints
export const requestTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/task/requestTask', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const assignOrRejectTask = async (taskData) => {
  try {
    const response = await axiosInstance.post('/task/accept-or-reject', {
      requestedTaskId: taskData.requestedTaskId,
      teamLeaderId: taskData.teamLeaderId,
      action: taskData.action,
      assignedUserId: taskData.assignedUserId,
      assignedUserType: taskData.assignedUserType,
      rejectionReason: taskData.rejectionReason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getRequestedTasks = async (teamLeaderId) => {
  try {
    const response = await axiosInstance.get('/task/requested-tasks', {
      params: { teamLeaderId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const response = await axiosInstance.put('/task/update-status', {
      taskId: taskId,
      status: status
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to update task status. Please try again.'
    };
  }
};

export const deleteTask = async (taskId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/task/delete', {
      taskId: taskId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete task. Please try again.'
    };
  }
};


export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPicture');
  localStorage.removeItem('department');
  localStorage.removeItem('recruitmentTabAuth');
  setAuthToken(null);
};

export const updateAdmin = async (adminId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/admin/edit', {
      adminId: adminId,
      password: updateData.password
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to update admin password. Please try again.'
    };
  }
};
export const updateTeamleader = async (teamLeaderId, updateData) => {

}

export const updateEmployee = async (employeeId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/employee/edit', {
      id: employeeId,
      ...updateData
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to update employee details. Please try again.'
    };
  }
};

export const resetEmployeePassword = async (employeeId, newPassword, status) => {
  try {
    const token = localStorage.getItem('token');
    const body = { id: employeeId };
    if (newPassword) body.password = newPassword;
    if (status) body.status = status;
    
    const response = await axiosInstance.put('/employee/edit', body, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to reset employee password. Please try again.'
    };
  }
};
// Add this new API endpoint
export const createTeamLeader = async (teamLeaderData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/teamLeader/create', {
      name: teamLeaderData.name,
      email: teamLeaderData.email,
      adminId: teamLeaderData.adminId,
      phone: teamLeaderData.phone,
      department: teamLeaderData.department,
      role: teamLeaderData.role,
      documents: teamLeaderData.documents
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to create team leader. Please try again.'
    };
  }
};

// Add this new API endpoint
export const createEmployee = async (employeeData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/employee/create', {
      name: employeeData.name,
      email: employeeData.email,
      teamLeaderIds: Array.isArray(employeeData.teamLeaderId) ? employeeData.teamLeaderId : (employeeData.teamLeaderId ? [employeeData.teamLeaderId] : []),
      phone: employeeData.phone,
      bankAccount: employeeData.bankAccount,
      pfNumber: employeeData.pfNumber,
      uanNumber: employeeData.uanNumber,
      basicSalary: employeeData.basicSalary,
      hra: employeeData.hra,
      otherAllowances: employeeData.otherAllowances,
      deductions: employeeData.deductions,
      leaveBalance: employeeData.leaveBalance,
      department: employeeData.department,
      role: employeeData.role,
      documents: employeeData.documents
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to create employee. Please try again.'
    };
  }
};

// Update the getAdminHierarchy API endpoint
export const getAdminHierarchy = async (id, role) => {
  try {
    const token = localStorage.getItem('token');
    const endpoint = role === 'TeamLeader' ? '/teamLeader/hierarchy' : '/admin/hierarchy';

    const response = await axiosInstance.post(endpoint, {
      [role === 'TeamLeader' ? 'teamLeaderId' : 'adminId']: id
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('API Response:', response.data); // Debug log

    // Return the response data directly without transformation
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data || {
      message: 'Failed to fetch hierarchy. Please try again.'
    };
  }
};

// Add this new API endpoint to get all clients
export const getAllClients = async (params = {}) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/client/all', {
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch clients. Please try again.'
    };
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/employee/delete', {
      data: { employeeId },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete employee. Please try again.'
    };
  }
};

export const deleteTeamLeader = async (teamLeaderId, newTeamLeaderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/teamLeader/deleteTeamLeaderWithReassignment', {
      data: {
        teamLeaderId,
        newTeamLeaderId
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete team leader. Please try again.'
    };
  }
};

// Add this new API endpoint for admin tasks
export const getAllTasks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/task/allTasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch all tasks. Please try again.'
    };
  }
};

// Add this new function to handle document uploads
export const uploadClientDocuments = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/client/upload-documents`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // You can emit this progress to your component if needed
          console.log('Upload progress:', percentCompleted);
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data || {
      message: 'Failed to upload documents. Please try again.'
    };
  }
};

// Add new function for creating task by Team Leader
export const createTaskForEmployee = async (taskData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/task/createTaskForEmployeeByTL', {
      title: taskData.title,
      description: taskData.description,
      assignedEmployeeID: taskData.assignedEmployeeID,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      teamLeaderId: taskData.teamLeaderId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to create task. Please try again.'
    };
  }
};

// ... existing imports and code ...





export const onboardClient = async (clientData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/client/onboard-client', clientData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to onboard client. Please try again.'
    };
  }
};

// Add this new API endpoint for deleting a client
export const deleteClient = async (clientId) => {
  try {
    const token = localStorage.getItem('token'); // Get the token from local storage
    const response = await axiosInstance.delete('/client/delete', {
      data: { clientId }, // Send the clientId in the request body
      headers: {
        Authorization: `Bearer ${token}` // Include the token in the headers
      }
    });
    return response.data; // Return the response data
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete client. Please try again.'
    };
  }
};

export const getDeptRegularizations = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/regularizations', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department regularizations:', error);
    throw error.response?.data || { message: 'Failed to fetch department regularizations' };
  }
};

export const approveRegularization = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/department/regularizations/${id}/approve`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to approve regularization:', error);
    throw error.response?.data || { message: 'Failed to approve regularization' };
  }
};

export const getClientRequestedTasks = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/task/requested-tasks', {
      teamLeaderId: clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch client requested tasks. Please try again.'
    };
  }
};

// Team Performance API
export const fetchTeamPerformanceData = async (department = '') => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/department/members', {
      params: { 
        department: department === 'All Departments' ? '' : department,
        includeStats: 'true' 
      },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team performance:', error);
    throw error.response?.data || { message: 'Failed to fetch team performance.' };
  }
};

// Function to get user profile image
export const getUserProfileImage = async (role, adminId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post(`/${role}/dp`, { adminId }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch profile image'
    };
  }
};

// New function to upload admin profile image
export const uploadAdminProfileImage = async (imageFile, adminId) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('adminId', adminId);

    const response = await axiosInstance.post('/admin/uploadDP', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // Important for file upload
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted + '%');
      }
    });

    return response.data;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw error.response?.data || {
      message: 'Failed to upload profile image. Please try again.'
    };
  }
};

// Function to upload client profile image
export const uploadClientProfileImage = async (imageFile, clientId) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('clientId', clientId);

    const response = await axiosInstance.post('/client/uploadDP', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  } catch (error) {
    console.error('Client image upload error:', error);
    throw error.response?.data || {
      message: 'Failed to upload logo'
    };
  }
};

// Add this to your api.jsx file
export const createTaskByTL = async (taskData) => {
  try {
    console.log('Creating task with data:', taskData);
    const token = localStorage.getItem('token');
    console.log('Using token:', token);

    // Use axiosInstance instead of fetch and use the correct endpoint
    const response = await axiosInstance.post('/task/createTaskByTL', taskData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error in createTaskByTL:', error);
    throw error.response?.data || {
      message: 'Failed to create task. Please try again.'
    };
  }
};

// Add this new API endpoint to get team leader hierarchy
export const getTeamLeaderHierarchy = async (teamLeaderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/teamLeader/hierarchy', {
      teamLeaderId: teamLeaderId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Team Leader Hierarchy Response:', response.data); // Debug log

    return response.data;
  } catch (error) {
    console.error('Failed to fetch team leader hierarchy:', error);
    throw error.response?.data || {
      message: 'Failed to fetch team leader hierarchy. Please try again.'
    };
  }
};

// First, move the getTeamLeaderDetails function definition before the default export
export const getTeamLeaderDetails = async (teamLeaderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/teamLeader/getTeamLeaderDetails', {
      teamLeaderId: teamLeaderId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team leader details:', error);
    throw error.response?.data || {
      message: 'Failed to fetch team leader details. Please try again.'
    };
  }
};

// Add this new API endpoint to get all notifications
export const getAllNotifications = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/notification/get-all', { userId }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch notifications. Please try again.'
    };
  }
};

// Add this new API endpoint to mark a notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/notification/mark-read', { notificationId }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to mark notification as read. Please try again.'
    };
  }
};

// Add this new API endpoint to mark a notification as unread
export const markNotificationUnread = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/notification/mark-unread', { notificationId }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to mark notification as unread. Please try again.'
    };
  }
};

// Add this new API endpoint to mark all notifications as read
export const markAllNotificationsRead = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/notification/mark-all-read', { userId }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to mark all notifications as read. Please try again.'
    };
  }
};

// Add this new API endpoint to delete one notification
export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/notification/delete-one', {
      data: { notificationId },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete notification. Please try again.'
    };
  }
};

// FINANCE / ACCOUNTS API
export const getClientAccounts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/finance/accounts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client accounts:', error);
    throw error.response?.data || { message: 'Failed to fetch accounts' };
  }
};

export const getAccountDetails = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/finance/account/${clientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching account details:', error);
    throw error.response?.data || { message: 'Failed to fetch account details' };
  }
};

export const seedFinanceData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/finance/seed', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error seeding finance data:', error);
  }
};

export const createReport = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/reports/create', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error.response?.data || { message: 'Failed to create report' };
  }
};

export const getClientReports = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/reports/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error.response?.data || { message: 'Failed to fetch reports' };
  }
};

export const seedReports = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/reports/seed', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error seeding reports:', error);
    throw error.response?.data || { message: 'Failed to seed reports' };
  }
};

export const getClientMeetings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/meetings/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error.response?.data || { message: 'Failed to fetch meetings' };
  }
};

export const createClientMeeting = async (meetingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/meetings/create', meetingData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error.response?.data || { message: 'Failed to create meeting' };
  }
};

export const seedClientMeetings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/meetings/seed', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error seeding meetings:', error);
    throw error.response?.data || { message: 'Failed to seed meetings' };
  }
};

// Duplicate functions removed. Correct endpoints are registered below under /clientMeeting/

export const createClient = async (clientData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/client/create', clientData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error.response?.data || { message: 'Failed to create client' };
  }
};

// Add this new API endpoint to delete all notifications
export const deleteAllNotifications = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/notification/delete-all', {
      data: { userId },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete all notifications. Please try again.'
    };
  }
};

// Add these chat-related API functions

// Get chat history between two users
export const getChatHistory = async (userId1, userId2) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/chat/messages/${userId1}/${userId2}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to fetch chat history. Please try again.'
    };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/chat/messages/read', {
      senderId,
      receiverId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to mark messages as read. Please try again.'
    };
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/chat/messages/unread/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to get unread message count. Please try again.'
    };
  }
};

// Add this new API endpoint to get client details
export const getClientDetails = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/client/getClientDetails', {
      clientId: clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Client details response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Failed to fetch client details:', error);
    throw error.response?.data || {
      message: 'Failed to fetch client details. Please try again.'
    };
  }
};

// Add this new API endpoint for client password reset
export const resetClientPassword = async (clientId, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('client/edit', {
      clientId: clientId,
      newPassword: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error.response?.data || {
      message: 'Failed to reset password. Please try again.'
    };
  }
};

// Add this new API endpoint to get client documents
export const getClientDocuments = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/client/getClientDocuments',
      { clientId: clientId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch client documents:', error);
    throw error.response?.data || {
      message: 'Failed to fetch client documents. Please try again.'
    };
  }
};

// Add this new API endpoint for forgot password
export const forgotPassword = async ({ email }) => {
  try {
    const response = await axiosInstance.post('/admin/forgot-password',
      { email },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error.response?.data || {
      message: 'Failed to process forgot password request. Please try again.'
    };
  }
};

// Add this new API endpoint for password reset with token in params
// export const resetPassword = async ({ token, newPassword }) => {
//   try {
//     const response = await axiosInstance.post(`/admin/reset-password/${token}`, 
//       { 
//         newPassword 
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('Reset password response:', response.data); // Debug log
//     return response.data;
//   } catch (error) {
//     console.error('Reset password error:', error);
//     throw error.response?.data || {
//       message: 'Failed to reset password. Please try again.'
//     };
//   }
// };

// Add these new functions for password reset

// Request password reset
export const requestPasswordReset = async (email, userType) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
      userType
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to request password reset. Please try again.'
    };
  }
};

// Reset password with token
export const resetPassword = async (password, token, userType) => {
  try {
    const response = await axiosInstance.post(`/auth/reset-password/`, {
      password: password,
      userType: token,
      token: userType
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to reset password. Please try again.'
    };
  }
};

// Add this new API endpoint for getting employee tasks
// Update the API endpoint for getting employee tasks
export const getEmployeeTasks = async (employeeId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/task/getTasksByAssignedUser',
      { userId: employeeId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return {
      success: true,
      tasks: response.data?.tasks || []
    };
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    throw error.response?.data || {
      message: 'Failed to fetch employee tasks. Please try again.'
    };
  }
};

// Add this new API endpoint to get all recurring tasks
export const getAllRecurringTasks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/task/getAllRecurringTasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recurring tasks:', error);
    throw error.response?.data || {
      message: 'Failed to fetch recurring tasks. Please try again.'
    };
  }
};

// Add this new API endpoint to delete or deactivate recurring task
export const deleteOrDeactivateRecurringTask = async (recurringTaskId, action) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/task/deleteOrDeactivateRecurringTask', {
      recurringTaskId,
      action // 'delete' or 'deactivate'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to modify recurring task:', error);
    throw error.response?.data || {
      message: `Failed to ${action} recurring task. Please try again.`
    };
  }
};

// Add this new API endpoint to get recurring tasks for team leader
export const getRecurringTasksByTeamLeader = async (teamLeaderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/task/getRecurringTasksForTL', {
      teamLeaderId: teamLeaderId,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team leader recurring tasks:', error);
    throw error.response?.data || {
      message: 'Failed to fetch recurring tasks. Please try again.'
    };
  }
};

// KAM Productivity Dashboard
export const getKamProductivity = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/task/kam-productivity', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KAM productivity:', error);
    throw error.response?.data || {
      message: 'Failed to fetch KAM productivity data. Please try again.'
    };
  }
};

// ── Work Agreement APIs ──
export const createWorkAgreement = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/workAgreement/create', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create work agreement.' };
  }
};

export const getWorkAgreements = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/workAgreement/all', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch work agreements.' };
  }
};

export const getWorkAgreementSummary = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/workAgreement/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch agreement summary.' };
  }
};

export const updateWorkAgreement = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/workAgreement/update', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update work agreement.' };
  }
};

export const deleteWorkAgreement = async (agreementId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/workAgreement/delete', {
      data: { agreementId },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete work agreement.' };
  }
};

// ── Work Handover API functions ──
export const createWorkHandover = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/workHandover/create', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create work handover.' };
  }
};

export const getWorkHandovers = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/workHandover/all', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch work handovers.' };
  }
};

export const updateWorkHandover = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/workHandover/update/${id}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update work handover.' };
  }
};

export const changeHandoverStatus = async (id, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/workHandover/status/${id}`, { status }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change handover status.' };
  }
};

export const deleteWorkHandover = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/workHandover/delete/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete work handover.' };
  }
};

export const editClient = async (clientData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/client/edit', {
      clientId: clientData.clientId,
      name: clientData.name,
      password: clientData.password,
      companyName: clientData.companyName,
      corporateAddress: clientData.corporateAddress,
      contactNumber: clientData.contactNumber,
      gstNumber: clientData.gstNumber,
      panNumber: clientData.panNumber,
      cinNumber: clientData.cinNumber,
      numberOfCompanies: clientData.numberOfCompanies,
      website: clientData.website,
      authorizedSignatory: clientData.authorizedSignatory ? {
        name: clientData.authorizedSignatory.name,
        email: clientData.authorizedSignatory.email,
        contact: clientData.authorizedSignatory.contact
      } : undefined,
      ownerDirectorDetails: clientData.ownerDirectorDetails,
      teamLeaderId: clientData.teamLeaderId,
      city: clientData.city,
      pinCode: clientData.pinCode,
      ownerName: clientData.ownerName,
      ownerEmail: clientData.ownerEmail,
      agreementType: clientData.agreementType,
      agreementEffectiveDate: clientData.agreementEffectiveDate,
      feeAmount: clientData.feeAmount,
      paymentTerms: clientData.paymentTerms,
      shopsLicense: clientData.shopsLicense,
      factoryLicense: clientData.factoryLicense,
      msmeRegistered: clientData.msmeRegistered,
      totalEmployees: clientData.totalEmployees,
      payrollCycle: clientData.payrollCycle,
      pfApplicable: clientData.pfApplicable,
      esicApplicable: clientData.esicApplicable,
      leadSource: clientData.leadSource,
      onboardingNotes: clientData.onboardingNotes,
      assignKAM: clientData.assignKAM,
      stage: clientData.stage,
      status: clientData.status,
      probability: clientData.probability
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to edit client details:', error);
    throw error.response?.data || {
      message: 'Failed to update client details. Please try again.'
    };
  }
};

// Delete team leader and reassign employees to another team leader
export const deleteTeamLeaderWithReassignment = async ({ teamLeaderId, newTeamLeaderId }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/teamLeader/deleteTeamLeaderWithReassignment', {
      data: {
        teamLeaderId,
        newTeamLeaderId
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete team leader and reassign employees. Please try again.'
    };
  }
};

// Delete team leader and promote an employee to team leader
export const deleteTeamLeaderAndPromoteEmployee = async ({ oldTeamLeaderId, employeeToPromoteId }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/teamLeader/deleteTeamLeaderAndPromoteEmployee', {
      data: {
        oldTeamLeaderId,
        employeeToPromoteId
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: 'Failed to delete team leader and promote employee. Please try again.'
    };
  }
};

// Add this new API endpoint for recruitment requests
export const createRecruitmentRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/create-request', {
      title: requestData.position || requestData.name,
      description: `Qualifications: ${requestData.qualification || ''}, Notice Period: ${requestData.noticePeriod || ''}`,
      location: `${requestData.currLocation || requestData.currentLocation || ''} ${requestData.preferredLocation ? `/ ${requestData.preferredLocation}` : ''}`.trim(),
      type: 'Full-time',
      salary: requestData.salary,
      skills: requestData.keywords ? requestData.keywords.split(',').map(s => s.trim()) : [],
      experience: requestData.experience,
      teamLeaderId: requestData.teamLeaderId,
      clientId: requestData.clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create recruitment request:', error);
    throw error.response?.data || {
      message: 'Failed to create recruitment request. Please try again.'
    };
  }
};

// Add this new API endpoint for accepting recruitment requests
export const acceptRecruitmentRequest = async (acceptData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/accept', {
      reason: acceptData.reason,
      teamLeaderId: acceptData.teamLeaderId,
      clientId: acceptData.clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to accept recruitment request:', error);
    throw error.response?.data || {
      message: 'Failed to accept recruitment request. Please try again.'
    };
  }
};

// Add this new API endpoint for rejecting recruitment requests
export const rejectRecruitmentRequest = async (rejectData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/reject', {
      reason: rejectData.reason,
      teamLeaderId: rejectData.teamLeaderId,
      clientId: rejectData.clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to reject recruitment request:', error);
    throw error.response?.data || {
      message: 'Failed to reject recruitment request. Please try again.'
    };
  }
};

// Add this new API endpoint to get recruitment requests


export const getRecruitmentRequests = async (teamLeaderid) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/recruitment/getRequests', {
      params: { teamLeaderid },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recruitment requests:', error);
    throw error.response?.data || {
      message: 'Failed to fetch recruitment requests. Please try again.'
    };
  }
};

// Add this new API endpoint for uploading resumes
export const uploadResumes = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/recruitment/upload-resumes`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // You can emit this progress to your component if needed
          console.log('Upload progress:', percentCompleted);
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error.response?.data || {
      message: 'Failed to upload resumes. Please try again.'
    };
  }
};

// Add this new API endpoint to get shortlisted candidates
export const getShortlistedCandidates = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/shortlisted', {
      teamLeaderId: payload.teamLeaderId,
      clientId: payload.clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch shortlisted candidates:', error);
    throw error.response?.data || {
      message: 'Failed to fetch shortlisted candidates. Please try again.'
    };
  }
};

// Add this new function for client requests
export const getClientRequests = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/recruitment/getRequests-client?clientId=${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch client requests:', error);
    throw error.response?.data || {
      message: 'Failed to fetch client requests. Please try again.'
    };
  }
};

// Add function to handle single request details if needed
export const getClientRequestDetails = async (requestId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/recruitment/request/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch request details:', error);
    throw error.response?.data || {
      message: 'Failed to fetch request details. Please try again.'
    };
  }
};

// Add function to create new request if needed
export const createClientRequest = async (requestData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/create-request', requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create request:', error);
    throw error.response?.data || {
      message: 'Failed to create request. Please try again.'
    };
  }
};

// Add these new API endpoints for recruitment candidate actions
export const acceptCandidate = async (acceptData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/accept', {
      reason: acceptData.reason,
      candidateId: acceptData.fileId || acceptData.candidateId || acceptData.recruitmentId, // Map frontend's fileId/recruitmentId to candidateId
      clientId: acceptData.clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to accept candidate:', error);
    throw error.response?.data || {
      message: 'Failed to accept candidate. Please try again.'
    };
  }
};

export const rejectCandidate = async (rejectData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/reject', {
      reason: rejectData.reason,
      candidateId: rejectData.fileId || rejectData.candidateId || rejectData.recruitmentId, // Map frontend's fileId/recruitmentId to candidateId
      clientId: rejectData.clientId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to reject candidate:', error);
    throw error.response?.data || {
      message: 'Failed to reject candidate. Please try again.'
    };
  }
};

// Add this new API endpoint to get recruitment status
export const getRecruitmentStatus = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/status', {
      positionId: payload.recruitmentId || payload.positionId,
      clientId: payload.clientId,
      teamLeaderId: payload.teamLeaderId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recruitment status:', error);
    throw error.response?.data || {
      message: 'Failed to fetch recruitment status. Please try again.'
    };
  }
};


export const scheduleInterview = async (interviewData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/schedule-interview', {
      recruitmentId: interviewData.recruitmentId,
      fileId: interviewData.fileId,
      interviewDate: interviewData.interviewDate,
      interviewTime: interviewData.interviewTime
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to schedule interview:', error);
    throw error.response?.data || {
      message: 'Failed to schedule interview. Please try again.'
    };
  }
};
export const closeRecruitmentRequest = async (closeData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/close-request', {
      recruitmentId: closeData.recruitmentId,
      userType: closeData.userType,
      userId: closeData.userId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to close recruitment request:', error);
    throw error.response?.data || {
      message: 'Failed to close recruitment request. Please try again.'
    };
  }
};

// Update the API endpoint to generate meeting link with additional parameters
export const generateMeetLink = async (meetingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/meet-link', {
      interviewDate: meetingData.interviewDate,
      interviewTime: meetingData.interviewTime,
      clientId: meetingData.clientId,
      candidateEmail: meetingData.candidateEmail,
      recruitmentId: meetingData.recruitmentId,
      fileId: meetingData.fileId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate meeting link:', error);
    throw error.response?.data || {
      message: 'Failed to generate meeting link. Please try again.'
    };
  }
};

// Business Development API Endpoints

// Create a new lead
export const createLead = async (leadData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/bd/leads', leadData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create lead:', error);
    throw error.response?.data || { message: 'Failed to create lead. Please try again.' };
  }
};

// Get all leads
export const getAllLeads = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/leads', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Failed to fetch leads');
  }
};

// Get sales leads (scoped)
export const getSalesLeads = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/sales/leads', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching sales leads:', error);
    throw error;
  }
};

// Get sales meetings (scoped)
export const getSalesMeetings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/sales/meetings', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching sales meetings:', error);
    throw error;
  }
};

// ============ CAMPAIGNS API ============
export const getAllCampaigns = async (type) => {
  try {
    const token = localStorage.getItem('token');
    const params = type ? `?type=${encodeURIComponent(type)}` : '';
    const response = await axiosInstance.get(`/campaigns${params}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error('Failed to fetch campaigns');
  }
};

export const createCampaign = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/campaigns', data, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error.response?.data || { message: 'Failed to create campaign' };
  }
};

export const updateCampaign = async (campaignId, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/campaigns/${campaignId}`, data, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error.response?.data || { message: 'Failed to update campaign' };
  }
};

export const deleteCampaign = async (campaignId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/campaigns/${campaignId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error.response?.data || { message: 'Failed to delete campaign' };
  }
};

// Get BD dashboard statistics
export const getBDDashboardStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/leads/dashboard-stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching BD dashboard stats:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
};

// Get all client meetings
export const getAllMeetings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/meetings/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

// Create client meeting
export const createMeeting = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/meetings/create', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Update client meeting status
export const updateMeetingStatus = async (meetingId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/meetings/update-status', { meetingId, status }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating meeting status:', error);
    throw error;
  }
};

// Delete client meeting
export const deleteMeeting = async (meetingId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete('/meetings/delete', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { meetingId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

// Get lead by ID
export const getLeadById = async (leadId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/bd/leads/${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch lead:', error);
    throw error.response?.data || { message: 'Failed to fetch lead. Please try again.' };
  }
};

// Update lead
export const updateLead = async (leadId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/bd/leads/${leadId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update lead:', error);
    throw error.response?.data || { message: 'Failed to update lead. Please try again.' };
  }
};

// Delete lead
export const deleteLead = async (leadId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/bd/leads/${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete lead:', error);
    throw error.response?.data || { message: 'Failed to delete lead. Please try again.' };
  }
};

// Get all leads for a specific business developer
export const getBusinessDevLeads = async (businessDevId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/bd/leads/business-dev/${businessDevId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    throw error.response?.data || {
      message: 'Failed to fetch leads. Please try again.'
    };
  }
};

// Get all BD executives
export const getAllBDExecutives = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/bd/executives', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch BD executives:', error);
    throw error.response?.data || {
      message: 'Failed to fetch BD executives. Please try again.'
    };
  }
};

// Create a new proposal
export const createProposal = async (proposalData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/bd/proposals', {
      leadId: proposalData.leadId,
      subject: proposalData.subject,
      content: proposalData.content,
      attachments: proposalData.attachments.map(attachment => ({
        fileName: attachment.fileName,
        fileId: attachment.fileId,
        webViewLink: attachment.webViewLink
      }))
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create proposal:', error);
    throw error.response?.data || {
      message: 'Failed to create proposal. Please try again.'
    };
  }
};

// Send a proposal
export const sendProposal = async (proposalData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/bd/leads/send-proposal', proposalData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send proposal:', error);
    throw error.response?.data || {
      message: 'Failed to send proposal. Please try again.'
    };
  }
};

// Send a profile
export const sendProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/bd/leads/send-profile', profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send profile:', error);
    throw error.response?.data || {
      message: 'Failed to send profile. Please try again.'
    };
  }
};

// Business Development API Endpoints
export const createBDExecutive = async (bdData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/bd/create', {
      name: bdData.name,
      email: bdData.email,
      password: bdData.password,
      phone: bdData.phone,
      targetRevenue: bdData.targetRevenue,
      targetLeads: bdData.targetLeads
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create BD executive:', error);
    throw error.response?.data || {
      message: 'Failed to create BD executive. Please try again.'
    };
  }
};

// ============ INTERVIEW MANAGEMENT API ============

// Get all interviews with filters
export const getAllInterviews = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axiosInstance.get(`/interview${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch interviews:', error);
    throw error.response?.data || {
      message: 'Failed to fetch interviews. Please try again.'
    };
  }
};

// Schedule new interview with automatic email
export const scheduleNewInterview = async (interviewData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/interview/schedule', interviewData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to schedule interview:', error);
    throw error.response?.data || {
      message: 'Failed to schedule interview. Please try again.'
    };
  }
};

// Get interview by ID
export const getInterviewById = async (interviewId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/interview/${interviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch interview:', error);
    throw error.response?.data || {
      message: 'Failed to fetch interview. Please try again.'
    };
  }
};

// Get interview by meeting token (for candidate access - no auth required)
export const getInterviewByToken = async (token) => {
  try {
    const response = await axiosInstance.get(`/interview/join/${token}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch interview:', error);
    throw error.response?.data || {
      message: 'Invalid meeting link or interview has expired.'
    };
  }
};

// Get interview feedback form
export const getInterviewFeedbackForm = async (interviewId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/interview/${interviewId}/feedback-form`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch feedback form:', error);
    throw error.response?.data || {
      message: 'Failed to fetch feedback form. Please try again.'
    };
  }
};

// Submit interview feedback/evaluation
export const submitInterviewFeedback = async (interviewId, feedbackData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post(`/interview/${interviewId}/feedback`, feedbackData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error.response?.data || {
      message: 'Failed to submit feedback. Please try again.'
    };
  }
};

// Update interview status
export const updateInterviewStatus = async (interviewId, statusData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/interview/${interviewId}/status`, statusData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update interview status:', error);
    throw error.response?.data || {
      message: 'Failed to update interview status. Please try again.'
    };
  }
};

export const updateInterview = async (interviewId, interviewData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/interview/${interviewId}`, interviewData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update interview:', error);
    throw error.response?.data || {
      message: 'Failed to update interview. Please try again.'
    };
  }
};

// Delete interview permanently
export const deleteInterview = async (interviewId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/interview/${interviewId}/hard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete interview:', error);
    throw error.response?.data || {
      message: 'Failed to delete interview. Please try again.'
    };
  }
};

// Send interview reminder
export const sendInterviewReminder = async (interviewId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post(`/interview/${interviewId}/remind`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send reminder:', error);
    throw error.response?.data || {
      message: 'Failed to send reminder. Please try again.'
    };
  }
};

// Cancel interview
export const cancelInterview = async (interviewId, reason) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/interview/cancel/${interviewId}`, { reason }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to cancel interview:', error);
    throw error.response?.data || {
      message: 'Failed to cancel interview. Please try again.'
    };
  }
};

// ========== RESUME BANK API FUNCTIONS ==========

// Get resume bank statistics
export const getResumeBankStats = async () => {
  try {
    const response = await axiosInstance.get('/api/resumebank/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resume stats:', error);
    throw error.response?.data || { message: 'Failed to fetch statistics' };
  }
};

// Get role types with counts
export const getResumeRoleTypes = async () => {
  try {
    const response = await axiosInstance.get('/api/resumebank/roles');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch role types:', error);
    throw error.response?.data || { message: 'Failed to fetch role types' };
  }
};

// Get resumes with filters
export const getResumeBankResumes = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(`/api/resumebank?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resumes:', error);
    throw error.response?.data || { message: 'Failed to fetch resumes' };
  }
};

// Get single resume details
export const getResumeDetails = async (resumeId) => {
  try {
    const response = await axiosInstance.get(`/api/resumebank/${resumeId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resume details:', error);
    throw error.response?.data || { message: 'Failed to fetch resume details' };
  }
};

export const getAllOffers = async () => {
  try {
    const response = await axiosInstance.get('/recruitment/offers');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    throw error.response?.data || { message: 'Failed to fetch offers' };
  }
};

export const saveOffer = async (offerData) => {
  try {
    const config = offerData instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined;
    const response = await axiosInstance.post('/recruitment/offers', offerData, config);
    return response.data;
  } catch (error) {
    console.error('Failed to save offer:', error);
    throw error.response?.data || { message: 'Failed to save offer' };
  }
};

export const getOfferCandidateSuggestions = async (search) => {
  try {
    const query = new URLSearchParams({ search, limit: 8 }).toString();
    const response = await axiosInstance.get(`/recruitment/offers/candidate-suggestions?${query}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch offer candidate suggestions:', error);
    throw error.response?.data || { message: 'Failed to fetch candidate suggestions' };
  }
};

export const deleteOffer = async (candidateId) => {
  try {
    const response = await axiosInstance.delete(`/recruitment/offers/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete offer:', error);
    throw error.response?.data || { message: 'Failed to delete offer' };
  }
};

export const saveOfferTemplate = async (clientName, templateFile, fieldMap = {}) => {
  try {
    const formData = new FormData();
    formData.append('clientName', clientName);
    formData.append('template', templateFile);
    formData.append('fieldMap', JSON.stringify(fieldMap));
    const response = await axiosInstance.post('/recruitment/offer-templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to save offer template:', error);
    throw error.response?.data || { message: 'Failed to save offer template' };
  }
};

export const getOfferTemplate = async (clientName) => {
  try {
    const response = await axiosInstance.get('/recruitment/offer-templates', {
      params: { clientName }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) return { success: false, data: null };
    console.error('Failed to fetch offer template:', error);
    throw error.response?.data || { message: 'Failed to fetch offer template' };
  }
};

// Update resume details
export const updateResumeDetails = async (resumeId, data) => {
  try {
    const response = await axiosInstance.put(`/api/resumebank/${resumeId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update resume:', error);
    throw error.response?.data || { message: 'Failed to update resume' };
  }
};

// Sync resumes from S3 storage
export const syncResumesFromSharePoint = async (data = {}) => {
  try {
    const response = await axiosInstance.post('/api/resumebank/sync', data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000 // 5 minutes for large syncs
    });
    return response.data;
  } catch (error) {
    console.error('Failed to sync resumes from S3:', error);
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to sync resumes from S3 storage';
    throw {
      message: errorMessage,
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

// Sync resumes from SharePoint Drive
export const syncResumesFromSharePointDrive = async (data = {}) => {
  try {
    const response = await axiosInstance.post('/api/resumebank/sync-sharepoint', data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000 // 5 minutes for large syncs
    });
    return response.data;
  } catch (error) {
    console.error('Failed to sync from SharePoint:', error);
    const errorMessage = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;

    // Check for specific error types
    if (error.response?.status === 404) {
      throw {
        message: 'SharePoint sync endpoint not found. Please contact administrator.',
        status: 404
      };
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw {
        message: 'SharePoint authentication failed. Please check credentials.',
        status: error.response.status
      };
    } else if (error.code === 'ECONNABORTED') {
      throw {
        message: 'Sync timed out. The operation is taking too long.',
        status: 'timeout'
      };
    }

    throw {
      message: errorMessage || 'Failed to sync resumes from SharePoint',
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

// Star/unstar resumes
export const toggleStarResumes = async (resumeIds, isStarred) => {
  try {
    const response = await axiosInstance.post('/api/resumebank/star',
      { resumeIds, isStarred }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update star status:', error);
    throw error.response?.data || { message: 'Failed to update star status' };
  }
};

// Bulk update status
export const bulkUpdateResumeStatus = async (resumeIds, status) => {
  try {
    const response = await axiosInstance.post('/api/resumebank/bulk-status',
      { resumeIds, status }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update status:', error);
    throw error.response?.data || { message: 'Failed to update status' };
  }
};

// Assign resumes to position
export const assignResumesToPosition = async (resumeIds, positionId, assignedTo) => {
  try {
    const response = await axiosInstance.post('/api/resumebank/assign',
      { resumeIds, positionId, assignedTo }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to assign resumes:', error);
    throw error.response?.data || { message: 'Failed to assign resumes to position' };
  }
};

// Get download URL
export const getResumeDownloadUrl = async (resumeId, email = '') => {
  try {
    const response = await axiosInstance.get(`/api/resumebank/${resumeId}/download`, {
      params: email ? { email } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get download URL:', error);
    throw error.response?.data || { message: 'Failed to get download URL' };
  }
};

// Get SharePoint folders
export const getSharePointFolders = async () => {
  try {
    const response = await axiosInstance.get('/api/resumebank/folders');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    throw error.response?.data || { message: 'Failed to fetch S3 folders' };
  }
};

// Deep search resumes (searches inside file content)
export const deepSearchResumes = async (query) => {
  try {
    const response = await axiosInstance.get('/api/resumebank/deep-search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Deep search failed:', error);
    throw error.response?.data || { message: 'Deep search failed' };
  }
};

// SharePoint Drive functions
export const browseSharePointDrive = async (path = '') => {
  try {
    const response = await axiosInstance.get(`/sharepoint/drive/browse?path=${encodeURIComponent(path)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to browse SharePoint:', error);
    throw error.response?.data || { message: 'Failed to browse drive' };
  }
};

export const listSharePointExcelFiles = async () => {
  try {
    const response = await axiosInstance.get('/sharepoint/drive/excel-files');
    return response.data;
  } catch (error) {
    console.error('Failed to list Excel files:', error);
    throw error.response?.data || { message: 'Failed to list Excel files' };
  }
};

export const testSharePointConnection = async () => {
  try {
    const response = await axiosInstance.get('/sharepoint/test');
    return response.data;
  } catch (error) {
    console.error('SharePoint connection test failed:', error);
    throw error.response?.data || { message: 'Connection failed' };
  }
};

export const syncSharePointCandidates = async (listName = 'Candidates') => {
  try {
    const response = await axiosInstance.get(`/sharepoint/sync/candidates?listName=${listName}`);
    return response.data;
  } catch (error) {
    console.error('Failed to sync candidates:', error);
    throw error.response?.data || { message: 'Sync failed' };
  }
};

export const getSharePointCandidates = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/sharepoint/data/candidates', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get candidates:', error);
    throw error.response?.data || { message: 'Failed to fetch candidates' };
  }
};

export const updateSharePointCandidate = async (sharePointId, data) => {
  try {
    const response = await axiosInstance.put(`/sharepoint/candidates/${sharePointId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update SharePoint candidate:', error);
    throw error.response?.data || { message: 'Update failed' };
  }
};

export const getSharePointInterviews = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/sharepoint/data/interviews', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch SharePoint interviews:', error);
    throw error.response?.data || { message: 'Failed to fetch interviews' };
  }
};

export const getSharePointClients = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/sharepoint/data/clients', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch SharePoint clients:', error);
    throw error.response?.data || { message: 'Failed to fetch clients' };
  }
};

export const syncSharePointAll = async () => {
  try {
    const response = await axiosInstance.post('/sharepoint/sync/all');
    return response.data;
  } catch (error) {
    console.error('Failed to sync all SharePoint data:', error);
    throw error.response?.data || { message: 'Sync failed' };
  }
};

export const getSharePointSyncLogs = async () => {
  try {
    const response = await axiosInstance.get('/sharepoint/sync-logs');
    return response.data;
  } catch (error) {
    console.error('Failed to get sync logs:', error);
    throw error.response?.data || { message: 'Failed to fetch logs' };
  }
};

// Get SharePoint Excel workbook sheet names
export const getSharePointExcelSheets = async (fileName) => {
  try {
    const response = await axiosInstance.get(`/sharepoint/excel/sheets?file=${encodeURIComponent(fileName)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Excel sheets:', error);
    throw error.response?.data || { message: 'Failed to fetch Excel sheets' };
  }
};

// Get data from a SharePoint Excel worksheet
export const getSharePointExcelData = async (fileName, sheetName) => {
  try {
    const response = await axiosInstance.get(`/sharepoint/excel/data?file=${encodeURIComponent(fileName)}&sheet=${encodeURIComponent(sheetName)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch Excel data:', error);
    throw error.response?.data || { message: 'Failed to fetch Excel data' };
  }
};

// Search S3 directly
export const searchS3Resumes = async (query) => {
  try {
    const response = await axiosInstance.get(`/api/resumebank/search-s3?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to search S3:', error);
    throw error.response?.data || { message: 'Failed to search S3' };
  }
};

// ========== KAM (KEY ACCOUNT MANAGER) MANAGEMENT APIs ==========
// Using /recruitment/kams and /department/members endpoints

// Get all KAM members (recruitment department)
// Get all KAM members (recruitment department) with local fallback
export const getAllKAMMembers = async (filtersOrDepartment = 'HR Recruitment') => {
  try {
    const filters = typeof filtersOrDepartment === 'string' ? {} : (filtersOrDepartment || {});
    const department = typeof filtersOrDepartment === 'string'
      ? filtersOrDepartment
      : (filtersOrDepartment?.department || 'HR Recruitment');

    const response = await axiosInstance.get('/recruitment/kams', {
      params: filters
    });

    const serverMembers = response.data?.data || response.data?.members || (Array.isArray(response.data) ? response.data : []);
    return { success: true, data: serverMembers };
  } catch (error) {
    console.warn('Failed to fetch KAM members from server, trying fallback or local storage:', error.message);
    try {
      const fallbackResponse = await axiosInstance.get('/department/members', {
        params: { department, role: 'KAM' }
      });
      const serverMembers = fallbackResponse.data?.data || fallbackResponse.data?.members || (Array.isArray(fallbackResponse.data) ? fallbackResponse.data : []);
      return { success: true, data: serverMembers };
    } catch (fallbackError) {
      throw fallbackError.response?.data || { message: 'Failed to fetch KAM members' };
    }
  }
};

// Create new KAM member (uses /department/members)
export const createKAMMember = async (kamData) => {
  // If it's already FormData, pass it through directly to support photo uploads
  if (kamData instanceof FormData) {
    try {
      const response = await axiosInstance.post('/department/members', kamData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to add member via FormData:', error.message);
      throw error.response?.data || { message: 'Failed to add member' };
    }
  }

  const payload = {
    name: kamData.name,
    email: kamData.email,
    phone: kamData.phone,
    password: kamData.password || 'Mabicons@123',
    department: kamData.department || 'HR Recruitment',
    role: kamData.role || 'KAM - Recruitment',
    supervisorId: kamData.supervisorId,
    skills: kamData.skills,
    targets: kamData.targets,
    profilePhoto: kamData.profilePhotoPreview || kamData.profilePhoto
  };

  try {
    const response = await axiosInstance.post('/department/members', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to add member to server:', error.message);
    throw error.response?.data || { message: 'Failed to add member' };
  }
};

// Update KAM member (uses /department/members/:id)
// Update KAM member with local fallback
export const updateKAMMember = async (kamId, updateData) => {
  try {
    const response = await axiosInstance.put(`/department/members/${kamId}`, updateData, {
      headers: { 'Content-Type': updateData instanceof FormData ? 'multipart/form-data' : 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.warn('Failed to update member on server, updating locally:', error.message);

    if (String(kamId).startsWith('offline-')) {
      const mockMembers = JSON.parse(localStorage.getItem('mock_kam_members') || '[]');
      const index = mockMembers.findIndex(m => m.id === kamId);
      if (index !== -1) {
        mockMembers[index] = { ...mockMembers[index], ...updateData };
        localStorage.setItem('mock_kam_members', JSON.stringify(mockMembers));
        return { success: true, data: mockMembers[index], message: 'Updated locally' };
      }
    }
    throw error.response?.data || { message: 'Failed to update KAM member' };
  }
};

// Delete KAM member (uses /department/members/:id)
export const deleteKAMMember = async (kamId) => {
  try {
    const response = await axiosInstance.delete(`/department/members/${kamId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete KAM member:', error);
    throw error.response?.data || { message: 'Failed to delete KAM member' };
  }
};

// Get KAM performance stats (uses /department/my-stats or stats)
export const getKAMPerformance = async (kamId, period = 'month') => {
  try {
    const response = await axiosInstance.get(`/department/stats`, {
      params: { memberId: kamId, period }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KAM performance:', error);
    throw error.response?.data || { message: 'Failed to fetch KAM performance' };
  }
};

// Get team performance for recruitment head (uses /department/stats)
export const getTeamPerformance = async (supervisorId, period = 'month') => {
  try {
    const response = await axiosInstance.get('/department/stats', {
      params: { supervisorId, period }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team performance:', error);
    throw error.response?.data || { message: 'Failed to fetch team performance' };
  }
};

// Get department dashboard stats (for recruitment head, operations head, etc.)
export const getDepartmentDashboardStats = async (department) => {
  try {
    const response = await axiosInstance.get('/department/stats', {
      params: { department }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department dashboard stats:', error);
    throw error.response?.data || { message: 'Failed to fetch department dashboard stats' };
  }
};

// Assign task to KAM (uses /department/tasks)
export const assignTaskToKAM = async (taskData) => {
  try {
    const response = await axiosInstance.post('/department/tasks', {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.kamId,
      priority: taskData.priority,
      deadline: taskData.dueDate,
      type: taskData.type,
      department: 'HR Recruitment'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to assign task:', error);
    throw error.response?.data || { message: 'Failed to assign task' };
  }
};

// Get KAM tasks (uses /department/tasks or /department/my-tasks)
export const getKAMTasks = async (kamId, status) => {
  try {
    const response = await axiosInstance.get('/department/tasks', {
      params: { assignedTo: kamId, status, department: 'HR Recruitment' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KAM tasks:', error);
    throw error.response?.data || { message: 'Failed to fetch KAM tasks' };
  }
};

// ========== HR OPERATIONS DASHBOARD APIs ==========

// Get all department attendance (Head view)
export const getDeptAttendance = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/dept-attendance', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department attendance:', error);
    throw error.response?.data || { message: 'Failed to fetch department attendance' };
  }
};

// Get department member details by ID
export const getDepartmentMember = async (memberId) => {
  try {
    const response = await axiosInstance.get(`/department/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department member details:', error);
    throw error.response?.data || { message: 'Failed to fetch department member details' };
  }
};

// Get all department payslips (Head view)
export const getAllDeptPayslips = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/all-payslips', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department payslips:', error);
    throw error.response?.data || { message: 'Failed to fetch department payslips' };
  }
};

// Get department leave requests (Head view)
export const getDeptLeaveRequests = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/dept-leaves', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department leaves:', error);
    throw error.response?.data || { message: 'Failed to fetch department leaves' };
  }
};

// Get department performance overview (Head view)
export const getDeptPerformanceOverview = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/performance-overview', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch performance overview:', error);
    throw error.response?.data || { message: 'Failed to fetch performance overview' };
  }
};

// Get offboarding employees
export const getOffboardingEmployees = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/offboarding', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch offboarding list:', error);
    throw error.response?.data || { message: 'Failed to fetch offboarding list' };
  }
};

// KAM Dashboard missing exports
export const getOffboardingList = getOffboardingEmployees;
export const getDepartmentMembers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/members', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department members:', error);
    throw error.response?.data || { message: 'Failed to fetch department members' };
  }
};

export const getFnFList = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/fnf', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch FnF list:', error);
    throw error.response?.data || { message: 'Failed to fetch FnF list' };
  }
};

export const getDeptCompliance = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/compliance', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch compliance data:', error);
    throw error.response?.data || { message: 'Failed to fetch compliance data' };
  }
};

export const getDeptEngagement = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/engagement', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch engagement data:', error);
    throw error.response?.data || { message: 'Failed to fetch engagement data' };
  }
};

export const getDeptNotes = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/notes', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department notes:', error);
    throw error.response?.data || { message: 'Failed to fetch department notes' };
  }
};

export const createDeptNote = async (noteData) => {
  try {
    const response = await axiosInstance.post('/department/notes', noteData);
    return response.data;
  } catch (error) {
    console.error('Failed to create department note:', error);
    throw error.response?.data || { message: 'Failed to create department note' };
  }
};

export const updateDeptNote = async (noteId, noteData) => {
  try {
    const response = await axiosInstance.put(`/department/notes/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    console.error('Failed to update department note:', error);
    throw error.response?.data || { message: 'Failed to update department note' };
  }
};

export const deleteDeptNote = async (noteId) => {
  try {
    const response = await axiosInstance.delete(`/department/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete department note:', error);
    throw error.response?.data || { message: 'Failed to delete department note' };
  }
};

export const getDeptPolicies = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/policies', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department policies:', error);
    throw error.response?.data || { message: 'Failed to fetch department policies' };
  }
};

export const getDeptProductivity = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/productivity', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KAM productivity:', error);
    throw error.response?.data || { message: 'Failed to fetch KAM productivity' };
  }
};

export const getDeptTasksByClient = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/tasks-by-client', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks by client:', error);
    throw error.response?.data || { message: 'Failed to fetch tasks by client' };
  }
};

// Get department documents
export const getDeptDocuments = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/documents', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department documents:', error);
    throw error.response?.data || { message: 'Failed to fetch department documents' };
  }
};

// Get department announcements
export const getDeptAnnouncements = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/announcements', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    throw error.response?.data || { message: 'Failed to fetch announcements' };
  }
};

// Get department tasks
export const getDeptTasks = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/tasks', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department tasks:', error);
    throw error.response?.data || { message: 'Failed to fetch department tasks' };
  }
};

// Get department members (for Master Data)
export const getDeptMembers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/department/members', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department members:', error);
    throw error.response?.data || { message: 'Failed to fetch department members' };
  }
};

// ========== RECRUITMENT STATS & POSITIONS APIs ==========

// Get recruitment statistics
export const getRecruitmentStats = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/recruitment/stats', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recruitment stats:', error);
    throw error.response?.data || { message: 'Failed to fetch recruitment stats' };
  }
};

// Get personal recruitment performance stats
export const getMyRecruitmentPerformance = async (period = 'This Month') => {
  try {
    const response = await axiosInstance.get('/recruitment/my-performance', {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch personal performance stats:', error);
    throw error.response?.data || { message: 'Failed to fetch personal performance stats' };
  }
};


export const getRecruitmentClients = async () => {
  try {
    const response = await axiosInstance.get('/recruitment/clients');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recruitment clients:', error);
    throw error.response?.data || { message: 'Failed to fetch recruitment clients' };
  }
};

// Get all recruitment positions
export const getAllRecruitmentPositions = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/recruitment/positions', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    throw error.response?.data || { message: 'Failed to fetch positions' };
  }
};

// Create recruitment position
export const createRecruitmentPosition = async (positionData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/recruitment/positions', positionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create position:', error);
    throw error.response?.data || { message: 'Failed to create position' };
  }
};

// Distribute job to external platforms
export const distributeJobToPlatforms = async (positionId, platforms) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post(`/recruitment/positions/${positionId}/distribute`, { platforms }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to distribute job:', error);
    throw error.response?.data || { message: 'Failed to distribute job to platforms' };
  }
};

// Update recruitment position
export const updateRecruitmentPosition = async (positionId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/recruitment/positions/${positionId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update position:', error);
    throw error.response?.data || { message: 'Failed to update position' };
  }
};

// Delete recruitment position
export const deleteRecruitmentPosition = async (positionId) => {
  try {
    const response = await axiosInstance.delete(`/recruitment/positions/${positionId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete position:', error);
    throw error.response?.data || { message: 'Failed to delete position' };
  }
};
export const getCandidateById = async (candidateId) => {
  try {
    const response = await axiosInstance.get(`/recruitment/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch candidate:', error);
    throw error.response?.data || { message: 'Failed to fetch candidate details' };
  }
};

// Get all candidates (pipeline view)
export const getAllCandidates = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/recruitment/candidates', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch candidates:', error);
    throw error.response?.data || { message: 'Failed to fetch candidates' };
  }
};

// Add a candidate
export const addCandidate = async (candidateData) => {
  try {
    const response = await axiosInstance.post('/recruitment/candidates', candidateData);
    return response.data;
  } catch (error) {
    console.error('Failed to add candidate:', error);
    throw error.response?.data || { message: 'Failed to add candidate' };
  }
};


// Update candidate status (move through stages)
export const updateCandidateStatus = async (candidateId, statusData) => {
  try {
    const response = await axiosInstance.put(`/recruitment/candidates/${candidateId}/status`, statusData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update candidate status:', error);
    throw error.response?.data || { message: 'Failed to update candidate' };
  }
};

// Reject candidate (simple)
export const rejectPipelineCandidate = async (candidateId, reason = "") => {
  try {
    const response = await axiosInstance.post('/recruitment/reject', { candidateId, reason });
    return response.data;
  } catch (error) {
    console.error('Failed to reject candidate:', error);
    throw error.response?.data || { message: 'Failed to reject candidate' };
  }
};

// Update candidate core profile
export const updateCandidate = async (candidateId, candidateData) => {
  try {
    const response = await axiosInstance.put(`/recruitment/candidates/${candidateId}`, candidateData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update candidate:', error);
    // Throw only the data or a standard message to ensure consistent catch blocks in components
    throw error.response?.data || { message: error.message || 'Failed to update candidate' };
  }
};

// Get department team members
export const getDepartmentTeamMembers = async (department = 'HR Recruitment') => {
  try {
    // For recruitment, try the specialized KAM endpoint first
    if (department.toLowerCase().includes('recruitment')) {
      const kamRes = await getAllKAMMembers(department);
      if (kamRes.success && kamRes.data && kamRes.data.length > 0) {
        return { success: true, members: kamRes.data, data: kamRes.data };
      }
    }

    const response = await axiosInstance.get('/department/members', {
      params: { department }
    });

    // Normalize response data
    let members = response.data?.data || response.data?.members || (Array.isArray(response.data) ? response.data : []);

    // Merge with mock members
    const mockMembers = JSON.parse(localStorage.getItem('mock_kam_members') || '[]');
    const isRecruitment = department && (department.toLowerCase().includes('recruitment') || department.toLowerCase().includes('kam'));

    const filteredMocks = mockMembers.filter(m => {
      if (!department) return true;
      const normalizedDept = department.toLowerCase().trim();
      const memberDept = (m.department || '').toLowerCase().trim();

      if (memberDept === normalizedDept) return true;
      if (isRecruitment && (memberDept.includes('recruitment') || memberDept.includes('kam') || memberDept === '')) return true;
      if (memberDept === normalizedDept.replace('hr ', '')) return true;

      return false;
    });

    const seenEmails = new Set(members.map(m => (m.email || '').toLowerCase()));
    filteredMocks.forEach(mock => {
      const email = (mock.email || '').toLowerCase();
      if (email && !seenEmails.has(email)) {
        members.push({ ...mock, isOffline: true });
        seenEmails.add(email);
      } else if (!email) {
        members.push({ ...mock, isOffline: true });
      }
    });

    return { success: true, members, data: members };
  } catch (error) {
    console.error('Failed to fetch team members, using fallback:', error);
    // Fallback to just mock members for this department
    const mockMembers = JSON.parse(localStorage.getItem('mock_kam_members') || '[]');
    const isRecruitment = department && (department.toLowerCase().includes('recruitment') || department.toLowerCase().includes('kam'));

    const filteredMocks = mockMembers.filter(m => {
      if (!department) return true;
      const normalizedDept = department.toLowerCase().trim();
      const memberDept = (m.department || '').toLowerCase().trim();
      if (memberDept === normalizedDept) return true;
      if (isRecruitment && (memberDept.includes('recruitment') || memberDept.includes('kam') || memberDept === '')) return true;
      return false;
    });

    return { success: true, members: filteredMocks, data: filteredMocks };
  }
};

// Add department team member
export const addDepartmentTeamMember = async (memberData) => {
  try {
    const response = await axiosInstance.post('/department/members', memberData);
    return response.data;
  } catch (error) {
    console.error('Failed to add team member:', error);
    throw error.response?.data || { message: 'Failed to add team member' };
  }
};

// Update department team member
export const updateDepartmentTeamMember = async (memberId, updateData) => {
  try {
    const response = await axiosInstance.put(`/department/members/${memberId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Failed to update team member:', error);
    throw error.response?.data || { message: 'Failed to update team member' };
  }
};

// Delete department team member
export const deleteDepartmentTeamMember = async (memberId) => {
  try {
    const response = await axiosInstance.delete(`/department/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete team member:', error);
    throw error.response?.data || { message: 'Failed to delete team member' };
  }
};

// Get department stats
export const getDepartmentStats = async (department) => {
  try {
    const response = await axiosInstance.get('/department/stats', {
      params: { department }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch department stats:', error);
    throw error.response?.data || { message: 'Failed to fetch department stats' };
  }
};



// ====================== NEWLY ADDED APIs ======================

export const getClientsForTeamLeader = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/client/getClientsForTeamLeader',
      payload,  // Send the payload object
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw error.response?.data || error.message;
  }
};

export const getClosedDeals = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/deals/closed', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching closed deals:', error);
    throw new Error('Failed to fetch closed deals');
  }
};

export const getPendingAgreements = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/agreements/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching pending agreements:', error);
    throw new Error('Failed to fetch pending agreements');
  }
};

export const getUpcomingActivities = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/activities/upcoming', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching upcoming activities:', error);
    throw new Error('Failed to fetch upcoming activities');
  }
};

export const getBDMetrics = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/bd/metrics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching BD metrics:', error);
    throw new Error('Failed to fetch BD metrics');
  }
};

export const bdExecutiveLogin = async (credentials) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/bd/login', credentials, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error during BD executive login:', error);
    throw new Error('Failed to login as BD executive');
  }
};

// ==========================================
// HELP & SUPPORT API
// ==========================================

export const getProblems = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/problems', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch problems:', error);
    throw error.response?.data || { message: 'Failed to fetch problems' };
  }
};

export const createProblem = async (data) => {
  try {
    const response = await axiosInstance.post('/problems', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create problem:', error);
    throw error.response?.data || { message: 'Failed to create problem' };
  }
};

export const updateProblemStatus = async (id, statusData) => {
  try {
    const response = await axiosInstance.patch(`/problems/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Failed to update problem status:', error);
    throw error.response?.data || { message: 'Failed to update problem status' };
  }
};

export const deleteProblem = async (id) => {
  try {
    const response = await axiosInstance.delete(`/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete problem:', error);
    throw error.response?.data || { message: 'Failed to delete problem' };
  }
};

export const bulkResolveProblems = async (data) => {
  try {
    const response = await axiosInstance.post('/problems/bulk-resolve', data);
    return response.data;
  } catch (error) {
    console.error('Failed to bulk resolve problems:', error);
    throw error.response?.data || { message: 'Failed to bulk resolve problems' };
  }
};

export const bulkDeleteProblems = async (data) => {
  try {
    const response = await axiosInstance.post('/problems/bulk-delete', data);
    return response.data;
  } catch (error) {
    console.error('Failed to bulk delete problems:', error);
    throw error.response?.data || { message: 'Failed to bulk delete problems' };
  }
};

// ====================== RECRUITMENT APIs ======================

export const getKamsWithRecruitment = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/recruitment/kams', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching KAMs with recruitment:', error);
    throw error.response?.data || {
      message: 'Failed to fetch KAM data'
    };
  }
};

export const getClientRecruitmentProgress = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/recruitment/client-progress/${clientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client recruitment progress:', error);
    throw error.response?.data || { message: 'Failed to fetch recruitment progress' };
  }
};

export const getClientDashboardOverview = async (clientId, timeRange = 'all') => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/client/dashboard-overview/${clientId}`, {
      params: { timeRange },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client dashboard overview:', error);
    throw error.response?.data || { message: 'Failed to fetch dashboard overview' };
  }
};

export const getClientAttendance = async (clientId, month) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/client/attendance/${clientId}`, {
      params: { month },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client attendance:', error);
    throw error.response?.data || { message: 'Failed to fetch attendance data' };
  }
};

export const getClientPayroll = async (clientId, month) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/client/payroll/${clientId}`, {
      params: { month },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client payroll:', error);
    throw error.response?.data || { message: 'Failed to fetch payroll data' };
  }
};

export const getClientMasterData = async (clientId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/client/master-data/${clientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client master data:', error);
    throw error.response?.data || { message: 'Failed to fetch master data' };
  }
};

export const getDepartmentActivityLogs = async (department, limit = 50, actionType = null) => {
  try {
    const token = localStorage.getItem('token');
    const params = { department, limit };
    if (actionType) params.actionType = actionType;

    const response = await axiosInstance.get('/department/activities', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error.response?.data || { message: 'Failed to fetch activity logs' };
  }
};

export const createDepartmentActivityLog = async (activityData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/activities', activityData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating activity log:', error);
    throw error.response?.data || { message: 'Failed to create activity log' };
  }
};

export const getDepartmentTasks = async (department, status = null, assignedTo = null) => {
  try {
    const token = localStorage.getItem('token');
    const params = { department };
    if (status) params.status = status;
    if (assignedTo) params.assignedTo = assignedTo;

    const response = await axiosInstance.get('/department/tasks', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching department tasks:', error);
    throw error.response?.data || { message: 'Failed to fetch tasks' };
  }
};

export const createDepartmentTask = async (taskData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/tasks', taskData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating department task:', error);
    throw error.response?.data || { message: 'Failed to create task' };
  }
};

export const updateDepartmentTask = async (taskId, updateData) => {
  try {
    const response = await axiosInstance.put(`/department/tasks/${taskId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating department task:', error);
    throw error.response?.data || { message: 'Failed to update task' };
  }
};

export const deleteDepartmentTask = async (taskId) => {
  try {
    const response = await axiosInstance.delete(`/department/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting department task:', error);
    throw error.response?.data || { message: 'Failed to delete task' };
  }
};

export const getMyDepartmentTasks = async (status = null) => {
  try {
    const params = {};
    if (status) params.status = status;

    const response = await axiosInstance.get('/department/my-tasks', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    throw error.response?.data || { message: 'Failed to fetch tasks' };
  }
};

export const getMyDepartmentStats = async () => {
  try {
    const response = await axiosInstance.get('/department/my-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching my stats:', error);
    throw error.response?.data || { message: 'Failed to fetch stats' };
  }
};

export const getMyProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/my-profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

export const updateMyProfile = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/department/my-profile', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

export const getMyLeaves = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/leaves', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch leaves' };
  }
};

export const applyLeave = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/leaves', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to apply leave' };
  }
};

export const approveRejectLeave = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/department/leaves/${id}/approve`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update leave status' };
  }
};

export const checkIn = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/attendance/check-in', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check in' };
  }
};

export const checkOut = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/attendance/check-out', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check out' };
  }
};

export const getMyAttendance = async (month, year) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/my-attendance', {
      params: { month, year },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch attendance' };
  }
};

export const getPerformanceStats = async (period) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/performance', {
      params: { period },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch performance stats' };
  }
};

export const submitDailyReport = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/daily-report', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit report' };
  }
};

export const uploadMISAttachment = async (reportId, file) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post(`/department/daily-report/${reportId}/attachment`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('MIS Attachment upload failed:', error);
    throw error.response?.data || { message: 'Failed to upload attachment' };
  }
};

export const getMyReports = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/my-reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reports' };
  }
};

export const getMISReports = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/mis-reports', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch MIS reports' };
  }
};

export const addHeadComment = async (reportId, comment) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post(`/department/daily-report/${reportId}/comment`, { comment }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add comment' };
  }
};

export const getAnnouncements = async (department) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/announcements', {
      params: { department },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch announcements' };
  }
};

export const createAnnouncement = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/announcements', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create announcement' };
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/department/announcements/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete announcement' };
  }
};

export const editAnnouncement = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/department/announcements/${id}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update announcement' };
  }
};

export const uploadDeptDocument = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/documents', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

export const updateDeptDocument = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/department/documents/${id}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update document' };
  }
};

export const deleteDeptDocument = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/department/documents/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete document' };
  }
};

export const getMyTrainings = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/my-trainings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch trainings' };
  }
};

export const updateTraining = async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/department/trainings/${id}`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update training' };
  }
};

export const assignTraining = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/trainings', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to assign training' };
  }
};

export const getMyPayslips = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/my-payslips', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payslips' };
  }
};

export const generatePayslip = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/payslips', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate payslip' };
  }
};

export const getChatMessages = async (department) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/chat', {
      params: { department },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch messages' };
  }
};

export const sendChatMessage = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/chat', data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send message' };
  }
};

export const getCalendarEvents = async (month, year) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/calendar', {
      params: { month, year },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch calendar events' };
  }
};

// ============== NOTES ==============
export const getNotes = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/department/notes', {
      params,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notes' };
  }
};

export const createNote = async (noteData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/department/notes', noteData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create note' };
  }
};

export const updateNote = async (id, noteData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(`/department/notes/${id}`, noteData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update note' };
  }
};

export const deleteNote = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/department/notes/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete note' };
  }
};


const api = {
  superAdminLogin,
  adminLogin,
  teamLeaderLogin,
  employeeLogin,
  departmentTeamLogin,
  clientSignup,
  clientLogin,
  createAdmin,
  requestTask,
  assignOrRejectTask,
  getRequestedTasks,
  updateTaskStatus,
  deleteTask,
  logout,
  saveToken,
  setAuthToken,
  updateAdmin,
  createTeamLeader,
  createEmployee,
  getAdminHierarchy,
  getAllClients,
  deleteEmployee,
  deleteTeamLeader,
  getAllTasks,
  uploadClientDocuments,
  createTaskForEmployee,
  deleteClient,
  getUserProfileImage,
  createTaskByTL,
  uploadAdminProfileImage, // Included new function
  getTeamLeaderHierarchy,  // Add this line
  getTeamLeaderDetails,
  getAllNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
  getChatHistory,
  markMessagesAsRead,
  getUnreadMessageCount,
  getClientDetails,
  resetClientPassword,
  getClientDocuments,  // Add this line
  forgotPassword,
  resetPassword,
  requestPasswordReset,
  getEmployeeTasks,
  getAllRecurringTasks,
  deleteOrDeactivateRecurringTask,
  getRecurringTasksByTeamLeader,
  editClient,
  deleteTeamLeaderWithReassignment,
  deleteTeamLeaderAndPromoteEmployee,
  createRecruitmentRequest,
  acceptRecruitmentRequest,
  rejectRecruitmentRequest,
  getRecruitmentRequests,
  uploadResumes, // Add this line
  getShortlistedCandidates,
  getClientRequests,
  getClientRequestDetails,
  createClientRequest,
  acceptCandidate,
  rejectCandidate,
  getRecruitmentStatus, // Add this line
  scheduleInterview,
  closeRecruitmentRequest,
  generateMeetLink, // Add this line
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getBusinessDevLeads,
  getAllBDExecutives,
  createProposal,
  sendProposal,
  sendProfile,
  createBDExecutive,
  // Interview Management
  getAllInterviews,
  scheduleNewInterview,
  getInterviewById,
  getInterviewByToken,
  getInterviewFeedbackForm,
  updateInterviewStatus,
  updateInterview,
  sendInterviewReminder,
  cancelInterview,
  // Resume Bank Management
  getResumeBankStats,
  getResumeRoleTypes,
  getResumeBankResumes,
  getResumeDetails,
  updateResumeDetails,
  syncResumesFromSharePoint,
  toggleStarResumes,
  bulkUpdateResumeStatus,
  assignResumesToPosition,
  getResumeDownloadUrl,
  getSharePointFolders,
  searchS3Resumes,
  deepSearchResumes,
  getClientsForTeamLeader,
  getClosedDeals,
  getPendingAgreements,
  getUpcomingActivities,
  getBDMetrics,
  bdExecutiveLogin,
  getKamsWithRecruitment,
  getClientRecruitmentProgress,
  getClientDashboardOverview,
  getDepartmentActivityLogs,
  createDepartmentActivityLog,
  getDepartmentTasks,
  createDepartmentTask,
  updateDepartmentTask,
  deleteDepartmentTask,
  getMyDepartmentTasks,
  getMyDepartmentStats,
  getMyProfile,
  updateMyProfile,
  getMyLeaves,
  applyLeave,
  approveRejectLeave,
  checkIn,
  checkOut,
  getMyAttendance,
  getPerformanceStats,

  // Help & Support
  getProblems,
  createProblem,
  updateProblemStatus,
  deleteProblem,
  bulkResolveProblems,
  bulkDeleteProblems,

  submitDailyReport,
  uploadMISAttachment,
  getMyReports,
  getMISReports,
  addHeadComment,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  editAnnouncement,
  uploadDeptDocument,
  deleteDeptDocument,
  getMyTrainings,
  updateTraining,
  assignTraining,
  getMyPayslips,
  generatePayslip,
  getChatMessages,
  sendChatMessage,
  getCalendarEvents,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  browseSharePointDrive,
  listSharePointExcelFiles,
  testSharePointConnection,
  syncSharePointCandidates,
  getSharePointCandidates,
  updateSharePointCandidate,
  getSharePointInterviews,
  getSharePointClients,
  getSharePointSyncLogs,
  syncSharePointAll,
  syncResumesFromSharePointDrive,
  submitInterviewFeedback,
  generateCandidateCredentials,
  shareCandidateCredentials,
  candidateLogin
};

// ============ FINANCE / ACCOUNTS APIs ============

export const getFinanceClientAccounts = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/accounts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch finance accounts.' };
  }
};

export const getFinanceAccountDetails = async (clientId) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get(`/finance/account/${clientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch account details.' };
  }
};

export const createFinanceInvoice = async (invoiceData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.post('/finance/invoice/create', invoiceData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create invoice.' };
  }
};

export const recordFinancePayment = async (clientId, paymentData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/finance/account/${clientId}/record-payment`, paymentData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record payment.' };
  }
};

export const updateFinanceInvoiceStatus = async (invoiceId, statusData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/finance/invoice/${invoiceId}/status`, statusData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update invoice status.' };
  }
};

export const getFinanceExpenses = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/expenses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch expenses.' };
  }
};

export const createFinanceExpense = async (expenseData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.post('/finance/expense/create', expenseData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record expense.' };
  }
};

export const updateFinanceExpenseStatus = async (expenseId, status, payload = {}) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/finance/expense/${expenseId}/status`, {
      status,
      ...payload
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update expense status.' };
  }
};

export const updateFinanceExpense = async (expenseId, payload) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/finance/expense/${expenseId}`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update expense.' };
  }
};

export const updateFinancePaymentRequest = async (requestId, payload) => {
  try {
    const token = getStoredAuthToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    if (!(payload instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await axiosInstance.put(`/finance/payment-request/${requestId}`, payload, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update payment request.' };
  }
};

export const sendFinancePaymentReminder = async (requestId, payload) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.post(`/finance/payment-request/${requestId}/remind`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send payment reminder.' };
  }
};

export const getFinancePayments = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/payments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payments.' };
  }
};

export const getFinancePaymentRequests = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/payment-requests', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payment requests.' };
  }
};

export const createFinancePaymentRequest = async (requestData) => {
  try {
    const token = getStoredAuthToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    if (!(requestData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await axiosInstance.post('/finance/payment-request/create', requestData, { headers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record payment request.' };
  }
};

export const getFinanceEmployeesPayroll = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/employees-payroll', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch employees payroll.' };
  }
};

export const getFinanceInvoices = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/invoices', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch invoices.' };
  }
};

export const getFinanceProfitabilityReports = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get('/finance/profitability-reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profitability reports.' };
  }
};

export const generateFinanceProfitabilityReport = async (reportData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.post('/finance/profitability-reports/generate', reportData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate profitability report.' };
  }
};

export const updateFinanceProfitabilityReportStatus = async (reportId, status) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/finance/profitability-reports/${reportId}/status`, { status }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update report status.' };
  }
};

// Create a new client review
export const createClientReview = async (reviewData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.post('/client-reviews', reviewData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Backend client review submit failed, falling back to local storage:', error);
    try {
      const localReviews = JSON.parse(localStorage.getItem('local_client_reviews') || '[]');
      const newReview = {
        id: 'local_' + Date.now(),
        _id: 'local_' + Date.now(),
        clientId: reviewData.clientId,
        rating: reviewData.rating,
        feedback: reviewData.feedback,
        actionRequired: reviewData.actionRequired,
        reviewDate: reviewData.reviewDate,
        nextReviewDate: reviewData.nextReviewDate,
        reviewMonth: new Date().toISOString().slice(0, 7),
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      localReviews.unshift(newReview);
      localStorage.setItem('local_client_reviews', JSON.stringify(localReviews));
      return { success: true, data: newReview };
    } catch (e) {
      console.error('Local storage review save failed:', e);
      throw error.response?.data || { message: 'Failed to submit review' };
    }
  }
};

// Get all reviews for a specific client
export const getClientReviews = async (clientId) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get(`/client-reviews/${clientId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Backend client reviews fetch failed, falling back to local storage:', error);
    try {
      const localReviews = JSON.parse(localStorage.getItem('local_client_reviews') || '[]');
      const filtered = localReviews.filter(r => r.clientId === clientId);
      return { success: true, data: filtered };
    } catch (e) {
      console.error('Local storage review fetch failed:', e);
      return { success: true, data: [] };
    }
  }
};

// Update an existing client review
export const updateClientReview = async (reviewId, updateData) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/client-reviews/${reviewId}`, updateData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update client review:', error);
    throw error.response?.data || {
      message: 'Failed to update review. Please try again.'
    };
  }
};

// Delete a client review
export const deleteClientReview = async (reviewId) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.delete(`/client-reviews/${reviewId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete client review:', error);
    throw error.response?.data || {
      message: 'Failed to delete review. Please try again.'
    };
  }
};

// Get review statistics for a client
export const getClientReviewStats = async (clientId) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get(`/client-reviews/stats/${clientId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch review statistics:', error);
    throw error.response?.data || {
      message: 'Failed to fetch statistics. Please try again.'
    };
  }
};

export const getFinancePayroll = async (month, year) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get(`/api/salary/all-employees?month=${month}&year=${year}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payroll.' };
  }
};

export const getEmployeeAttendance = async (employeeId, month, year) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.get(`/api/attendance/${employeeId}?month=${month}&year=${year}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch attendance.' };
  }
};

export const updateEmployeeSalary = async (employeeId, payload) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.put(`/api/salary/${employeeId}`, payload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update salary.' };
  }
};

export const saveEmployeeAttendance = async (payload) => {
  try {
    const token = getStoredAuthToken();
    const response = await axiosInstance.post('/api/attendance', payload, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to save attendance.' };
  }
};

// Add to default api object
api.createClientReview = createClientReview;
api.getClientReviews = getClientReviews;
api.getFinancePayroll = getFinancePayroll;
api.getEmployeeAttendance = getEmployeeAttendance;
api.saveEmployeeAttendance = saveEmployeeAttendance;
api.updateEmployeeSalary = updateEmployeeSalary;
api.updateFinanceExpenseStatus = updateFinanceExpenseStatus;
api.updateFinanceExpense = updateFinanceExpense;
api.updateFinancePaymentRequest = updateFinancePaymentRequest;
api.sendFinancePaymentReminder = sendFinancePaymentReminder;
api.generateFinanceProfitabilityReport = generateFinanceProfitabilityReport;
api.updateFinanceProfitabilityReportStatus = updateFinanceProfitabilityReportStatus;
export default api;




