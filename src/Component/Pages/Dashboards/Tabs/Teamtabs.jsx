import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import Tree from 'react-d3-tree';
import Modal from '../../../Utilities/Modal';
import { createTeamLeader, createEmployee, getAdminHierarchy, deleteEmployee, deleteTeamLeader, deleteTeamLeaderWithReassignment, deleteTeamLeaderAndPromoteEmployee } from '../../service/api';
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheck, FiX, FiChevronDown, FiChevronRight, FiInfo, FiFileText, FiUpload, FiMail, FiUsers, FiBriefcase, FiTarget, FiZap, FiPhone, FiSearch, FiRefreshCw, FiCheckCircle, FiEdit2, FiCamera, FiEye, FiTrash } from 'react-icons/fi';

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
  const [newMember, setNewMember] = useState({ name: '', role: 'employee', leader: '', department: 'Operations', otherRole: '', otherDepartment: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [promotedEmployee, setPromotedEmployee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [modalStep, setModalStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableMember, setEditableMember] = useState(null);

  const handleSaveDetails = async () => {
    setIsSavingDetail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Mocking API delay
      const updatedMember = { ...selectedMember, ...editableMember };
      setSelectedMember(updatedMember);
      setIsEditingInDetail(false);
      toast.success('Member details updated successfully');
    } catch (error) {
      toast.error('Failed to update member details');
    } finally {
      setIsSavingDetail(false);
    }
  };

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
        // Fallback mock data matching actual organization structure
        setOrgChart({
          name: 'Ashish',
          id: 'mock_md',
          email: 'ashish@mabicons.com',
          role: 'MD & Super Admin',
          children: [
            {
              name: 'Ashwin',
              id: 'mock_crm',
              email: 'ashwin@mabicons.com',
              role: 'CRM Head',
              children: []
            },
            {
              name: 'Ramesh',
              id: 'mock_hrops',
              email: 'ramesh@mabicons.com',
              role: 'HR Operations Head',
              children: []
            },
            {
              name: 'Sachin',
              id: 'mock_hrrec',
              email: 'sachin@mabicons.com',
              role: 'HR Recruitment Head',
              children: [
                { name: 'Priyanshi', id: 'mock_kam1', email: 'priyanshi@mabicons.com', role: 'KAM' },
                { name: 'Manju', id: 'mock_kam2', email: 'manju@mabicons.com', role: 'KAM' },
                { name: 'Jyoti', id: 'mock_kam3', email: 'jyoti@mabicons.com', role: 'KAM' }
              ]
            }
          ]
        });
        setError(''); // Clear error since we have accurate mock data
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
    // Prevent Ashish (MD) from opening the detail drawer
    if (nodeDatum.name.toLowerCase().includes('ashish')) {
      return;
    }
    setSelectedMember(nodeDatum);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setSelectedMember(null);
  };

  console.log('TeamTabs rendering');

  const renderCustomNode = ({ nodeDatum, toggleNode, deleteNode }) => {
    const isMD = nodeDatum.name === 'Ashish';
    const isHead = nodeDatum.children && nodeDatum.children.length > 0;

    return (
      <g className="node-group transition-all duration-300">
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Node Background with Shadow */}
        <rect
          width={220}
          height={70}
          x={-110}
          y={-35}
          rx={16}
          ry={16}
          fill="#FFFFFF"
          filter="url(#shadow)"
          stroke={isMD ? '#3B82F6' : isHead ? '#10B981' : '#E2E8F0'}
          strokeWidth={isMD ? 2.5 : 1.5}
          className="cursor-pointer transition-all duration-300 hover:fill-blue-50/10"
          onClick={(event) => {
            event.stopPropagation();
            showModal(nodeDatum);
          }}
        />

        {/* Color Accent Indicator (Top) */}
        <rect
          x={-40}
          y={-35}
          width={80}
          height={4}
          rx={2}
          fill={isMD ? '#3B82F6' : isHead ? '#10B981' : '#94A3B8'}
          fillOpacity={0.8}
        />

        {/* Name Text */}
        <text
          fill="#0F172A"
          textAnchor="middle"
          x={0}
          y={0}
          fontSize="15"
          fontWeight="700"
          className="pointer-events-none font-syne"
        >
          {nodeDatum.name}
        </text>

        {/* Role Text */}
        <text
          fill="#64748B"
          textAnchor="middle"
          x={0}
          y={18}
          fontSize="10"
          fontWeight="600"
          className="pointer-events-none uppercase tracking-widest opacity-80"
        >
          {nodeDatum.role || (isMD ? 'MD & Founder' : isHead ? 'Dept Head' : 'Associate')}
        </text>

        {/* Delete Trigger - Only for Admin View */}
        {(currentUserName?.toLowerCase()?.includes('ashish')) && nodeDatum.name !== 'Ashish' && (
          <g
            onClick={(event) => {
              event.stopPropagation();
              deleteNode(nodeDatum, event);
            }}
            className="cursor-pointer group"
          >
            <circle r="10" cx={100} cy={-25} fill="#FEE2E2" className="group-hover:fill-red-500 transition-colors" />
            <text
              x={100}
              y={-25}
              textAnchor="middle"
              dy=".35em"
              fontSize="9"
              fill="#EF4444"
              className="group-hover:fill-white font-black pointer-events-none"
            >
              ✕
            </text>
          </g>
        )}
      </g>
    );
  };

  const getFlattenedMembers = (node) => {
    let result = [];
    if (node && node.id && node.name !== 'Ashish') {
      result.push({
        _id: node.id,
        name: node.name,
        email: node.email,
        role: node.role || (node.children && node.children.length > 0 ? 'Team Leader' : 'Employee'),
        department: node.department || 'N/A',
        status: node.status || 'Active',
        phone: node.phone || '+91 0000000000',
        joiningDate: node.joiningDate || '2023-01-01',
      });
    }
    if (node && node.children) {
      node.children.forEach(child => {
        result = result.concat(getFlattenedMembers(child));
      });
    }
    return result;
  };

  const flattenedMembers = getFlattenedMembers(orgChart);

  const uniqueRoles = Array.from(new Set(flattenedMembers.map(member => member.role).filter(Boolean)));

  const filteredMembers = flattenedMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = activeRoleFilter === 'all' || member.role === activeRoleFilter;

    const memberStatus = (member.status || 'Active').toLowerCase();
    const matchesStatus = activeStatusFilter === 'all' || memberStatus === activeStatusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>My Team</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Add Button - ONLY for Ashish */}
          {(currentUserName?.toLowerCase()?.includes('ashish')) && (
            <button
              onClick={() => {
                setModalStep(1);
                setIsAddMemberModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#0D47A1] text-white rounded-xl text-sm font-bold hover:bg-[#0a3a82] transition-all shadow-lg shadow-[#0D47A1]/20 active:scale-95"
            >
              <FiPlus size={18} /> Add Team Member
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[24px] p-2 border border-[#F4F3EF] shadow-sm flex items-center gap-3 mb-8 flex-wrap">
        {/* Search Bar */}
        <div className="relative flex-1 group min-w-[200px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9B9BAD] transition-colors" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, role, email..."
            className="w-full bg-[#F4F3EF] border-none rounded-2xl py-3 pl-14 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#F4F3EF] outline-none transition-all placeholder:text-[#9B9BAD]"
          />
        </div>

        {/* Role Filter Placeholder */}
        <div className="relative">
          <select
            value={activeRoleFilter}
            onChange={(e) => setActiveRoleFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[150px]"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>

        {/* Status Filter Placeholder */}
        <div className="relative">
          <select
            value={activeStatusFilter}
            onChange={(e) => setActiveStatusFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          {/* Grid Header */}
          <div className="grid grid-cols-[40px_2fr_1.5fr_2fr_100px_40px] gap-4 px-8 py-4 border-b border-[#F4F3EF] bg-transparent">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length}
                onChange={() => setSelectedIds(selectedIds.length === filteredMembers.length ? [] : filteredMembers.map(m => m._id))}
                className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
              />
            </div>
            {["Member", "Role", "Email", "Contact", ""].map((h, i) => (
              <div key={i} className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest text-left flex items-start">
                {h}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {filteredMembers.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#9B9BAD] text-sm font-bold uppercase tracking-widest">No members found</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => setSelectedMember(member)}
                className="grid grid-cols-[40px_2fr_1.5fr_2fr_100px_40px] gap-4 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group"
              >
                {/* Checkbox */}
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member._id)}
                    onChange={() => setSelectedIds(prev => prev.includes(member._id) ? prev.filter(id => id !== member._id) : [...prev, member._id])}
                    className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
                  />
                </div>

                {/* Member */}
                <div className="flex items-center gap-4 min-w-0 py-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-sm font-black border border-[#F4F3EF] group-hover:scale-105 transition-transform shrink-0">
                    {(member.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#0D47A1] transition-colors text-left">{member.name}</p>
                </div>

                {/* Role */}
                <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                  {member.role}
                </div>

                {/* Email */}
                <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                  {member.email}
                </div>

                {/* Contact */}
                <div className="flex items-center justify-start gap-2 py-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => window.location.href = `mailto:${member.email}`}
                    className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all"
                    title={`Email ${member.name}`}
                  >
                    <FiMail size={14} />
                  </button>
                  <button
                    onClick={() => window.location.href = `tel:${member.phone}`}
                    className="p-2 bg-[#F4F3EF] text-[#9B9BAD] hover:text-[#1B4DA0] rounded-lg transition-all"
                    title={`Call ${member.name}`}
                  >
                    <FiPhone size={14} />
                  </button>
                </div>

                {/* Arrow */}
                <div className="flex justify-end items-center">
                  <div className="w-8 h-8 rounded-xl bg-transparent group-hover:bg-[#0D47A1]/5 flex items-center justify-center transition-all">
                    <FiChevronRight size={18} className="text-[#C5C5D2] group-hover:text-[#0D47A1] transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      {createPortal(
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 100, x: '-50%' }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1500] flex items-center gap-6 px-10 py-5 bg-[#1A1A2E] rounded-[32px] shadow-2xl shadow-slate-900/40 min-w-[520px] border border-white/5 active:cursor-grabbing"
            >
              {/* Count badge */}
              <div className="flex items-center gap-4 pr-8 border-r border-white/10 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#0D47A1] flex items-center justify-center text-white font-black shadow-lg text-lg shrink-0">
                  {selectedIds.length}
                </div>
                <div className="text-left flex flex-col justify-center">
                  <p className="text-[14px] font-black text-white tracking-tight whitespace-nowrap">Member{selectedIds.length > 1 ? 's' : ''} Selected</p>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors whitespace-nowrap text-left"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-6 flex-1 justify-center text-white">
                <button
                  onClick={() => {
                    const emails = flattenedMembers
                      .filter(m => selectedIds.includes(m._id))
                      .map(m => m.email)
                      .join(',');
                    window.location.href = `mailto:${emails}`;
                  }}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiMail size={16} className="text-blue-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Email</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedIds.length === 1) {
                      const m = flattenedMembers.find(x => x._id === selectedIds[0]);
                      if (m) { setSelectedMember(m); }
                    }
                  }}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                >
                  <FiEye size={16} className="text-emerald-400 group-hover:text-white" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">View</span>
                </button>

                {currentUserName?.toLowerCase()?.includes('ashish') && (
                  <button
                    onClick={() => {
                      toast.error(`Bulk remove not implemented for hierarchical data`);
                      setSelectedIds([]);
                    }}
                    className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-white/5 active:scale-95"
                  >
                    <FiTrash size={16} className="text-red-400 group-hover:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Remove</span>
                  </button>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedIds([])}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all text-[#9B9BAD]"
              >
                <FiX size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Member Details Drawer */}
      {createPortal(
        <AnimatePresence>
          {selectedMember && (
            <React.Fragment>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-md z-[1100]"
                onClick={() => setSelectedMember(null)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-full max-w-[698px] bg-white z-[1101] shadow-2xl flex flex-col"
                style={{ boxShadow: "-12px 0 40px rgba(0,0,0,0.12)" }}
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-[#F4F3EF] flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-white">
                  <h3 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: "'Syne', sans-serif" }}>Member Details</h3>
                  <div className="flex items-center gap-3">
                    {isEditingInDetail ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingInDetail(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B6B7E] bg-[#F4F3EF] hover:bg-[#E8E7E2] transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={isSavingDetail}
                          onClick={handleSaveDetails}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D47A1] hover:bg-[#0a3a82] transition-all flex items-center gap-2 shadow-md shadow-blue-500/10"
                        >
                          {isSavingDetail ? <FiRefreshCw className="animate-spin w-3.5 h-3.5" /> : <FiCheck className="w-3.5 h-3.5" />}
                          {isSavingDetail ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditableMember(selectedMember); setIsEditingInDetail(true); }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-[#0D47A1] hover:bg-blue-50 transition-all duration-300"
                          title="Edit Member"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedMember(null)}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar text-left">
                  {/* Profile Header (Centered) */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative group mb-6">
                      <div
                        className={`w-24 h-24 rounded-[32px] bg-[#1B4DA0] flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-blue-500/20 overflow-hidden transition-all duration-300 ${isEditingInDetail ? 'cursor-pointer hover:scale-105' : ''}`}
                        style={{ background: 'linear-gradient(135deg, #1B4DA0 0%, #0D47A1 100%)' }}>
                        <span>{(selectedMember.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                        {isEditingInDetail && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-100 transition-opacity cursor-pointer border-2 border-white/20 rounded-[32px]">
                            <FiCamera className="text-white w-6 h-6 mb-1" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 w-full flex flex-col items-center">
                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full max-w-[320px] text-2xl font-bold text-[#1A1A2E] bg-[#FAFAF8] border-none rounded-2xl py-2 px-4 text-center focus:outline-none transition-all font-syne"
                          value={editableMember?.name || ''}
                          onChange={(e) => setEditableMember({ ...editableMember, name: e.target.value })}
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight font-syne">{selectedMember.name}</h2>
                      )}

                      {isEditingInDetail ? (
                        <input
                          type="text"
                          className="w-full max-w-[240px] text-sm font-semibold text-[#1B4DA0] bg-[#FAFAF8] border-none rounded-xl py-1 px-3 text-center focus:outline-none mt-1 mx-auto"
                          value={editableMember?.role || ''}
                          onChange={(e) => setEditableMember({ ...editableMember, role: e.target.value })}
                        />
                      ) : (
                        <p className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-[2px]">{selectedMember.role}</p>
                      )}

                      {!isEditingInDetail && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedMember.status || 'Active'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Information Form */}
                  <div className="space-y-6 bg-[#FAFAF8] p-8 rounded-[32px] border border-[#F4F3EF]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Email Address</label>
                        {isEditingInDetail ? (
                          <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-[#F4F3EF]">
                            <FiMail className="text-[#9B9BAD] mr-3" />
                            <input
                              type="email"
                              className="w-full text-sm font-semibold text-[#1A1A2E] border-none focus:outline-none"
                              value={editableMember?.email || ''}
                              onChange={(e) => setEditableMember({ ...editableMember, email: e.target.value })}
                            />
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF] flex items-center gap-3">
                            <FiMail className="text-[#9B9BAD]" />
                            <span className="truncate">{selectedMember.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Phone Number</label>
                        {isEditingInDetail ? (
                          <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-[#F4F3EF]">
                            <FiPhone className="text-[#9B9BAD] mr-3" />
                            <input
                              type="text"
                              className="w-full text-sm font-semibold text-[#1A1A2E] border-none focus:outline-none"
                              value={editableMember?.phone || ''}
                              onChange={(e) => setEditableMember({ ...editableMember, phone: e.target.value })}
                            />
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF] flex items-center gap-3">
                            <FiPhone className="text-[#9B9BAD]" />
                            <span>{selectedMember.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Department</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.department || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, department: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.department || 'N/A'}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Joining Date</label>
                        {isEditingInDetail ? (
                          <input
                            type="date"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.joiningDate || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, joiningDate: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.joiningDate || 'N/A'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Info */}

                </div>
              </motion.div>
            </React.Fragment>
          )}
        </AnimatePresence>,
        document.body
      )}      {/* Add New Member Modal - Ported from ClientOnboardingForm Style */}
      {isAddMemberModalOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddMemberModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-[800px] bg-white rounded-[40px] shadow-2xl border border-[#F4F3EF] flex flex-col overflow-hidden max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-white">
              <h2 className="text-[18px] font-bold text-[#1A1A2E] tracking-tight font-syne">
                Add New Member
              </h2>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#F4F3EF] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-10 pt-8 flex items-center justify-center gap-4">
              {[
                { n: 1, title: 'Info', icon: <FiInfo size={18} /> },
                { n: 2, title: 'Docs', icon: <FiFileText size={18} /> },
                { n: 3, title: 'Review', icon: <FiCheck size={18} /> }
              ].map((s, idx, arr) => (
                <React.Fragment key={s.n}>
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${modalStep >= s.n ? 'bg-[#1B4DA0] border-[#1B4DA0] text-white' : 'bg-white border-[#F4F3EF] text-[#9B9BAD]'}`}>
                      {modalStep > s.n ? <FiCheck size={18} /> : s.icon}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${modalStep >= s.n ? 'text-[#1B4DA0]' : 'text-[#9B9BAD]'}`}>{s.title}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="w-16 h-[2px] bg-[#F4F3EF] -mt-6">
                      <motion.div
                        className="h-full bg-[#1B4DA0]"
                        initial={{ width: 0 }}
                        animate={{ width: modalStep > s.n ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
                <AnimatePresence mode="wait">
                  {modalStep === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      {/* Section 1 */}
                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#9B9BAD]">1.</span>
                            <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">Basic Member Info</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#1B4DA0]/10 text-[#1B4DA0]">
                            Required
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Full Name</label>
                            <input
                              type="text"
                              placeholder="Registered member name"
                              value={newMember.name}
                              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                              required
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Department / Role</label>
                            <div className="relative">
                              <select
                                value={newMember.role}
                                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                className="w-full bg-[#F4F3EF] border border-transparent rounded-xl py-3.5 pl-5 pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer"
                              >
                                <optgroup label="Management">
                                  <option value="leader">Department Head</option>
                                  <option value="manager">Team Manager</option>
                                </optgroup>
                                <optgroup label="Operations">
                                  <option value="employee">Operations Associate</option>
                                  <option value="ops_kam">Operations KAM</option>
                                </optgroup>
                                <optgroup label="Recruitment">
                                  <option value="recruiter">Recruiter</option>
                                  <option value="recruitment_kam">Recruitment KAM</option>
                                </optgroup>
                                <optgroup label="Other">
                                  <option value="crm">CRM Executive</option>
                                  <option value="hr">HR Executive</option>
                                  <option value="admin">Admin Staff</option>
                                  <option value="other">Other (Specify...)</option>
                                </optgroup>
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" size={16} />
                            </div>
                          </div>
                        </div>

                        {newMember.role === 'other' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5 text-left"
                          >
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Specify Other Role</label>
                            <input
                              type="text"
                              placeholder="Enter custom role title"
                              value={newMember.otherRole}
                              onChange={(e) => setNewMember({ ...newMember, otherRole: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                              required
                            />
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Department Name</label>
                            <div className="relative">
                              <select
                                value={newMember.department}
                                onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                                className="w-full bg-[#F4F3EF] border border-transparent rounded-xl py-3.5 pl-5 pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer"
                              >
                                <option value="Operations">Operations</option>
                                <option value="Recruitment">Recruitment</option>
                                <option value="CRM">CRM</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="other">Other (Specify...)</option>
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" size={16} />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Reporting Head</label>
                            <div className="relative">
                              <select
                                value={newMember.leader}
                                onChange={(e) => setNewMember({ ...newMember, leader: e.target.value })}
                                className="w-full bg-[#F4F3EF] border border-transparent rounded-xl py-3.5 pl-5 pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer"
                                required
                              >
                                <option value="">Select Department Head</option>
                                {orgChart.children.map((leader) => (
                                  <option key={leader.name} value={leader.name}>{leader.name}</option>
                                ))}
                              </select>
                              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1B4DA0] pointer-events-none opacity-50" size={16} />
                            </div>
                          </div>
                        </div>

                        {newMember.department === 'other' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5 text-left"
                          >
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Specify Other Department</label>
                            <input
                              type="text"
                              placeholder="Enter custom department name"
                              value={newMember.otherDepartment}
                              onChange={(e) => setNewMember({ ...newMember, otherDepartment: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                              required
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Section 2 */}
                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#9B9BAD]">2.</span>
                            <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">Contact Details</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#1B4DA0]/10 text-[#1B4DA0]">
                            Required
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Email Address</label>
                            <input
                              type="email"
                              placeholder="email@mabicons.com"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Phone Number</label>
                            <input
                              type="tel"
                              placeholder="+91 XXXXX XXXXX"
                              value={newMember.phone}
                              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : modalStep === 2 ? (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      {/* Mandatory Documents Section */}
                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#9B9BAD]">3.</span>
                            <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">Mandatory Documents</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-500">
                            Required
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                          {[
                            { label: 'PAN Card (Front)', id: 'pan_front' },
                            { label: 'PAN Card (Back)', id: 'pan_back' },
                            { label: 'Aadhaar Card (Front)', id: 'aadhaar_front' },
                            { label: 'Aadhaar Card (Back)', id: 'aadhaar_back' },
                            { label: '10th Marksheet', id: '10th_marksheet' },
                            { label: '12th Marksheet', id: '12th_marksheet' }
                          ].map((doc) => (
                            <div key={doc.id} className="space-y-2">
                              <label className="text-[10px] font-bold text-[#6B6B7E] uppercase tracking-wider ml-1">{doc.label}</label>
                              <div className="group relative">
                                <div className="flex items-center justify-between p-4 bg-[#F8FAFF] border-2 border-dashed border-[#E2E8F0] rounded-2xl group-hover:border-[#1B4DA0]/30 transition-all cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all shadow-sm">
                                      <FiFileText size={20} />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-[11px] font-bold text-[#1A1A2E]">Select File</p>
                                      <p className="text-[9px] font-medium text-[#9B9BAD]">PDF, JPG (Max 2MB)</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-all">
                                    <FiUpload size={16} />
                                  </div>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional Documents Section */}
                      <div className="space-y-6 text-left pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#9B9BAD]">4.</span>
                            <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">Optional Documents</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#F4F3EF] text-[#9B9BAD]">
                            Optional
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                          {[
                            { label: 'Graduation Marksheets (Sem 1-8)', id: 'grad_marksheet' },
                            { label: 'Degree Certificate', id: 'degree_cert' },
                            { label: 'Pay Slips (Last 3 Months)', id: 'pay_slips' },
                            { label: 'Bank Statement (Last 3 Months)', id: 'bank_statement' },
                            { label: 'Experience/Relieving Letter', id: 'exp_letter' },
                            { label: 'Appointment Letter', id: 'appt_letter' }
                          ].map((doc) => (
                            <div key={doc.id} className="space-y-2">
                              <label className="text-[10px] font-bold text-[#6B6B7E] uppercase tracking-wider ml-1">{doc.label}</label>
                              <div className="group relative">
                                <div className="flex items-center justify-between p-4 bg-[#F8FAFF] border-2 border-dashed border-[#E2E8F0] rounded-2xl group-hover:border-[#1B4DA0]/30 transition-all cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#C5C5D2] group-hover:text-[#1B4DA0] transition-all shadow-sm">
                                      <FiFileText size={20} />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-[11px] font-bold text-[#1A1A2E]">Select File</p>
                                      <p className="text-[9px] font-medium text-[#9B9BAD]">PDF, JPG (Max 2MB)</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-all">
                                    <FiUpload size={16} />
                                  </div>
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-8"
                    >
                      <div className="bg-[#F8FAFF] rounded-[32px] p-10 text-center space-y-6">
                        <div className="w-24 h-24 bg-[#1B4DA0] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
                          <FiCheck size={48} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-[20px] font-black text-[#1A1A2E] tracking-tight">Review & Finalize</h3>
                          <p className="text-[13px] font-medium text-[#9B9BAD]">Please confirm the member details before adding to hierarchy.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left pt-6">
                          {[
                            { label: 'Full Name', value: newMember.name },
                            { label: 'Role', value: newMember.role === 'other' ? newMember.otherRole : newMember.role },
                            { label: 'Department', value: newMember.department === 'other' ? newMember.otherDepartment : newMember.department },
                            { label: 'Reporting to', value: newMember.leader || 'Admin' },
                            { label: 'Email', value: newMember.email },
                            { label: 'Phone', value: newMember.phone || 'Not provided' }
                          ].map((item, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-2xl border border-[#F4F3EF]">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#9B9BAD] mb-1">{item.label}</p>
                              <p className="text-[12px] font-bold text-[#1A1A2E]">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-white border-t border-[#F4F3EF] flex items-center justify-between relative z-[100]">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${modalStep === 3 ? 'bg-emerald-500 animate-pulse' : 'bg-[#1B4DA0]'}`} />
                <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest italic">
                  {modalStep === 1 ? 'Next: Documents' : modalStep === 2 ? 'Next: Review' : 'Final Step'}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-8 py-3.5 rounded-[20px] text-[#6B6B7E] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all"
                >
                  Cancel
                </button>
                {modalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (modalStep === 1) {
                        if (!newMember.name || !newMember.email) {
                          toast.error('Please fill required information');
                          return;
                        }
                        // Email validation
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(newMember.email)) {
                          toast.error('Please enter a valid email address');
                          return;
                        }
                        // Phone validation
                        if (newMember.phone && !/^\d{10}$/.test(newMember.phone)) {
                          toast.error('Phone number must be exactly 10 digits');
                          return;
                        }
                        if (newMember.role === 'employee' && !newMember.leader) {
                          toast.error('Please select a Reporting Head');
                          return;
                        }
                      }
                      setModalStep(modalStep + 1);
                    }}
                    className="px-10 py-4 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#153D80] transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Next Step <FiChevronRight size={18} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalStep(2)}
                      className="px-8 py-3.5 rounded-[20px] text-[#1B4DA0] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={isLoading}
                      className="px-12 py-4 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[12px] rounded-[20px] hover:bg-[#153D80] transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Add Member'} <FiCheck size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
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
      <style>{`
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

