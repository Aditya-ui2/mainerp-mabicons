import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const BASE_URL = 'http://15.206.67.102:3000';
// export const BASE_URL = 'https://mab-zuyh.onrender.com';
// export const BASE_URL = 'https://api.mabicons.com/';
// export const BASE_URL = 'http://13.233.131.230:3000';
// Create axios instance with specific headers
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"'
  },
  withCredentials: false  // Changed to false since the server might not be expecting credentials
});

// Remove the default headers configuration since we're setting them in the instance
// axios.defaults.headers.common['Content-Type'] = 'application/json';
// axios.defaults.headers.common['Accept'] = 'application/json';

const saveToken = (token, userType) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
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

// Update the login function to include specific headers
export const superAdminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/superAdmin/login', credentials, {
      headers: {
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
      }
    });
    if (response.data.token) {
      saveToken(response.data.token, 'superAdmin');
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || error.message;
  }
};

// Similar updates for other login functions
export const adminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/admin/login', credentials, {
      headers: {
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
      }
    });
    if (response.data.token) {
      saveToken(response.data.token, 'admin');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const teamLeaderLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/teamLeader/login', credentials, {
      headers: {
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
      }
    });
    if (response.data.token) {
      saveToken(response.data.token, 'teamLeader');
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const employeeLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post('/employee/login', credentials, {
      headers: {
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
      }
    });
    if (response.data.token) {
      saveToken(response.data.token, 'employee');
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
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/task/update-status', {
      taskId: taskId,
      status: status
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
export const updateTeamleader= async(teamLeaderId,updateData)=>{
  
}

export const updateEmployee = async (employeeId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/employee/edit', {
      id: employeeId,
      password: updateData
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

// Add this new API endpoint
export const createTeamLeader = async (teamLeaderData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.post('/teamLeader/create', {
      name: teamLeaderData.name,
      email: teamLeaderData.email,
      adminId: teamLeaderData.adminId,
      phone: teamLeaderData.phone
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
      teamLeaderIds: employeeData.teamLeaderId,
      phone: employeeData.phone
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
export const getAllClients = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/client/all', {
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
      clientId:clientId
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
      { clientId:clientId },
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
      password:password,
      userType:token,
      token:userType
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
    const response = await axiosInstance.post('/employee/employeeTasks', 
      { employeeId:employeeId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
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
      teamLeaderId:teamLeaderId,
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

export const editClient = async (clientData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put('/client/edit-Client', {
      clientId: clientData.clientId,
      name: clientData.name,
      companyName: clientData.companyName,
      corporateAddress: clientData.corporateAddress,
      contactNumber: clientData.contactNumber,
      gstNumber: clientData.gstNumber,
      panNumber: clientData.panNumber,
      cinNumber: clientData.cinNumber,
      numberOfCompanies: clientData.numberOfCompanies,
      website: clientData.website,
      authorizedSignatory: {
        name: clientData.authorizedSignatory.name,
        email: clientData.authorizedSignatory.email,
        contact: clientData.authorizedSignatory.contact
      },
      ownerDirectorDetails: clientData.ownerDirectorDetails
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
    const response = await axiosInstance.post('/recruit/request', {
      name: requestData.name,
      position: requestData.position,
      keywords: requestData.keywords,
      experience: requestData.experience,
      currentLocation: requestData.currLocation,
      preferredLocation: requestData.preferredLocation,
      salary: requestData.salary,
      noticePeriod: requestData.noticePeriod,
      qualification: requestData.qualification,
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
    const response = await axiosInstance.post('/recruit/accept', {
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
    const response = await axiosInstance.post('/recruit/reject', {
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
    const response = await axiosInstance.get('/recruit/getRequests', {
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
      `${BASE_URL}/recruit/upload-resumes`, 
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
    const response = await axiosInstance.post('/recruit/shortlisted', {
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
    const response = await axiosInstance.get(`/recruit/getRequests-client?clientId=${clientId}`, {
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
    const response = await axiosInstance.get(`/recruit/request/${requestId}`, {
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
    const response = await axiosInstance.post('/recruit/create-request', requestData, {
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
    const response = await axiosInstance.post('/recruit/accept', {
      reason: acceptData.reason,
      recruitmentId: acceptData.recruitmentId,
      fileId: acceptData.fileId
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
    const response = await axiosInstance.post('/recruit/reject', {
      reason: rejectData.reason,
      recruitmentId: rejectData.recruitmentId,
      fileId: rejectData.fileId
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
    const response = await axiosInstance.post('/recruit/status', {
      recruitmentId: payload.recruitmentId,
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
    const response = await axiosInstance.post('/recruit/schedule-interview', {
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
    const response = await axiosInstance.post('/recruit/close-request', {
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
    const response = await axiosInstance.post('/recruit/meet-link', {
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
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
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
    const response = await axios.get('http://localhost:3000/leads', {
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

// Get lead by ID
export const getLeadById = async (leadId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/bd/leads/${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
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
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
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
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
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
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
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
        'Content-Type': 'application/json',
        'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'http://localhost:5173/',
        'Origin': 'http://localhost:5173'
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

// Then, include it in the default export
const api = {
  superAdminLogin,
  adminLogin,
  teamLeaderLogin,
  employeeLogin,
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
};

export default api;

// Keep your existing named exports

const handleGlobalAddTask = async () => {
  try {
    const taskData = {
      ...newTaskData,
      dueDate: newTaskData.category === 'Deadline' ? new Date(newTaskData.dueDate).toISOString() : undefined
    };

    await createTaskByTL(taskData);
    
    // Reset form and close modal
    setIsAddingTask(false);
    setNewTaskData({
      title: '',
      description: '',
      clientId: '',
      category: 'Deadline',
      dueDate: '',
      frequency: '',
      priority: 'Medium',
      assignedUserId: '',
      assignedUserType: 'TeamLeader'
    });

    // Refresh tasks
    fetchTasks();
  } catch (error) {
    console.error('Failed to create task:', error);
    // You might want to show an error message to the user here
  }
};

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

// Add this new API endpoint to edit client details

export const getClosedDeals = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/deals/closed', {
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
    const response = await axios.get('http://localhost:3000/agreements/pending', {
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
    const response = await axios.get('http://localhost:3000/activities/upcoming', {
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
    const response = await axios.get('http://localhost:3000/bd/metrics', {
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
    const response = await axios.post('http://localhost:3000/bd/login', credentials, {
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










