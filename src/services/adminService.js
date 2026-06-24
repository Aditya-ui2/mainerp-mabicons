/**
 * ADMIN SERVICE
 * Handles all admin and team management API calls
 */

import apiClient, { parseError, getResponseData } from './api';

export const adminService = {
    // ============================================
    // ADMIN MANAGEMENT
    // ============================================

    /**
     * Get all admins
     */
    getAllAdmins: async () => {
        try {
            const response = await apiClient.get('/admin/all');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Create admin
     */
    createAdmin: async (adminData) => {
        try {
            const response = await apiClient.post('/admin/create', adminData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Update admin
     */
    updateAdmin: async (adminId, adminData) => {
        try {
            const response = await apiClient.put('/admin/edit', {
                adminId,
                ...adminData
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete admin
     */
    deleteAdmin: async (adminId) => {
        try {
            const response = await apiClient.delete('/admin/delete', {
                data: { adminId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get admin hierarchy
     */
    getAdminHierarchy: async (adminId) => {
        try {
            const response = await apiClient.post('/admin/hierarchy', {
                adminId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Upload admin profile image
     */
    uploadProfileImage: async (adminId, formData) => {
        try {
            const response = await apiClient.post('/admin/uploadDP', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // TEAM LEADER MANAGEMENT
    // ============================================

    /**
     * Get all team leaders
     */
    getAllTeamLeaders: async () => {
        try {
            const response = await apiClient.get('/teamLeader/all');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Create team leader
     */
    createTeamLeader: async (teamLeaderData) => {
        try {
            const response = await apiClient.post('/teamLeader/create', teamLeaderData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get team leader hierarchy
     */
    getTeamLeaderHierarchy: async (teamLeaderId) => {
        try {
            const response = await apiClient.post('/teamLeader/hierarchy', {
                teamLeaderId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get team leader details
     */
    getTeamLeaderDetails: async (teamLeaderId) => {
        try {
            const response = await apiClient.post('/teamLeader/getTeamLeaderDetails', {
                teamLeaderId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete team leader with reassignment
     */
    deleteTeamLeaderWithReassignment: async (teamLeaderId, newTeamLeaderId) => {
        try {
            const response = await apiClient.delete('/teamLeader/deleteTeamLeaderWithReassignment', {
                data: {
                    teamLeaderId,
                    newTeamLeaderId
                }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete team leader and promote employee
     */
    deleteTeamLeaderAndPromoteEmployee: async (oldTeamLeaderId, employeeToPromoteId) => {
        try {
            const response = await apiClient.delete('/teamLeader/deleteTeamLeaderAndPromoteEmployee', {
                data: {
                    oldTeamLeaderId,
                    employeeToPromoteId
                }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // EMPLOYEE MANAGEMENT
    // ============================================

    /**
     * Create employee
     */
    createEmployee: async (employeeData) => {
        try {
            const response = await apiClient.post('/employee/create', employeeData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Update employee
     */
    updateEmployee: async (employeeId, employeeData) => {
        try {
            const response = await apiClient.put('/employee/edit', {
                id: employeeId,
                ...employeeData
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete employee
     */
    deleteEmployee: async (employeeId) => {
        try {
            const response = await apiClient.delete('/employee/delete', {
                data: { employeeId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get employee tasks
     */
    getEmployeeTasks: async (employeeId) => {
        try {
            const response = await apiClient.post('/employee/employeeTasks', {
                employeeId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // SUPERADMIN DASHBOARD
    // ============================================

    /**
     * Get super admin dashboard stats
     */
    getSuperAdminDashboardStats: async () => {
        try {
            const response = await apiClient.get('/superAdmin/dashboard-stats');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    }
};

export default adminService;
