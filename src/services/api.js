/**
 * MABICONS ERP - CENTRAL API CONFIGURATION
 * Axios instance with interceptors for auth and error handling
 */

import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// AUTH
export const loginUser = (data) => api.post('/api/auth/login', data)
export const registerUser = (data) => api.post('/api/auth/register', data)
export const logoutUser = () => api.post('/api/auth/logout')

// EMPLOYEES
export const getEmployees = () => api.get('/api/employees')
export const getEmployeeById = (id) => api.get(`/api/employees/${id}`)
export const createEmployee = (data) => api.post('/api/employees', data)
export const updateEmployee = (id, data) => api.put(`/api/employees/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`)
export const resetEmployeePassword = (id, password) =>
    api.post(`/api/employees/${id}/reset-password`, { password })

// TEAM LEADERS
export const createTeamLeader = (data) => api.post('/api/teamleaders', data)
export const getAdminHierarchy = (id, role) =>
    api.get(`/api/teamleaders/hierarchy/${id}?role=${role}`)
export const deleteTeamLeader = (id) => api.delete(`/api/teamleaders/${id}`)
export const deleteTeamLeaderWithReassignment = (data) =>
    api.post('/api/teamleaders/delete-reassign', data)
export const deleteTeamLeaderAndPromoteEmployee = (data) =>
    api.post('/api/teamleaders/delete-promote', data)

// CLIENTS
export const getClients = () => api.get('/api/clients')
export const getClientById = (id) => api.get(`/api/clients/${id}`)
export const createClient = (data) => api.post('/api/clients', data)
export const updateClient = (id, data) => api.put(`/api/clients/${id}`, data)
export const deleteClient = (id) => api.delete(`/api/clients/${id}`)
export const createClientReview = (data) => api.post('/api/clients/review', data)
export const getClientReviews = (id) => api.get(`/api/clients/${id}/reviews`)

// TASKS
export const getTasks = () => api.get('/api/tasks')
export const createTask = (data) => api.post('/api/tasks', data)
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`)

// RECRUITMENT
export const getCandidates = () => api.get('/api/recruitment/candidates')
export const createCandidate = (data) => api.post('/api/recruitment/candidates', data)
export const updateCandidate = (id, data) =>
    api.put(`/api/recruitment/candidates/${id}`, data)
export const deleteCandidate = (id) =>
    api.delete(`/api/recruitment/candidates/${id}`)

// INTERVIEWS
export const getInterviews = () => api.get('/api/interviews')
export const scheduleInterview = (data) => api.post('/api/interviews', data)
export const updateInterview = (id, data) => api.put(`/api/interviews/${id}`, data)
export const deleteInterview = (id) => api.delete(`/api/interviews/${id}`)

// NOTIFICATIONS
export const getNotifications = (userId) =>
    api.get(`/api/notifications/${userId}`)
export const markNotificationRead = (id) =>
    api.put(`/api/notifications/${id}/read`)
export const deleteNotification = (id) => api.delete(`/api/notifications/${id}`)

// ATTENDANCE
export const getAttendance = (employeeId, month, year) =>
    api.get(`/api/attendance/${employeeId}?month=${month}&year=${year}`)
export const markAttendance = (data) => api.post('/api/attendance', data)

// SALARY
export const getSalary = (employeeId) =>
    api.get(`/api/salary/${employeeId}`)
export const updateSalary = (employeeId, data) =>
    api.put(`/api/salary/${employeeId}`, data)

// ADMIN
export const getDashboardStats = () => api.get('/api/admin/stats')
export const getDashboardKpiDetails = (type) =>
    api.get(`/api/admin/kpi-details/${type}`);
export const getAllUsers = () => api.get('/api/admin/users')

export default api
