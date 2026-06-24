/**
 * NOTIFICATION SERVICE
 * Handles all notification-related API calls
 */

import apiClient, { parseError, getResponseData } from './api';

export const notificationService = {
    /**
     * Get all notifications for a user
     */
    getAllNotifications: async (userId) => {
        try {
            const response = await apiClient.post('/notification/get-all', {
                userId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (notificationId) => {
        try {
            const response = await apiClient.post('/notification/mark-read', {
                notificationId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Mark notification as unread
     */
    markAsUnread: async (notificationId) => {
        try {
            const response = await apiClient.post('/notification/mark-unread', {
                notificationId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (userId) => {
        try {
            const response = await apiClient.post('/notification/mark-all-read', {
                userId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete single notification
     */
    deleteNotification: async (notificationId) => {
        try {
            const response = await apiClient.delete('/notification/delete-one', {
                data: { notificationId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete all notifications for a user
     */
    deleteAllNotifications: async (userId) => {
        try {
            const response = await apiClient.delete('/notification/delete-all', {
                data: { userId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    }
};

export default notificationService;
