import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import Modal from '../../../Utilities/Modal';
import { createTeamLeader, createEmployee, getAdminHierarchy, deleteEmployee, deleteTeamLeader, deleteTeamLeaderWithReassignment, deleteTeamLeaderAndPromoteEmployee } from '../../service/api';
import { jwtDecode } from "jwt-decode";

const customNodeStyles = {
  shape: 'rect',
  shapeProps: {
    rx: 10,
    ry: 10,
    width: 200,
    height: 60,
    x: -100,
    y: -30,
  },
};

const getNodeColor = (node) => {
  if (node.name === 'Admin') return '#3498db';
  if (node.children) return '#e74c3c';
  return '#34495e'; // Employee
};

const TeamTabs = ({ isDarkMode }) => {
  const [orgChart, setOrgChart] = useState({ name: '', children: [] });
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'employee', leader: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [promotedEmployee, setPromotedEmployee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        // Robust ID extraction including potential fallbacks
        const id = decoded.id || decoded._id || decoded.adminId || decoded.userId || localStorage.getItem('userId');
        const role = decoded.role || decoded.userType || localStorage.getItem('userRole') || '';
        const name = decoded.name || localStorage.getItem('userName') || '';
        
        setUserRole(role);
        setCurrentUserName(name);
        setCurrentUserId(id);

        if (!id) {
          throw new Error('User ID not found in token. Please log in again.');
        }

        const hierarchyRole = (role.toLowerCase().includes('super admin') || role.toLowerCase() === 'superadmin') ? 'Admin' : role;
        const response = await getAdminHierarchy(id, hierarchyRole);
        console.log('API Response:', response); // Debug log
        
        let transformedData;
        
        if (role === 'TeamLeader') {
          const teamLeader = response?.teamLeader;
          if (!teamLeader) {
            throw new Error('TeamLeader data not found');
          }
          
          transformedData = {
            name: teamLeader.name || 'Unknown',
            id: teamLeader._id,
            email: teamLeader.email,
            children: Array.isArray(teamLeader.employees) 
              ? teamLeader.employees.map(emp => ({
                  name: emp.name || 'Unknown',
                  id: emp._id,
                  email: emp.email
                }))
              : []
          };
        } else {
          const adminHierarchy = response?.adminHierarchy;
          if (!adminHierarchy) {
            throw new Error('Admin hierarchy not found');
          }
          
          transformedData = {
            name: adminHierarchy.name || 'Unknown',
            id: adminHierarchy._id,
            email: adminHierarchy.email,
            children: Array.isArray(adminHierarchy.teamLeaders)
              ? adminHierarchy.teamLeaders.map(tl => ({
                  name: tl.name || 'Unknown',
                  id: tl._id,
                  email: tl.email,
                  children: Array.isArray(tl.employees)
                    ? tl.employees.map(emp => ({
                        name: emp.name || 'Unknown',
                        id: emp._id,
                        email: emp.email
                      }))
                    : []
                }))
              : []
          };
        }

        console.log('Transformed Data:', transformedData); // Debug log
        
        if (!transformedData?.name) {
          throw new Error('Invalid data structure received');
        }
        
        setOrgChart(transformedData);
      } catch (error) {
        console.error('Hierarchy Error:', error);
        setError(error.message || 'Failed to fetch hierarchy');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHierarchy();
  }, []);

  if (isLoading && !orgChart.children.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && !orgChart.children.length) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  const addNewMember = () => {
    if (userRole === 'TeamLeader') {
      setNewMember(prev => ({
        ...prev,
        role: 'employee',
        leader: orgChart.name,
      }));
    }
    setIsAddMemberModalOpen(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (userRole === 'TeamLeader') {
        const employeeData = {
          name: newMember.name,
          email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          teamLeaderId: currentUserId,
          phone: newMember.phone || "+1234567890"
        };

        const response = await createEmployee(employeeData);
        
        const newOrgChart = { ...orgChart };
        if (!newOrgChart.children) newOrgChart.children = [];
        newOrgChart.children.push({ 
          name: response.employee.name,
          id: response.employee._id
        });
        setOrgChart(newOrgChart);
      } else {
        if (newMember.role === 'leader') {
          const token = localStorage.getItem('token');
          const decoded = jwtDecode(token);
          const adminId = decoded.id || decoded._id || decoded.adminId;

          const teamLeaderData = {
            name: newMember.name,
            email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            adminId: adminId,
            phone: newMember.phone || "+1234567890"
          };

          const response = await createTeamLeader(teamLeaderData);
          
          const newOrgChart = { ...orgChart };
          newOrgChart.children.push({ 
            name: response.teamLeader.name,
            id: response.teamLeader._id,
            children: []
          });
          
          setOrgChart(newOrgChart);
        } else {
          const selectedLeader = orgChart.children.find(child => child.name === newMember.leader);
          
          if (!selectedLeader || !selectedLeader.id) {
            throw new Error('Selected team leader not found');
          }

          const employeeData = {
            name: newMember.name,
            email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            teamLeaderId: selectedLeader.id,
            phone: newMember.phone || "+1234567890"
          };

          const response = await createEmployee(employeeData);

          const newOrgChart = { ...orgChart };
          const leaderNode = newOrgChart.children.find(child => child.name === newMember.leader);
          if (leaderNode) {
            if (!leaderNode.children) leaderNode.children = [];
            leaderNode.children.push({ 
              name: response.employee.name,
              id: response.employee._id
            });
          }
          setOrgChart(newOrgChart);
        }
      }

      setIsAddMemberModalOpen(false);
      setNewMember({ 
        name: '', 
        role: 'employee', 
        leader: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      setError(error.message || 'Failed to create member');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNode = (node, event) => {
    event.stopPropagation();
    setMemberToDelete(node);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    
    try {
      setIsLoading(true);
      
      // If it's a team leader (has children)
      if (memberToDelete.children) {
        if (promotedEmployee) {
          // If a new team leader is selected, reassign team members
          await deleteTeamLeaderWithReassignment({
            teamLeaderId: memberToDelete.id,
            newTeamLeaderId: promotedEmployee
          });
        } else {
          // If no new leader selected, just delete the team leader
          await deleteTeamLeaderAndPromoteEmployee({
            oldTeamLeaderId: memberToDelete.id
          });
        }
      } else {
        // If it's an employee
        await deleteEmployee(memberToDelete.id);
      }
      
      // Refresh the hierarchy data after deletion
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const { id, role } = decoded;
      const response = await getAdminHierarchy(id, role);
      
      // Transform and update the org chart
      let transformedData;
      if (role === 'TeamLeader') {
        transformedData = {
          name: response.teamLeader.name,
          id: response.teamLeader._id,
          email: response.teamLeader.email,
          children: response.teamLeader.employees.map(emp => ({
            name: emp.name,
            id: emp._id,
            email: emp.email
          }))
        };
      } else {
        transformedData = {
          name: response.adminHierarchy.name,
          id: response.adminHierarchy._id,
          email: response.adminHierarchy.email,
          children: response.adminHierarchy.teamLeaders.map(tl => ({
            name: tl.name,
            id: tl._id,
            email: tl.email,
            children: tl.employees ? tl.employees.map(emp => ({
              name: emp.name,
              id: emp._id,
              email: emp.email
            })) : []
          }))
        };
      }

      setOrgChart(transformedData);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      setPromotedEmployee('');
    } catch (error) {
      setError(error.message || 'Failed to delete member');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = (nodeDatum) => {
    console.log('showModal called for:', nodeDatum.name);
    setSelectedMember(nodeDatum);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setSelectedMember(null);
  };

  console.log('TeamTabs rendering');

  const renderCustomNode = ({ nodeDatum, toggleNode, deleteNode }) => (
    <g>
      <rect
        {...customNodeStyles.shapeProps}
        fill={getNodeColor(nodeDatum)}
        stroke="#2c3e50"
        strokeWidth={2}
        onClick={(event) => {
          event.stopPropagation();
          console.log('Node clicked:', nodeDatum.name);
          showModal(nodeDatum);
        }}
        cursor="pointer"
      />
      <rect
        x={customNodeStyles.shapeProps.x + 5}
        y={customNodeStyles.shapeProps.y + 5}
        width={customNodeStyles.shapeProps.width - 10}
        height={customNodeStyles.shapeProps.height - 10}
        fill="rgba(255, 255, 255, 0.7)"
        rx={8}
        ry={8}
      />
      <text
        fill="#333333"
        strokeWidth="0.5"
        textAnchor="middle"
        dy="-0.5em"
        fontSize="14"
        fontWeight="bold"
        x={0}
        y={0}
      >
        {nodeDatum.name}
      </text>
      <text
        fill="#666666"
        strokeWidth="0.5"
        textAnchor="middle"
        dy="1em"
        fontSize="12"
        x={0}
        y={0}
      >
        {nodeDatum.name === orgChart.name 
          ? 'Admin'
          : nodeDatum.children 
            ? 'Team Leader' 
            : 'Team Member'
        }
      </text>
      {nodeDatum.name !== orgChart.name && (
        <>
          <circle
            r="10"
            cx={customNodeStyles.shapeProps.x + customNodeStyles.shapeProps.width + 20}
            cy={customNodeStyles.shapeProps.y + customNodeStyles.shapeProps.height / 2}
            fill="#e74c3c"
            onClick={(event) => deleteNode(nodeDatum, event)}
            cursor="pointer"
          />
          <text
            x={customNodeStyles.shapeProps.x + customNodeStyles.shapeProps.width + 20}
            y={customNodeStyles.shapeProps.y + customNodeStyles.shapeProps.height / 2}
            textAnchor="middle"
            dy=".3em"
            fontSize="12"
            fill="white"
            onClick={(event) => deleteNode(nodeDatum, event)}
            cursor="pointer"
          >
            X
          </text>
        </>
      )}
    </g>
  );

  return (
    <div className={`w-full h-[calc(100vh-100px)] ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 transition-colors duration-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Company Hierarchy</h2>
          {((userRole?.toLowerCase()?.includes('super admin') || userRole?.toLowerCase()?.includes('crm')) && 
            (currentUserName?.toLowerCase()?.includes('ashish') || currentUserName?.toLowerCase()?.includes('ashwin'))) && (
            <button
              onClick={addNewMember}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Add New Member
            </button>
          )}
        </div>
        <div className="w-full h-[calc(100%-4rem)] bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4" id="treeWrapper">
          <Tree
            data={orgChart}
            orientation="vertical"
            renderCustomNodeElement={(rd3tProps) => (
              <g onClick={(event) => {
                event.stopPropagation();
                console.log('Node wrapper clicked:', rd3tProps.nodeDatum.name);
                showModal(rd3tProps.nodeDatum);
              }}>
                {renderCustomNode({ 
                  ...rd3tProps, 
                  showModal,
                  deleteNode: (node, event) => {
                    event.stopPropagation();
                    setMemberToDelete(node);
                    setIsDeleteModalOpen(true);
                  }
                })}
              </g>
            )}
            pathFunc="step"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            translate={{ x: 400, y: 80 }}
            zoomable={true}
            collapsible={true}
            initialDepth={5}
            nodeSize={{ x: 250, y: 120 }}
            pathClassFunc={() => 'custom-link'}
          />
        </div>
      </div>
      <Modal isOpen={selectedMember !== null} onClose={closeModal}>
        {selectedMember && (
          <div className="p-4">
            <h3 className="text-xl font-bold mb-4">{selectedMember.name}</h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                Email: {selectedMember.email}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Role: {
                  selectedMember.name === orgChart.name 
                    ? 'Admin'
                    : selectedMember.children 
                      ? 'Team Leader' 
                      : 'Team Member'
                }
              </p>
              {selectedMember.children && (
                <p className="text-gray-600 dark:text-gray-300">
                  Team Size: {selectedMember.children.length}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Add New {userRole === 'TeamLeader' ? 'Team Member' : 'Member'}
          </h3>
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                required
              />
            </div>

            {userRole === 'Admin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="employee">Employee</option>
                    <option value="leader">Team Leader</option>
                  </select>
                </div>

                {newMember.role === 'employee' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Leader
                    </label>
                    <select
                      value={newMember.leader}
                      onChange={(e) => setNewMember({ ...newMember, leader: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      required
                    >
                      <option value="">Select a leader</option>
                      {orgChart.children.map((leader) => (
                        <option key={leader.name} value={leader.name}>{leader.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder={`${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setIsAddMemberModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Confirm Deletion</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete {memberToDelete?.name}?
          </p>
          
          {memberToDelete?.children && memberToDelete.children.length > 0 && (
            <div className="mb-6">
              <p className="text-red-500 mb-2">
                Warning: This team leader has {memberToDelete.children.length} team members.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reassign team members to another leader (optional):
                </label>
                <select
                  value={promotedEmployee}
                  onChange={(e) => setPromotedEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  <option value="">Select a team leader</option>
                  {orgChart.children
                    .filter(leader => leader.id !== memberToDelete.id) // Exclude current TL
                    .map((leader) => (
                      <option key={leader.id} value={leader.id}>
                        {leader.name}
                      </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setPromotedEmployee('');
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMember}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
      <style jsx>{`
        .custom-link {
          stroke: #95a5a6;
          stroke-width: 2;
        }
        .dark .custom-link {
          stroke: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default TeamTabs;

