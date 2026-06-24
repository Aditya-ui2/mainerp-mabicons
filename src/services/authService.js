/**
 * AUTHENTICATION SERVICE
 * Handles all authentication-related API calls
 */

import apiClient, { parseError, getResponseData } from './api';

// ============================================
// LOGIN ENDPOINTS
// ============================================

export const authService = {
    /**
     * SuperAdmin Login
     */
    superAdminLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/superAdmin/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'superAdmin');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Admin Login
     */
    adminLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/admin/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'admin');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * TeamLeader Login
     */
    teamLeaderLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/teamLeader/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'teamLeader');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Employee Login
     */
    employeeLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/employee/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'employee');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Client Login
     */
    clientLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/client/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'client');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Client Signup
     */
    clientSignup: async (clientData) => {
        try {
            const response = await apiClient.post('/client/signup', clientData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Candidate Login
     */
    candidateLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/recruitment/candidate/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'candidate');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Department Team Login
     */
    departmentTeamLogin: async (email, password) => {
        try {
            const response = await apiClient.post('/department/login', {
                email,
                password
            });
            const data = getResponseData(response);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', 'departmentTeam');
                localStorage.setItem('userId', data.id);
            }
            return data;
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // PASSWORD RESET ENDPOINTS
    // ============================================

    /**
     * Request Password Reset
     */
    requestPasswordReset: async (email, userType) => {
        try {
            const response = await apiClient.post('/auth/forgot-password', {
                email,
                userType
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Reset Password
     */
    resetPassword: async (password, userType, token) => {
        try {
            const response = await apiClient.post('/auth/reset-password', {
                password,
                userType,
                token
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Logout
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    },

    /**
     * Get current user from token
     */
    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');

        return {
            token,
            userId,
            userRole,
            isAuthenticated: !!token
        };
    }
};

export default authService;
