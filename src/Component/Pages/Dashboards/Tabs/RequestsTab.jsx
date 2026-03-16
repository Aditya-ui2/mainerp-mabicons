import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { getClientRequestedTasks, assignOrRejectTask, getAdminHierarchy } from '../../service/api';
import { jwtDecode } from 'jwt-decode';
const RequestsTab = ({ isDarkMode }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
const decoded=jwtDecode(localStorage.getItem('token'));
console.log(decoded.id);

  useEffect(() => {
    fetchRequests(decoded.id);
    fetchTeamHierarchy();
  }, []);

  const fetchRequests = async (teamLeaderId) => {
    try {
      setLoading(true);
      const response = await getClientRequestedTasks(teamLeaderId);
      setRequests(response.requestedTasks || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamHierarchy = async () => {
    try {
      const response = await getAdminHierarchy(decoded.id, 'TeamLeader');
      console.log('Hierarchy Response:', response);
      
      // Handle the actual response structure
      const teamLeader = response?.teamLeader;
      if (!teamLeader || !teamLeader.employees) {
        throw new Error('TeamLeader data not found');
      }
      
      // Map employees to the expected format
      const allMembers = teamLeader.employees.map(emp => ({
        id: emp._id,
        name: emp.name,
        type: 'Employee'
      }));
      
      console.log('Processed team members:', allMembers);
      setTeamMembers(allMembers);
    } catch (err) {
      console.error('Error fetching team hierarchy:', err);
      setError(err.message || 'Failed to fetch team members');
    }
  };

  const handleTaskAction = async (taskId, action) => {
    console.log('handleTaskAction called with:', { taskId, action }); // Debug log
    
    if (action === 'accept') {
      console.log('Setting current task and showing modal');
      setCurrentTaskId(taskId);
      setShowAssignModal(true);
    } else {
      const rejectionReason = "The task does not align with current project priorities."; // Define rejection reason
      try {
        console.log('Rejecting task:', taskId);
        await assignOrRejectTask({
          requestedTaskId: taskId,
          teamLeaderId: decoded.id,
          action: 'reject',
          rejectionReason:rejectionReason // Include rejection reason
        });
        fetchRequests(decoded.id);
      } catch (err) {
        console.error('Error handling task action:', err);
        setError(err.message || 'Failed to handle task action');
      }
    }
  };

  const handleAssignTask = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('Assigning task:', {
        requestedTaskId: currentTaskId,
        teamLeaderId: decoded.id,
        assignedUserId: selectedUser,
        action: 'accept'
      });

      await assignOrRejectTask({
        requestedTaskId: currentTaskId,
        teamLeaderId: decoded.id,
        action: 'accept',
        assignedUserId: selectedUser,
        assignedUserType: 'Employee' // Since we only have employees in the team leader response
      });
      
      setShowAssignModal(false);
      setSelectedUser('');
      setCurrentTaskId(null);
      fetchRequests(decoded.id);
    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.message || 'Failed to assign task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTaskList = (tasks, status) => {
    const filteredTasks = tasks.filter(task => task.status === status);
    
    if (filteredTasks.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className={`text-xl font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {status} Tasks
        </h3>
        <div className="space-y-4">
          {filteredTasks.map((request) => (
            <div 
              key={request._id}
              className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{request.title}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Requested by: {request.client?.name || 'Unknown Client'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    getStatusColor(request.status)
                  }`}>
                    {request.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    request.priority === 'High' ? 'bg-red-100 text-red-800' :
                    request.priority === 'Normal' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.priority}
                  </span>
                </div>
              </div>
              
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                {request.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiClock className="text-gray-400" />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Deadline: {new Date(request.dueDate).toLocaleDateString()}
                  </span>
                </div>
                
                {request.status === 'Requested' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTaskAction(request._id, 'accept')}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <FiCheck />
                    </button>
                    <button 
                      onClick={() => handleTaskAction(request._id, 'reject')}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex justify-center items-center h-full p-8"
      >
        <FiLoader className="animate-spin text-4xl" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-8 text-red-500 text-center"
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8"
    >
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <h2 className="text-2xl font-bold mb-6">Task Requests</h2>
        
        {/* Render Requested Tasks First */}
        {renderTaskList(requests, 'Requested')}
        
        {/* Render Accepted Tasks */}
        {renderTaskList(requests, 'Accepted')}
        
        {/* Render Rejected Tasks */}
        {renderTaskList(requests, 'Rejected')}
        
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No task requests found
          </div>
        )}
      </div>
      
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg w-96`}>
            <h3 className="text-xl font-bold mb-4">Assign Task</h3>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className={`w-full p-2 mb-4 rounded border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
            >
              <option value="">Select team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser('');
                  setCurrentTaskId(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={!selectedUser}
                className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
                  !selectedUser && 'opacity-50 cursor-not-allowed'
                }`}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RequestsTab;