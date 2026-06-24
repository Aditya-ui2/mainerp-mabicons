/**
 * CLIENT SERVICE
 * Handles all client-related API calls
 */

import apiClient, { parseError, getResponseData } from './api';

export const clientService = {
    // ============================================
    // CLIENT MANAGEMENT
    // ============================================

    /**
     * Get all clients
     */
    getAllClients: async () => {
        try {
            const response = await apiClient.get('/client/all');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client details
     */
    getClientDetails: async (clientId) => {
        try {
            const response = await apiClient.post('/client/getClientDetails', {
                clientId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Create client
     */
    createClient: async (clientData) => {
        try {
            const response = await apiClient.post('/client/create', clientData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Edit client
     */
    editClient: async (clientId, clientData) => {
        try {
            const response = await apiClient.put('/client/edit', {
                clientId,
                ...clientData
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete client
     */
    deleteClient: async (clientId) => {
        try {
            const response = await apiClient.delete('/client/delete', {
                data: { clientId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Onboard client
     */
    onboardClient: async (clientId, action, teamLeaderId) => {
        try {
            const response = await apiClient.post('/client/onboard-client', {
                clientId,
                action,
                teamLeaderId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // CLIENT DOCUMENTS
    // ============================================

    /**
     * Upload client documents
     */
    uploadDocuments: async (clientId, formData) => {
        try {
            const response = await apiClient.post('/client/upload-documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client documents
     */
    getClientDocuments: async (clientId) => {
        try {
            const response = await apiClient.post('/client/getClientDocuments', {
                clientId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Upload client profile image
     */
    uploadProfileImage: async (clientId, formData) => {
        try {
            const response = await apiClient.post('/client/uploadDP', formData, {
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
    // CLIENT DASHBOARD
    // ============================================

    /**
     * Get client dashboard overview
     */
    getDashboardOverview: async (clientId) => {
        try {
            const response = await apiClient.get(`/client/dashboard-overview/${clientId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client attendance
     */
    getAttendance: async (clientId) => {
        try {
            const response = await apiClient.get(`/client/attendance/${clientId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client payroll
     */
    getPayroll: async (clientId) => {
        try {
            const response = await apiClient.get(`/client/payroll/${clientId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client master data
     */
    getMasterData: async (clientId) => {
        try {
            const response = await apiClient.get(`/client/master-data/${clientId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    }
};

export default clientService;
