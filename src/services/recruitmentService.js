/**
 * RECRUITMENT SERVICE
 * Handles all recruitment and candidate-related API calls
 */

import apiClient, { parseError, getResponseData } from './api';

export const recruitmentService = {
    // ============================================
    // RECRUITMENT POSITIONS
    // ============================================

    /**
     * Create recruitment request
     */
    createRequest: async (positionData) => {
        try {
            const response = await apiClient.post('/recruitment/create-request', positionData);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get recruitment requests
     */
    getRequests: async (teamLeaderId) => {
        try {
            const response = await apiClient.get('/recruitment/getRequests', {
                params: { teamLeaderId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Accept recruitment request
     */
    acceptRequest: async (reason, teamLeaderId, clientId) => {
        try {
            const response = await apiClient.post('/recruitment/accept', {
                reason,
                teamLeaderId,
                clientId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Reject recruitment request
     */
    rejectRequest: async (reason, teamLeaderId, clientId) => {
        try {
            const response = await apiClient.post('/recruitment/reject', {
                reason,
                teamLeaderId,
                clientId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // CANDIDATES
    // ============================================

    /**
     * Get shortlisted candidates
     */
    getShortlistedCandidates: async (candidateIds) => {
        try {
            const response = await apiClient.post('/recruitment/shortlisted', {
                candidateIds
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Upload resumes
     */
    uploadResumes: async (formData) => {
        try {
            const response = await apiClient.post('/recruitment/uploadResumes', formData, {
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
    // CANDIDATE PROFILE & KYC
    // ============================================

    /**
     * Get candidate profile
     */
    getCandidateProfile: async () => {
        try {
            const response = await apiClient.get('/recruitment/candidate/profile');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Upload candidate KYC
     */
    uploadCandidateKYC: async (formData) => {
        try {
            const response = await apiClient.post('/recruitment/candidate/upload-kyc', formData, {
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
     * Submit candidate KYC
     */
    submitCandidateKYC: async () => {
        try {
            const response = await apiClient.post('/recruitment/candidate/submit-kyc');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Verify candidate KYC
     */
    verifyCandidateKYC: async (kycData) => {
        try {
            const response = await apiClient.post('/recruitment/candidate/verify-kyc', {
                kycData
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Bulk verify candidate KYC
     */
    bulkVerifyCandidateKYC: async (candidateIds) => {
        try {
            const response = await apiClient.post('/recruitment/candidate/bulk-verify-kyc', {
                candidateIds
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // OFFER LETTERS
    // ============================================

    /**
     * Attach final offer letter
     */
    attachFinalOfferLetter: async (candidateId, formData) => {
        try {
            const response = await apiClient.post('/recruitment/candidate/attach-final-offer', formData, {
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
     * Get offer templates
     */
    getOfferTemplates: async () => {
        try {
            const response = await apiClient.get('/recruitment/offer-templates');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get all offers
     */
    getAllOffers: async () => {
        try {
            const response = await apiClient.get('/recruitment/offers');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get offer candidate suggestions
     */
    getOfferSuggestions: async () => {
        try {
            const response = await apiClient.get('/recruitment/offers/suggestions');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Delete offer
     */
    deleteOffer: async (candidateId) => {
        try {
            const response = await apiClient.delete('/recruitment/offers', {
                data: { candidateId }
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // CANDIDATE CREDENTIALS
    // ============================================

    /**
     * Generate candidate credentials
     */
    generateCredentials: async (candidateId) => {
        try {
            const response = await apiClient.post('/recruitment/candidate/generate-credentials', {
                candidateId
            });
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    // ============================================
    // RESUME BANK
    // ============================================

    /**
     * Get resume bank stats
     */
    getResumeBankStats: async () => {
        try {
            const response = await apiClient.get('/resumeBank/stats');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get resume role types
     */
    getResumeRoleTypes: async () => {
        try {
            const response = await apiClient.get('/resumeBank/role-types');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get resume bank resumes
     */
    getResumeBankResumes: async () => {
        try {
            const response = await apiClient.get('/resumeBank/resumes');
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    },

    /**
     * Get resume details
     */
    getResumeDetails: async (resumeId) => {
        try {
            const response = await apiClient.get(`/resumeBank/resumes/${resumeId}`);
            return getResponseData(response);
        } catch (error) {
            throw new Error(parseError(error));
        }
    }
};

export default recruitmentService;
