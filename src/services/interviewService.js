/**
 * INTERVIEW SERVICE
 * Handles all interview-related API calls
 */

import apiClient, { parseError, getResponseData } from './api';

export const interviewService = {
    /**
     * Get all interviews
     */
    getAllInterviews: async (filters = {}) => {
        try {
            const response = await apiClient.get('/interview', { params: filters });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Schedule interview
     */
    scheduleInterview: async (interviewData) => {
        try {
            const response = await apiClient.post('/interview/schedule', interviewData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get interview by token (candidate view)
     */
    getInterviewByToken: async (token) => {
        try {
            const response = await apiClient.get(`/interview/join/${token}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get interview by ID
     */
    getInterviewById: async (interviewId) => {
        try {
            const response = await apiClient.get(`/interview/${interviewId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Update interview status
     */
    updateInterviewStatus: async (interviewId, statusData) => {
        try {
            const response = await apiClient.put(`/interview/${interviewId}/status`, statusData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Update interview
     */
    updateInterview: async (interviewId, interviewData) => {
        try {
            const response = await apiClient.put(`/interview/${interviewId}`, interviewData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get interview feedback form
     */
    getInterviewFeedbackForm: async (interviewId) => {
        try {
            const response = await apiClient.get(`/interview/${interviewId}/feedback-form`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Submit interview feedback
     */
    submitInterviewFeedback: async (interviewId, feedbackData) => {
        try {
            const response = await apiClient.post(`/interview/${interviewId}/feedback`, feedbackData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Send interview reminder
     */
    sendInterviewReminder: async (interviewId) => {
        try {
            const response = await apiClient.post(`/interview/${interviewId}/remind`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Cancel interview
     */
    cancelInterview: async (interviewId) => {
        try {
            const response = await apiClient.delete(`/interview/${interviewId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Hard delete interview
     */
    deleteInterview: async (interviewId) => {
        try {
            const response = await apiClient.delete(`/interview/${interviewId}/hard`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    }
};

export default interviewService;
