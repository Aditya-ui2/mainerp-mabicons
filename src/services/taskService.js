/**
 * TASK SERVICE
 * Handles all task-related API calls
 */

import apiClient, { parseError, getResponseData } from './api';

export const taskService = {
    // ============================================
    // TASK REQUESTS
    // ============================================

    /**
     * Request a task
     */
    requestTask: async (taskData) => {
        try {
            const response = await apiClient.post('/task/requestTask', taskData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get requested tasks
     */
    getRequestedTasks: async (teamLeaderId) => {
        try {
            const response = await apiClient.post('/task/requested-tasks', {
                teamLeaderId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client requested tasks
     */
    getClientRequestedTasks: async (clientId) => {
        try {
            const response = await apiClient.post('/task/requested-tasks', {
                clientId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Accept or reject task
     */
    assignOrRejectTask: async (requestedTaskId, teamLeaderId, action, assignedUserId, assignedUserType, rejectionReason) => {
        try {
            const response = await apiClient.post('/task/accept-or-reject', {
                requestedTaskId,
                teamLeaderId,
                action,
                assignedUserId,
                assignedUserType,
                rejectionReason
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // TASK MANAGEMENT
    // ============================================

    /**
     * Get all tasks
     */
    getAllTasks: async () => {
        try {
            const response = await apiClient.get('/task/allTasks');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get client tasks
     */
    getClientTasks: async (clientId) => {
        try {
            const response = await apiClient.post('/task/getClientTasks', {
                clientId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get tasks by assigned user
     */
    getTasksByAssignedUser: async (userId) => {
        try {
            const response = await apiClient.post('/task/getTasksByAssignedUser', {
                userId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Create task by team leader
     */
    createTaskByTeamLeader: async (taskData) => {
        try {
            const response = await apiClient.post('/task/createTaskByTL', taskData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Update task status
     */
    updateTaskStatus: async (taskId, status) => {
        try {
            const response = await apiClient.put('/task/update-status', {
                taskId,
                status
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete task
     */
    deleteTask: async (taskId) => {
        try {
            const response = await apiClient.post('/task/delete', {
                taskId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // RECURRING TASKS
    // ============================================

    /**
     * Get all recurring tasks
     */
    getAllRecurringTasks: async () => {
        try {
            const response = await apiClient.get('/task/getAllRecurringTasks');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get recurring tasks for team leader
     */
    getRecurringTasksByTeamLeader: async (teamLeaderId) => {
        try {
            const response = await apiClient.post('/task/getRecurringTasksForTL', {
                teamLeaderId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete or deactivate recurring task
     */
    deleteOrDeactivateRecurringTask: async (recurringTaskId, action) => {
        try {
            const response = await apiClient.post('/task/deleteOrDeactivateRecurringTask', {
                recurringTaskId,
                action
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // KAM PRODUCTIVITY
    // ============================================

    /**
     * Get KAM productivity metrics
     */
    getKamProductivity: async () => {
        try {
            const response = await apiClient.get('/task/kam-productivity');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    }
};

export default taskService;
