import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import Tree from 'react-d3-tree';
import Modal from '../../../Utilities/Modal';
import { createTeamLeader, createEmployee, getAdminHierarchy, deleteEmployee, deleteTeamLeader, deleteTeamLeaderWithReassignment, deleteTeamLeaderAndPromoteEmployee, updateEmployee, resetEmployeePassword, getEmployeeAttendance } from '../../service/api';
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheck, FiX, FiChevronDown, FiChevronRight, FiInfo, FiFileText, FiUpload, FiMail, FiUsers, FiBriefcase, FiTarget, FiZap, FiPhone, FiSearch, FiRefreshCw, FiCheckCircle, FiEdit2, FiCamera, FiEye, FiTrash, FiUserX } from 'react-icons/fi';
import { validatePhone } from '../../../Utilities/validationUtils';

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

const TeamTabs = ({ isDarkMode, notificationBell }) => {
  const [orgChart, setOrgChart] = useState({ name: '', children: [] });
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'employee',
    leader: '',
    department: 'Operations',
    otherRole: '',
    otherDepartment: '',
    documents: {},
    bankAccount: '',
    pfNumber: '',
    uanNumber: '',
    salary: '',
    leavesPerMonth: ''
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [promotedEmployee, setPromotedEmployee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [isRequesterTech, setIsRequesterTech] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDeptFilter, setActiveDeptFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('Active');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showLeftModal, setShowLeftModal] = useState(false);

  const [isEditingInDetail, setIsEditingInDetail] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [editableMember, setEditableMember] = useState(null);
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().getMonth());
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const handleFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        setNewMember(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docId]: {
              name: file.name,
              url: base64Url,
              uploadedAt: new Date().toISOString()
            }
          }
        }));
        toast.success(`${file.name} selected`);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateMemberDocumentsInTree = (node, memberId, updatedDocuments) => {
    if (!node) return null;
    const nodeId = node.id || node._id;
    if (nodeId === memberId) {
      return {
        ...node,
        documents: updatedDocuments
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children.map(child => updateMemberDocumentsInTree(child, memberId, updatedDocuments))
      };
    }
    return node;
  };

  const handleUploadExistingMemberDoc = (e, docId, docLabel) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        setSelectedMember(prev => {
          if (!prev) return null;
          const updatedDocs = {
            ...prev.documents,
            [docId]: {
              name: file.name,
              url: base64Url,
              uploadedAt: new Date().toISOString()
            }
          };
          return {
            ...prev,
            documents: updatedDocs
          };
        });
        toast.success(`${docLabel} Uploaded Successfully`);
      };
      reader.readAsDataURL(file);
    }
  };

  const viewExistingMemberDoc = (docId) => {
    const docData = selectedMember?.documents?.[docId];
    if (!docData) {
      toast.error('No document file to view');
      return;
    }

    const url = typeof docData === 'string' ? docData : docData.url;
    if (!url) {
      toast.error('No document file to view');
      return;
    }

    const newTab = window.open();
    if (newTab) {
      newTab.document.title = docData.name || 'View Document';

      const isPdf = url.startsWith('data:application/pdf') || (docData.name && docData.name.toLowerCase().endsWith('.pdf'));

      if (isPdf) {
        newTab.document.body.innerHTML = `
          <iframe src="${url}" width="100%" height="100%" style="border:none; position:fixed; top:0; left:0; bottom:0; right:0;"></iframe>
        `;
      } else if (url.startsWith('data:image/')) {
        newTab.document.body.innerHTML = `
          <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#1e1e24; margin:0;">
            <img src="${url}" style="max-width:100%; max-height:100vh; object-fit:contain; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border-radius:8px;" />
          </div>
        `;
      } else {
        newTab.document.body.innerHTML = `
          <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; font-family:sans-serif; background:#f4f4f9; margin:0;">
            <h2 style="color:#333;">Preview not supported for this file type</h2>
            <a href="${url}" download="${docData.name || 'document'}" style="padding:12px 24px; background:#1B4DA0; color:white; text-decoration:none; border-radius:8px; font-weight:bold; margin-top:20px; box-shadow:0 4px 12px rgba(27,77,160,0.3);">Download Document</a>
          </div>
        `;
      }
    } else {
      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
    }
  };

  const handleSaveDetails = async () => {
    // Phone number validation (exactly 10 digits)
    if (editableMember?.phone) {
      if (!validatePhone(editableMember.phone)) {
        toast.error('Phone number must be exactly 10 digits');
        return;
      }
    }

    setIsSavingDetail(true);
    try {
      const memberId = selectedMember.id || selectedMember._id;
      if (String(memberId).startsWith('mock_')) {
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        await updateEmployee(memberId, {
          name: editableMember.name,
          email: editableMember.email,
          phone: editableMember.phone,
          role: editableMember.role,
          designation: editableMember.designation,
          department: editableMember.department,
          status: editableMember.status,
          employeeId: editableMember.employeeId,
          joiningDate: editableMember.joiningDate,
          basicSalary: editableMember.basicSalary !== undefined && editableMember.basicSalary !== null ? parseFloat(editableMember.basicSalary) : null,
          leaveBalance: editableMember.leaveBalance !== undefined && editableMember.leaveBalance !== null ? parseInt(editableMember.leaveBalance, 10) : null,
          bankAccount: editableMember.bankAccount,
          pfNumber: editableMember.pfNumber,
          uanNumber: editableMember.uanNumber
        });
      }
      const updatedMember = { ...selectedMember, ...editableMember };
      setSelectedMember(updatedMember);
      setIsEditingInDetail(false);
      toast.success('Member details updated successfully');
      await fetchHierarchy();
    } catch (error) {
      toast.error(error.message || 'Failed to update member details');
    } finally {
      setIsSavingDetail(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      // Robust ID extraction including potential fallbacks
      const id = decoded.id || decoded._id || decoded.adminId || decoded.userId || localStorage.getItem('userId');
      const role = decoded.role || decoded.userType || localStorage.getItem('userRole') || '';
      const name = localStorage.getItem('userName') || decoded.name || '';

      setUserRole(role);
      setCurrentUserName(name);
      setCurrentUserId(id);

      const requesterEmail = decoded.email || '';
      const isTech = String(role).toLowerCase().includes('tech') || String(requesterEmail).toLowerCase().includes('tech');
      setIsRequesterTech(isTech);

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
          ...teamLeader,
          name: teamLeader.name || 'Unknown',
          id: teamLeader.id || teamLeader._id,
          email: teamLeader.email,
          children: Array.isArray(teamLeader.employees)
            ? teamLeader.employees.map(emp => ({
              ...emp,
              name: emp.name || 'Unknown',
              id: emp.id || emp._id,
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
          ...adminHierarchy,
          name: adminHierarchy.name || 'Unknown',
          id: adminHierarchy.id || adminHierarchy._id,
          email: adminHierarchy.email,
          children: Array.isArray(adminHierarchy.teamLeaders)
            ? adminHierarchy.teamLeaders.map(tl => ({
              ...tl,
              name: tl.name || 'Unknown',
              id: tl.id || tl._id,
              email: tl.email,
              children: Array.isArray(tl.employees)
                ? tl.employees.map(emp => ({
                  ...emp,
                  name: emp.name || 'Unknown',
                  id: emp.id || emp._id,
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
      toast.error(`Hierarchy Error: ${error.message || error}. Backend Message: ${error.response?.data?.message || error.message || 'No connection'}`);
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
            employeeId: 'MAB-001',
            email: 'ashwin@mabicons.com',
            role: 'CRM Head',
            designation: 'Senior Vice President',
            department: 'CRM',
            status: 'Active',
            joiningDate: '2022-05-15',
            phone: '+91 9876543210',
            children: []
          },
          {
            name: 'Ramesh',
            id: 'mock_hrops',
            employeeId: 'MAB-002',
            email: 'ramesh@mabicons.com',
            role: 'HR Operations Head',
            designation: 'Operations Director',
            department: 'Operations',
            status: 'Active',
            joiningDate: '2022-06-20',
            phone: '+91 8765432109',
            children: []
          },
          {
            name: 'Sachin',
            id: 'mock_hrrec',
            employeeId: 'MAB-003',
            email: 'sachin@mabicons.com',
            role: 'HR Recruitment Head',
            designation: 'Recruitment Lead',
            department: 'Recruitment',
            status: 'Active',
            joiningDate: '2022-08-10',
            phone: '+91 7654321098',
            children: [
              { name: 'Priyanshi', id: 'mock_kam1', employeeId: 'MAB-004', email: 'priyanshi@mabicons.com', role: 'KAM', designation: 'KAM Associate', department: 'Recruitment', status: 'Active', joiningDate: '2023-01-15', phone: '+91 6543210987' },
              { name: 'Manju', id: 'mock_kam2', employeeId: 'MAB-005', email: 'manju@mabicons.com', role: 'KAM', designation: 'KAM Associate', department: 'Recruitment', status: 'Active', joiningDate: '2023-02-20', phone: '+91 5432109876' },
              { name: 'Jyoti', id: 'mock_kam3', employeeId: 'MAB-006', email: 'jyoti@mabicons.com', role: 'KAM', designation: 'KAM Associate', department: 'Recruitment', status: 'Active', joiningDate: '2023-03-25', phone: '+91 4321098765' }
            ]
          }
        ]
      });
      setError(''); // Clear error since we have accurate mock data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      const memberId = selectedMember?.id || selectedMember?._id;
      if (!isAttendanceModalOpen || !memberId) return;
      setLoadingAttendance(true);
      try {
        const res = await getEmployeeAttendance(memberId, attendanceMonth, attendanceYear);
        if (res && res.success) {
          setAttendanceRecords(res.data || []);
        } else {
          setAttendanceRecords([]);
        }
      } catch (err) {
        console.error('Error fetching employee attendance:', err);
        setAttendanceRecords([]);
      } finally {
        setLoadingAttendance(false);
      }
    };
    fetchAttendance();
  }, [isAttendanceModalOpen, selectedMember, attendanceMonth, attendanceYear]);

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

    if (newMember.phone && newMember.phone !== "+1234567890" && !validatePhone(newMember.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setIsLoading(true);

    try {
      if (userRole === 'TeamLeader') {
        const employeeData = {
          name: newMember.name,
          email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          teamLeaderId: currentUserId,
          phone: newMember.phone || "+1234567890",
          department: newMember.department,
          role: newMember.role,
          bankAccount: newMember.bankAccount,
          pfNumber: newMember.pfNumber,
          uanNumber: newMember.uanNumber,
          basicSalary: newMember.salary,
          hra: 0,
          otherAllowances: 0,
          deductions: 0,
          leaveBalance: newMember.leavesPerMonth,
          documents: newMember.documents
        };

        await createEmployee(employeeData);
      } else {
        if (newMember.role === 'leader') {
          const token = localStorage.getItem('token');
          const decoded = jwtDecode(token);
          const adminId = decoded.id || decoded._id || decoded.adminId;

          const teamLeaderData = {
            name: newMember.name,
            email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            adminId: adminId,
            phone: newMember.phone || "+1234567890",
            department: newMember.department,
            role: newMember.role,
            documents: newMember.documents
          };

          await createTeamLeader(teamLeaderData);
        } else {
          const selectedLeader = orgChart.children.find(child => child.name === newMember.leader);

          if (!selectedLeader || !selectedLeader.id) {
            throw new Error('Selected team leader not found');
          }

          const employeeData = {
            name: newMember.name,
            email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
            teamLeaderId: selectedLeader.id,
            phone: newMember.phone || "+1234567890",
            department: newMember.department,
            role: newMember.role,
            bankAccount: newMember.bankAccount,
            pfNumber: newMember.pfNumber,
            uanNumber: newMember.uanNumber,
            basicSalary: newMember.salary,
            hra: 0,
            otherAllowances: 0,
            deductions: 0,
            leaveBalance: newMember.leavesPerMonth,
            documents: newMember.documents
          };

          await createEmployee(employeeData);
        }
      }

      await fetchHierarchy();

      setIsAddMemberModalOpen(false);
      setNewMember({
        name: '',
        role: 'employee',
        leader: '',
        department: 'Operations',
        otherRole: '',
        otherDepartment: '',
        documents: {},
        bankAccount: '',
        pfNumber: '',
        uanNumber: '',
        salary: '',
        leavesPerMonth: '',
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
    try {
      setIsLoading(true);

      if (selectedIds.length > 1) {
        // Delete multiple members
        for (const targetId of selectedIds) {
          const targetMember = flattenedMembers.find(
            m => String(m._id || m.id || '').toLowerCase() === String(targetId || '').toLowerCase()
          );
          if (!targetMember) continue;

          if (targetMember.children && targetMember.children.length > 0) {
            // Delete TeamLeader
            await deleteTeamLeaderAndPromoteEmployee({
              oldTeamLeaderId: targetMember.id || targetMember._id
            });
          } else {
            // Delete Employee
            await deleteEmployee(targetMember.id || targetMember._id);
          }
        }
      } else {
        // Delete single member
        const memberToUse = memberToDelete || (selectedIds.length === 1 ? flattenedMembers.find(
          m => String(m._id || m.id || '').toLowerCase() === String(selectedIds[0] || '').toLowerCase()
        ) : null);

        if (!memberToUse) return;

        // If it's a team leader (has children)
        if (memberToUse.children && memberToUse.children.length > 0) {
          if (promotedEmployee) {
            // If a new team leader is selected, reassign team members
            await deleteTeamLeaderWithReassignment({
              teamLeaderId: memberToUse.id || memberToUse._id,
              newTeamLeaderId: promotedEmployee
            });
          } else {
            // If no new leader selected, just delete the team leader
            await deleteTeamLeaderAndPromoteEmployee({
              oldTeamLeaderId: memberToUse.id || memberToUse._id
            });
          }
        } else {
          // If it's an employee
          await deleteEmployee(memberToUse.id || memberToUse._id);
        }
      }

      // Refresh the hierarchy data after deletion
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const { id, role } = decoded;
      const hierarchyRole = (role.toLowerCase().includes('super admin') || role.toLowerCase() === 'superadmin') ? 'Admin' : role;
      const response = await getAdminHierarchy(id, hierarchyRole);

      // Transform and update the org chart
      let transformedData;
      if (role === 'TeamLeader') {
        transformedData = {
          ...response.teamLeader,
          name: response.teamLeader.name,
          id: response.teamLeader.id || response.teamLeader._id,
          email: response.teamLeader.email,
          children: response.teamLeader.employees.map(emp => ({
            ...emp,
            name: emp.name,
            id: emp.id || emp._id,
            email: emp.email
          }))
        };
      } else {
        transformedData = {
          ...response.adminHierarchy,
          name: response.adminHierarchy.name,
          id: response.adminHierarchy.id || response.adminHierarchy._id,
          email: response.adminHierarchy.email,
          children: response.adminHierarchy.teamLeaders.map(tl => ({
            ...tl,
            name: tl.name,
            id: tl.id || tl._id,
            email: tl.email,
            children: tl.employees ? tl.employees.map(emp => ({
              ...emp,
              name: emp.name,
              id: emp.id || emp._id,
              email: emp.email
            })) : []
          }))
        };
      }

      setOrgChart(transformedData);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      setPromotedEmployee('');
      setSelectedIds([]);
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
        ...node,
        _id: node.id,
        employeeId: node.employeeId || `MAB-${String(Math.floor(100 + Math.random() * 900))}`,
        name: node.name,
        email: node.email,
        role: node.role || (node.children && node.children.length > 0 ? 'Team Leader' : 'Employee'),
        designation: node.designation || (node.children && node.children.length > 0 ? 'Lead Executive' : 'Associate'),
        department: node.department || 'N/A',
        status: node.status || 'Active',
        phone: node.phone || '+91 0000000000',
        joiningDate: node.joiningDate || '2023-01-01',
        documents: node.documents || {}
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
      member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = activeDeptFilter === 'all' || member.department === activeDeptFilter;

    const memberStatus = (member.status || 'Active').toLowerCase();

    const matchesStatus =
      memberStatus === activeStatusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ fontFamily: "'Calibri', sans-serif" }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 text-left">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight" style={{ fontFamily: '"Syne", sans-serif' }}>All Employees</h1>
        </div>
        <div className="flex items-center gap-2">
          {notificationBell}
          {/* Add Button */}
          {(userRole?.toLowerCase() === 'superadmin' || userRole?.toLowerCase() === 'super_admin' || userRole?.toLowerCase() === 'manager') && (
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

        {/* Department Filter */}
        <div className="relative">
          <select
            value={activeDeptFilter}
            onChange={(e) => setActiveDeptFilter(e.target.value)}
            className="bg-[#F4F3EF] text-xs font-bold uppercase tracking-wider text-[#1A1A2E] rounded-xl pl-4 pr-10 py-2.5 outline-none border-0 cursor-pointer appearance-none min-w-[170px]"
          >
            <option value="all">All Department</option>
            <option value="CRM">CRM</option>
            <option value="Operations">Operations</option>
            <option value="Recruitment">Recruitment</option>
            <option value="Tech Sales">Tech Sales</option>
            <option value="Accounts">Accounts</option>
            <option value="Finance">Finance</option>
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
            <option value="Inactive">Left</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table Interface */}
      <div className="bg-white rounded-[32px] shadow-sm border border-[#F4F3EF] overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          {/* Grid Header */}
          <div className="grid grid-cols-[40px_220px_150px_180px_120px_120px_130px_340px_60px] gap-8 px-8 py-4 border-b border-[#F4F3EF] bg-transparent min-w-[1500px]">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length}
                onChange={() => setSelectedIds(selectedIds.length === filteredMembers.length ? [] : filteredMembers.map(m => m._id))}
                className="w-4 h-4 rounded border-gray-300 text-[#1B4DA0] focus:ring-[#1B4DA0] cursor-pointer shadow-sm"
              />
            </div>
            {[
              "Member",
              "Department",
              "Role",
              "Salary",
              "Attendance",
              "Documents",
              "Contact",
              "Actions"
            ].map((h, i) => (
              <div key={i} className={`text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest flex items-start ${h === 'Actions' ? 'justify-end text-right w-full pr-4' :
                h === 'Attendance' ? 'justify-end text-right w-full pr-8' :
                  h === 'Contact' ? 'justify-center text-center w-full' :
                    'justify-start text-left'
                }`}>
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
                className="grid grid-cols-[40px_220px_150px_180px_120px_120px_130px_340px_60px] gap-8 items-center px-8 py-3 border-b border-[#F4F3EF] last:border-0 hover:bg-[#F8FAFF] cursor-pointer transition-all group min-w-[1500px]"
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-[#F4F3EF] flex items-center justify-center text-[#1B4DA0] text-sm font-black border border-[#F4F3EF] group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                    {member.avatar || member.picture ? (
                      <img src={member.avatar || member.picture} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      (member.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <p className="text-[14px] font-bold text-[#0f172a] truncate group-hover:text-[#0D47A1] transition-colors text-left">{member.name}</p>
                </div>
                {/* Department */}
                <div className="flex items-start justify-start py-1">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#1B4DA0] text-[11px] font-black uppercase tracking-widest">
                    {member.department || 'HR'}
                  </span>
                </div>

                {/* Role */}
                <div className="flex items-start justify-start text-[13px] font-medium text-[#64748b] truncate py-1 text-left">
                  {member.role}
                </div>

                {/* Salary */}
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-black text-[#1A1A2E]">
                    {member.basicSalary !== undefined && member.basicSalary !== null ? `₹${Number(member.basicSalary).toLocaleString('en-IN')}` : '₹0'}
                  </span>

                  <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                    Monthly
                  </span>
                </div>

                {/* Attendance */}
                <div className="flex flex-col items-end text-right w-full pr-8">
                  <span className="text-[13px] font-black text-[#1A1A2E]">
                    {member.attendanceCount !== undefined ? `${member.attendanceCount}/${member.totalDays || 30}` : '0/30'}
                  </span>

                  <span className="text-[10px] uppercase tracking-widest text-[#9B9BAD] font-bold">
                    Present
                  </span>
                </div>

                {/* Documents */}
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMember({ ...member, documents: member.documents || {} });
                      setIsViewDocsModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#F4F3EF] hover:bg-[#1B4DA0] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    View Docs
                  </button>
                </div>

                {/* Contact */}
                <div className="flex items-center justify-center gap-3 py-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[13px] font-medium text-[#64748b] truncate text-center">{member.email}</span>
                  <div className="flex items-center gap-2">
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
                  onClick={() => setShowLeftModal(true)}
                  className="flex items-center gap-2 group px-4 py-2 rounded-2xl transition-all hover:bg-red-500/20"
                >
                  <FiUserX size={18} className="text-red-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
                    Left
                  </span>
                </button>
              </div>


            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      {showLeftModal &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center">

            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLeftModal(false)}
            />

            <div className="relative bg-white rounded-[36px] w-[430px] p-10 shadow-2xl">

              <div className="w-16 h-16 mx-auto rounded-[24px] bg-red-50 flex items-center justify-center mb-6">
                <FiTrash className="text-red-500" size={30} />
              </div>

              <h2 className="text-[36px] font-bold text-center text-[#1A1A2E]">
                Mark Employee Left?
              </h2>

              <p className="text-center text-[#8C8CA1] mt-4 leading-7">
                Are you sure you want to mark
                <span className="font-bold text-[#1A1A2E]">
                  {" "} {selectedIds.length}
                </span>
                employee{selectedIds.length > 1 ? "s" : ""} as left?
              </p>

              <div className="flex gap-4 mt-10">

                <button
                  onClick={() => setShowLeftModal(false)}
                  className="flex-1 h-14 rounded-2xl bg-[#F7F7F7] font-bold"
                >
                  CANCEL
                </button>

                <button
                  onClick={async () => {
                    await handleDeleteMember();
                    setShowLeftModal(false);
                  }}
                  className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-bold"
                >
                  MARK LEFT
                </button>

              </div>
            </div>
          </div>,
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
                          onClick={() => {
                            setMemberToDelete(selectedMember);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#9B9BAD] hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                          title="Delete Member"
                        >
                          <FiTrash size={18} />
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
                        {selectedMember.avatar || selectedMember.picture ? (
                          <img src={selectedMember.avatar || selectedMember.picture} alt={selectedMember.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{(selectedMember.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                        )}
                        {isEditingInDetail && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-100 transition-opacity cursor-pointer border-2 border-white/20 rounded-[32px]">
                            <FiCamera className="text-white w-6 h-6 mb-1" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Change</span>
                          </div>
                        )}
                        {/* Status Dot */}
                        {!isEditingInDetail && (
                          <div className="absolute top-0 right-0 w-5 h-5 bg-[#00D26A] border-[3px] border-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15),0_0_15px_rgba(0,210,106,0.4)] z-10 translate-x-1 -translate-y-1" />
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


                    </div>
                  </div>

                  {/* Member Information Form */}
                  <div className="space-y-6 bg-[#FAFAF8] p-8 rounded-[32px] border border-[#F4F3EF]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Employee ID</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.employeeId || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, employeeId: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-bold text-[#1B4DA0] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.employeeId || 'N/A'}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Status</label>
                        {isEditingInDetail ? (
                          <select
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.status || 'Active'}
                            onChange={(e) => setEditableMember({ ...editableMember, status: e.target.value })}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Left</option>
                          </select>
                        ) : (
                          <div className="flex items-center bg-white px-4 py-3 rounded-xl border border-[#F4F3EF] gap-2">
                            <span className={`w-2 h-2 rounded-full ${selectedMember.status === 'Inactive' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <span className="text-sm font-semibold text-[#1A1A2E]">{selectedMember.status || 'Active'}</span>
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
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Role</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.role || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, role: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.role || 'N/A'}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Designation</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.designation || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, designation: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.designation || 'N/A'}</div>
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
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Email Address</label>
                        {isEditingInDetail ? (
                          <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-[#F4F3EF]">
                            <FiMail className="text-[#9B9BAD] mr-3" />
                            <input
                              type="email"
                              className={`w-full text-sm font-semibold text-[#1A1A2E] border-none focus:outline-none ${!isRequesterTech ? 'opacity-60 cursor-not-allowed' : ''}`}
                              value={editableMember?.email || ''}
                              onChange={(e) => setEditableMember({ ...editableMember, email: e.target.value })}
                              disabled={!isRequesterTech}
                              title={!isRequesterTech ? "Only tech persons can change Email ID" : ""}
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
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setEditableMember({ ...editableMember, phone: val });
                              }}
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
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Basic Salary</label>
                        {isEditingInDetail ? (
                          <input
                            type="number"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.basicSalary !== undefined && editableMember?.basicSalary !== null ? editableMember.basicSalary : ''}
                            onChange={(e) => setEditableMember({ ...editableMember, basicSalary: e.target.value === '' ? null : parseFloat(e.target.value) })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">
                            {selectedMember.basicSalary !== undefined && selectedMember.basicSalary !== null ? `₹${Number(selectedMember.basicSalary).toLocaleString('en-IN')}` : '₹0'}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Leave Balance</label>
                        {isEditingInDetail ? (
                          <input
                            type="number"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.leaveBalance !== undefined && editableMember?.leaveBalance !== null ? editableMember.leaveBalance : ''}
                            onChange={(e) => setEditableMember({ ...editableMember, leaveBalance: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.leaveBalance !== undefined && selectedMember.leaveBalance !== null ? selectedMember.leaveBalance : 'N/A'}</div>
                        )}
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">Bank Account</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.bankAccount || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, bankAccount: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.bankAccount || 'N/A'}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">PF Number</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.pfNumber || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, pfNumber: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.pfNumber || 'N/A'}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-[2px]">UAN Number</label>
                        {isEditingInDetail ? (
                          <input
                            type="text"
                            className="w-full text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-2.5 rounded-xl border border-[#F4F3EF] focus:outline-none"
                            value={editableMember?.uanNumber || ''}
                            onChange={(e) => setEditableMember({ ...editableMember, uanNumber: e.target.value })}
                          />
                        ) : (
                          <div className="text-sm font-semibold text-[#1A1A2E] bg-white px-4 py-3 rounded-xl border border-[#F4F3EF]">{selectedMember.uanNumber || 'N/A'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4 pt-6 border-t border-[#F4F3EF]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-[#1B4DA0]" size={20} />
                        <h4 className="text-[15px] font-bold text-[#1A1A2E] uppercase tracking-tight">Documents Cabinet</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                        {Object.keys(selectedMember.documents || {}).length} Files Attached
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsViewDocsModalOpen(true);
                      }}
                      className="w-full py-4 bg-white border-2 border-[#1B4DA0]/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-[#1B4DA0] hover:text-white hover:border-[#1B4DA0] transition-all flex items-center justify-center gap-3 shadow-sm group"
                    >
                      <FiEye className="group-hover:scale-110 transition-transform" /> View & Manage Documents
                    </button>
                  </div>

                  {/* Quick View Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#F4F3EF]">
                    <button
                      onClick={() => setIsPerformanceModalOpen(true)}
                      className="py-4 bg-[#F8FAFF] border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <FiTarget size={14} /> Performance
                    </button>
                    <button
                      onClick={() => setIsSalaryModalOpen(true)}
                      className="py-4 bg-[#F8FAFF] border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-[14px]">₹</span> Salary
                    </button>
                    <button
                      onClick={() => setIsAttendanceModalOpen(true)}
                      className="col-span-2 py-4 bg-[#F8FAFF] border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <FiUsers size={14} /> View Attendance Calendar
                    </button>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-[#F4F3EF]">
                    <div className="flex items-center gap-3 mb-2">
                      <FiZap className="text-[#1B4DA0]" size={20} />
                      <h4 className="text-[15px] font-bold text-[#1A1A2E] uppercase tracking-tight">Administrative Actions</h4>
                    </div>
                    <button
                      disabled={
                        !isRequesterTech &&
                        !(currentUserName?.toLowerCase()?.includes('ashish')) &&
                        !(localStorage.getItem('userEmail')?.toLowerCase()?.includes('ashish')) &&
                        !(localStorage.getItem('userEmail')?.toLowerCase() === 'mabicons@gmail.com') &&
                        currentUserId !== (selectedMember?.id || selectedMember?._id)
                      }
                      onClick={() => {
                        setNewPassword('');
                        setIsResetPassModalOpen(true);
                      }}
                      className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${!isRequesterTech &&
                        !(currentUserName?.toLowerCase()?.includes('ashish')) &&
                        !(localStorage.getItem('userEmail')?.toLowerCase()?.includes('ashish')) &&
                        !(localStorage.getItem('userEmail')?.toLowerCase() === 'mabicons@gmail.com') &&
                        currentUserId !== (selectedMember?.id || selectedMember?._id)
                        ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-[#F8FAFF] border border-[#1B4DA0]/10 text-[#1B4DA0] hover:bg-blue-50'
                        }`}
                      title={
                        !isRequesterTech &&
                          !(currentUserName?.toLowerCase()?.includes('ashish')) &&
                          !(localStorage.getItem('userEmail')?.toLowerCase()?.includes('ashish')) &&
                          !(localStorage.getItem('userEmail')?.toLowerCase() === 'mabicons@gmail.com') &&
                          currentUserId !== (selectedMember?.id || selectedMember?._id)
                          ? "Only Tech users and Ashish can reset passwords"
                          : ""
                      }
                    >
                      <FiRefreshCw size={16} />Password Reset
                    </button>
                  </div>
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
                                <option value="Tech">Tech</option>
                                <option value="Sales">Sales</option>
                                <option value="Accounts">Accounts</option>
                                <option value="other">Other (Specify...)</option>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Department / Role</label>
                            <div className="relative">
                              <select
                                value={newMember.role}
                                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                className="w-full bg-[#F4F3EF] border border-transparent rounded-xl py-3.5 pl-5 pr-10 text-[13px] font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all appearance-none cursor-pointer"
                              >
                                {(() => {
                                  const dept = newMember.department;
                                  const commonMgmt = (
                                    <optgroup label="Management">
                                      <option value="leader">Department Head</option>
                                      <option value="manager">Team Manager</option>
                                    </optgroup>
                                  );
                                  const otherOpt = (
                                    <optgroup label="Other">
                                      <option value="other">Other (Specify...)</option>
                                    </optgroup>
                                  );

                                  switch (dept) {
                                    case 'Operations':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="Operations">
                                            <option value="employee">Operations Associate</option>
                                            <option value="ops_kam">Operations KAM</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    case 'Recruitment':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="Recruitment">
                                            <option value="recruiter">Recruiter</option>
                                            <option value="recruitment_kam">Recruitment KAM</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    case 'Sales':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="Sales">
                                            <option value="sales_executive">Sales Executive</option>
                                            <option value="sales_manager">Sales Manager</option>
                                            <option value="sales_kam">Sales KAM</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    case 'CRM':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="CRM">
                                            <option value="crm">CRM Executive</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    case 'HR':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="HR">
                                            <option value="hr">HR Executive</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    case 'Accounts':
                                    case 'Finance':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="Accounts & Finance">
                                            <option value="sales">Accounts Executive</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    case 'Tech':
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="Tech">
                                            <option value="admin">Admin Staff</option>
                                          </optgroup>
                                          {otherOpt}
                                        </>
                                      );
                                    default:
                                      return (
                                        <>
                                          {commonMgmt}
                                          <optgroup label="Operations">
                                            <option value="employee">Operations Associate</option>
                                            <option value="ops_kam">Operations KAM</option>
                                          </optgroup>
                                          <optgroup label="Recruitment">
                                            <option value="recruiter">Recruiter</option>
                                            <option value="recruitment_kam">Recruitment KAM</option>
                                          </optgroup>
                                          <optgroup label="Sales">
                                            <option value="sales_executive">Sales Executive</option>
                                            <option value="sales_manager">Sales Manager</option>
                                            <option value="sales_kam">Sales KAM</option>
                                          </optgroup>
                                          <optgroup label="Other">
                                            <option value="crm">CRM Executive</option>
                                            <option value="hr">HR Executive</option>
                                            <option value="admin">Admin Staff</option>
                                            <option value="sales">Accounts Executive</option>
                                            <option value="other">Other (Specify...)</option>
                                          </optgroup>
                                        </>
                                      );
                                  }
                                })()}
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
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setNewMember({ ...newMember, phone: val });
                              }}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3 - Bank Details */}
                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#9B9BAD]">3.</span>
                            <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">Bank Details</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-gray-100 text-[#6B6B7E]">
                            Optional
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Bank Account Number</label>
                            <input
                              type="text"
                              placeholder="Account Number"
                              value={newMember.bankAccount}
                              onChange={(e) => setNewMember({ ...newMember, bankAccount: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">PF Number</label>
                            <input
                              type="text"
                              placeholder="e.g. MH/BAN/12345"
                              value={newMember.pfNumber}
                              onChange={(e) => setNewMember({ ...newMember, pfNumber: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">UAN Number</label>
                            <input
                              type="text"
                              placeholder="12-digit UAN"
                              value={newMember.uanNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                setNewMember({ ...newMember, uanNumber: val });
                              }}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-5 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 4 - Salary & Leave Structure */}
                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-black text-[#9B9BAD]">4.</span>
                            <h3 className="text-[15px] font-black text-[#1A1A2E] uppercase tracking-tight">Salary & Leave Details</h3>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-gray-100 text-[#6B6B7E]">
                            Optional
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Salary Per Month</label>
                            <input
                              type="number"
                              placeholder="Salary Per Month"
                              value={newMember.salary}
                              onChange={(e) => setNewMember({ ...newMember, salary: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-4 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#6B6B7E] ml-1">Leaves Per Month</label>
                            <input
                              type="number"
                              placeholder="Leaves Per Month"
                              value={newMember.leavesPerMonth}
                              onChange={(e) => setNewMember({ ...newMember, leavesPerMonth: e.target.value })}
                              className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl py-3.5 px-4 text-[13px] font-medium text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all placeholder:text-[#BDBDC7]"
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
                                      <p className="text-[11px] font-bold text-[#1A1A2E]">
                                        {newMember.documents[doc.id]?.name || 'Select File'}
                                      </p>
                                      <p className="text-[9px] font-medium text-[#9B9BAD]">PDF, JPG (Max 2MB)</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-all">
                                    {newMember.documents[doc.id] ? <FiCheckCircle size={16} className="text-green-500" /> : <FiUpload size={16} />}
                                  </div>
                                </div>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer" 
                                  onChange={(e) => handleFileChange(e, doc.id)}
                                />
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
                                      <p className="text-[11px] font-bold text-[#1A1A2E]">
                                        {newMember.documents[doc.id]?.name || 'Select File'}
                                      </p>
                                      <p className="text-[9px] font-medium text-[#9B9BAD]">PDF, JPG (Max 2MB)</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#9B9BAD] group-hover:text-[#1B4DA0] transition-all">
                                    {newMember.documents[doc.id] ? <FiCheckCircle size={16} className="text-green-500" /> : <FiUpload size={16} />}
                                  </div>
                                </div>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => handleFileChange(e, doc.id)} 
                                />
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
                            { label: 'Phone', value: newMember.phone || 'Not provided' },
                            { label: 'Bank Account', value: newMember.bankAccount || 'Not provided' },
                            { label: 'PF Number', value: newMember.pfNumber || 'Not provided' },
                            { label: 'UAN Number', value: newMember.uanNumber || 'Not provided' },
                            { label: 'Salary Per Month', value: newMember.salary ? `₹${Number(newMember.salary).toLocaleString('en-IN')}` : 'Not provided' },
                            { label: 'Leaves Per Month', value: newMember.leavesPerMonth ? `${newMember.leavesPerMonth} Days` : 'Not provided' }
                          ].map((item, idx) => (
                            <div key={idx} className="p-4 bg-white rounded-2xl border border-[#F4F3EF]">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#9B9BAD] mb-1">{item.label}</p>
                              <p className="text-[12px] font-bold text-[#1A1A2E]">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        {Object.keys(newMember.documents).length > 0 && (
                          <div className="pt-6 border-t border-[#F4F3EF]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#9B9BAD] mb-4 text-left ml-1">Uploaded Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(newMember.documents).map(([id, file]) => (
                                <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[11px] font-bold">
                                  <FiCheckCircle className="text-emerald-500" size={14} />
                                  <span className="max-w-[120px] truncate">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
                  <>
                    {modalStep === 2 && (
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="px-8 py-3.5 rounded-[20px] text-[#1B4DA0] font-black uppercase tracking-widest text-[11px] border border-[#F4F3EF] hover:bg-[#F8F9FA] transition-all animate-in fade-in zoom-in duration-200"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (modalStep === 1) {
                          if (!newMember.name || !newMember.email || !newMember.department || !newMember.role) {
                            toast.error('Please fill all mandatory fields (Name, Email, Dept, Role)');
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
                          // Reporting Head is mandatory for everyone except Department Heads
                          if (newMember.role !== 'leader' && !newMember.leader) {
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
                  </>
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

      {/* View/Upload Documents Modal */}
      {isViewDocsModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsViewDocsModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-[900px] bg-white rounded-[40px] shadow-2xl border border-[#F4F3EF] flex flex-col overflow-hidden max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-[#F4F3EF] flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex flex-col text-left">
                <h2 className="text-[18px] font-bold text-[#1A1A2E] tracking-tight font-syne">
                  Employee Documents
                </h2>
                <p className="text-[11px] font-medium text-[#9B9BAD]">Member: <span className="text-[#1B4DA0] font-bold">{selectedMember?.name}</span></p>
              </div>
              <button
                onClick={() => setIsViewDocsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#F4F3EF] text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
              <div className="space-y-12">
                {/* Mandatory Documents */}
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                    <h3 className="text-[14px] font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2">
                      <FiCheckCircle className="text-emerald-500" /> Mandatory Documents
                    </h3>
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest italic">Verification Required</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'PAN Card (Front)', id: 'pan_front' },
                      { label: 'PAN Card (Back)', id: 'pan_back' },
                      { label: 'Aadhaar Card (Front)', id: 'aadhaar_front' },
                      { label: 'Aadhaar Card (Back)', id: 'aadhaar_back' },
                      { label: '10th Marksheet', id: '10th_marksheet' },
                      { label: '12th Marksheet', id: '12th_marksheet' }
                    ].map((doc) => (
                      <div key={doc.id} className="p-4 bg-[#F8FAFF] rounded-2xl border border-[#E2E8F0] flex items-center justify-between group hover:border-[#1B4DA0]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedMember?.documents?.[doc.id] ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-[#C5C5D2] shadow-sm'}`}>
                            <FiFileText size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-[12px] font-bold text-[#1A1A2E]">{doc.label}</p>
                            <p className="text-[10px] font-medium text-[#9B9BAD] max-w-[150px] truncate">
                              {selectedMember?.documents?.[doc.id] ? (selectedMember.documents[doc.id].name || 'File Uploaded') : 'No file chosen'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedMember?.documents?.[doc.id] ? (
                            <button
                              type="button"
                              onClick={() => viewExistingMemberDoc(doc.id)}
                              className="w-9 h-9 rounded-lg bg-white text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm border border-blue-100"
                            >
                              <FiEye size={16} />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest italic bg-rose-50 px-2.5 py-1 rounded-lg">Pending</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Documents */}
                <div className="space-y-6 text-left pt-6 border-t border-[#F4F3EF]">
                  <div className="flex items-center justify-between border-b border-[#F4F3EF] pb-4">
                    <h3 className="text-[14px] font-black text-[#1A1A2E] uppercase tracking-wider flex items-center gap-2">
                      <FiZap className="text-amber-500" /> Optional Documents
                    </h3>
                    <span className="text-[9px] font-bold text-[#9B9BAD] uppercase tracking-widest italic">Optional for records</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Graduation Marksheets', id: 'grad_marksheet' },
                      { label: 'Degree Certificate', id: 'degree_cert' },
                      { label: 'Pay Slips (3M)', id: 'pay_slips' },
                      { label: 'Experience Letter', id: 'exp_letter' }
                    ].map((doc) => (
                      <div key={doc.id} className="p-4 bg-[#FAFAFA] rounded-2xl border border-[#E2E8F0] flex items-center justify-between group hover:border-[#9B9BAD]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedMember?.documents?.[doc.id] ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-[#C5C5D2] shadow-sm'}`}>
                            <FiFileText size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-[12px] font-bold text-[#1A1A2E]">{doc.label}</p>
                            <p className="text-[10px] font-medium text-[#9B9BAD] max-w-[150px] truncate">
                              {selectedMember?.documents?.[doc.id] ? (selectedMember.documents[doc.id].name || 'File Uploaded') : 'No file chosen'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedMember?.documents?.[doc.id] ? (
                            <button
                              type="button"
                              onClick={() => viewExistingMemberDoc(doc.id)}
                              className="w-9 h-9 rounded-lg bg-white text-[#1B4DA0] hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm border border-blue-100"
                            >
                              <FiEye size={16} />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic bg-slate-100 px-2.5 py-1 rounded-lg">Not Uploaded</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-6 bg-[#FAFBFF] border-t border-[#F4F3EF] flex items-center justify-end">
              <button
                onClick={() => setIsViewDocsModalOpen(false)}
                className="px-8 py-3.5 bg-[#1B4DA0] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-[#0D47A1] shadow-lg shadow-blue-500/10 transition-all"
              >
                Close Cabinet
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Manual Password Reset Modal */}
      {isResetPassModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsResetPassModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-[32px] shadow-2xl p-10 w-full max-w-md border border-[#F4F3EF] text-left"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 text-[#1B4DA0] rounded-2xl flex items-center justify-center">
                  <FiZap size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1A2E] tracking-tight font-syne">Manual Reset</h3>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#6B6B7E] uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter new secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl py-4 px-6 text-sm font-bold text-[#1A1A2E] outline-none focus:border-[#1B4DA0] transition-all"
                  />
                  <button
                    onClick={() => setNewPassword(Math.random().toString(36).slice(-8).toUpperCase())}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#1B4DA0] uppercase tracking-widest hover:underline"
                  >
                    Auto-Gen
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsResetPassModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] bg-white border border-[#F4F3EF] hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newPassword) {
                      toast.error('Please enter a password');
                      return;
                    }
                    setIsUpdatingPass(true);
                    try {
                      const memberId = selectedMember.id || selectedMember._id;
                      if (String(memberId).startsWith('mock_')) {
                        await new Promise(resolve => setTimeout(resolve, 800));
                      } else {
                        await resetEmployeePassword(memberId, newPassword, selectedMember.status);
                      }
                      setIsResetPassModalOpen(false);
                      setNewPassword('');
                      toast.success('Password updated successfully!');
                    } catch (err) {
                      toast.error(err.message || 'Failed to update password');
                    } finally {
                      setIsUpdatingPass(false);
                    }
                  }}
                  disabled={isUpdatingPass}
                  className="flex-1 py-4 bg-[#1B4DA0] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0D47A1] shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isUpdatingPass ? 'Updating...' : 'Update Now'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Existing Delete Modal Update with Blur */}
      <AnimatePresence>
        {isDeleteModalOpen && createPortal(
          <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl p-10 w-full max-w-md border border-[#F4F3EF] text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrash size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight font-syne mb-2">
                {selectedIds.length > 1 ? `Delete ${selectedIds.length} Members?` : 'Delete Member?'}
              </h3>
              <p className="text-sm font-medium text-[#6B6B7E] mb-8">
                {selectedIds.length > 1 ? (
                  `Are you sure you want to remove the selected ${selectedIds.length} members? This action cannot be undone.`
                ) : (
                  <>
                    Are you sure you want to remove <span className="font-bold text-[#1A1A2E]">{memberToDelete?.name}</span>? This action cannot be undone.
                  </>
                )}
              </p>

              {selectedIds.length > 1 ? (
                flattenedMembers.filter(m => selectedIds.includes(m._id) || selectedIds.includes(m.id)).some(m => m.children && m.children.length > 0) && (
                  <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FiZap size={14} /> Team Warning
                    </p>
                    <p className="text-[12px] font-bold text-amber-900 leading-relaxed">
                      One or more selected members are Team Leaders. Their teams will be automatically updated.
                    </p>
                  </div>
                )
              ) : (
                memberToDelete?.children && memberToDelete.children.length > 0 && (
                  <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left">
                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FiZap size={14} /> Team Warning
                    </p>
                    <p className="text-[12px] font-bold text-amber-900 leading-relaxed">
                      This member is a leader for {memberToDelete.children.length} employees. Please reassign them before deletion.
                    </p>
                  </div>
                )
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#6B6B7E] bg-white border border-[#F4F3EF] hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>

      {/* Performance Modal */}
      {isPerformanceModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPerformanceModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl border border-[#F4F3EF] text-left"
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <FiTarget size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#1A1A2E] tracking-tight font-syne">Member Performance</h3>
                    <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Analytics for {selectedMember?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsPerformanceModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Attendance', value: '98%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Tasks Done', value: '142', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Efficiency', value: '94%', color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white shadow-sm`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6B6B7E] mb-2">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-black text-[#1A1A2E] uppercase tracking-wider">Skill Assessment</h4>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full italic">Top Performer</span>
                </div>
                <div className="space-y-4">
                  {[
                    { skill: 'Communication', level: 90 },
                    { skill: 'Project Management', level: 85 },
                    { skill: 'Technical Skills', level: 95 }
                  ].map((s, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[11px] font-bold text-[#6B6B7E]">{s.skill}</span>
                        <span className="text-[11px] font-black text-[#1B4DA0]">{s.level}%</span>
                      </div>
                      <div className="h-2 bg-[#F4F3EF] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.level}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-[#1B4DA0] rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsPerformanceModalOpen(false)}
                className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/10"
              >
                Close Performance View
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Salary Modal */}
      {isSalaryModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSalaryModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md border border-[#F4F3EF] text-left"
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <span className="text-[28px] font-bold">₹</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#1A1A2E] tracking-tight font-syne">Salary & Leaves</h3>
                    <p className="text-[11px] font-bold text-[#9B9BAD] uppercase tracking-widest">Details for {selectedMember?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsSalaryModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all">
                  <FiX size={20} />
                </button>
              </div>

              <div className="bg-[#FAFAF8] rounded-[32px] p-8 space-y-6 border border-[#F4F3EF]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <span className="text-[13px] font-bold text-[#6B6B7E]">Salary Per Month</span>
                    <span className="text-[16px] font-black text-[#1A1A2E]">
                      {selectedMember?.basicSalary !== undefined && selectedMember.basicSalary !== null ? `₹ ${Number(selectedMember.basicSalary).toLocaleString('en-IN')}` : '₹ 0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[13px] font-bold text-[#6B6B7E]">Leaves Per Month</span>
                    <span className="text-[16px] font-black text-[#1A1A2E]">
                      {selectedMember?.leaveBalance !== undefined && selectedMember?.leaveBalance !== null ? `${selectedMember.leaveBalance} Days` : '2 Days'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="w-full py-4 bg-[#1B4DA0] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0D47A1] transition-all shadow-lg shadow-blue-500/10"
                >
                  Close View
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Attendance Calendar Modal */}
      {isAttendanceModalOpen && createPortal(
        <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAttendanceModalOpen(false)}
            className="absolute inset-0 bg-[#1A1A2E]/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-[500px] border border-[#F4F3EF] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-blue-50 text-[#1B4DA0] rounded-2xl flex items-center justify-center">
                  <FiUsers size={24} />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-[#1A1A2E] tracking-tight font-syne uppercase">Attendance</h3>
                  <p className="text-[10px] font-bold text-[#9B9BAD] uppercase tracking-widest">Tracking for {selectedMember?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="w-10 h-10 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#9B9BAD] hover:bg-red-50 hover:text-red-500 transition-all">
                <FiX size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-8">
              <div className="flex-1 relative">
                <select
                  value={attendanceMonth}
                  onChange={(e) => setAttendanceMonth(parseInt(e.target.value))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl py-3 px-4 text-xs font-bold text-[#1A1A2E] appearance-none cursor-pointer outline-none focus:border-[#1B4DA0]"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
              </div>
              <div className="w-32 relative">
                <select
                  value={attendanceYear}
                  onChange={(e) => setAttendanceYear(parseInt(e.target.value))}
                  className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl py-3 px-4 text-xs font-bold text-[#1A1A2E] appearance-none cursor-pointer outline-none focus:border-[#1B4DA0]"
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9BAD] pointer-events-none" />
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <div key={d} className="text-[9px] font-black text-[#9B9BAD] text-center uppercase py-2 tracking-widest">{d}</div>
                ))}
                {loadingAttendance ? (
                  <div className="h-[200px] flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#1B4DA0] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-[#6B6B7E] font-medium">Loading attendance...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const formatTime = (isoString) => {
                        if (!isoString) return '';
                        try {
                          const date = new Date(isoString);
                          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        } catch {
                          return '';
                        }
                      };

                      const getActiveTime = (rec) => {
                        if (rec.workHours && rec.workHours > 0) {
                          const hours = Math.floor(rec.workHours);
                          const mins = Math.round((rec.workHours - hours) * 60);
                          return `${hours}h ${mins}m`;
                        }
                        if (rec.checkIn) {
                          try {
                            const checkInDate = new Date(rec.checkIn);
                            const checkOutDate = rec.checkOut ? new Date(rec.checkOut) : new Date();
                            const diffMs = checkOutDate - checkInDate;
                            if (diffMs > 0) {
                              const diffHrs = diffMs / (1000 * 60 * 60);
                              const hours = Math.floor(diffHrs);
                              const mins = Math.round((diffHrs - hours) * 60);
                              return `${hours}h ${mins}m`;
                            }
                          } catch {
                            return '8h 00m';
                          }
                        }
                        return '8h 00m';
                      };

                      const getCheckoutTime = (rec) => {
                        if (rec.checkOut) return formatTime(rec.checkOut);
                        return 'Active';
                      };

                      const daysInMonth = new Date(attendanceYear, attendanceMonth + 1, 0).getDate();
                      const firstDayOfMonth = new Date(attendanceYear, attendanceMonth, 1).getDay();
                      const days = [];

                      // Empty slots for previous month
                      for (let i = 0; i < firstDayOfMonth; i++) {
                        days.push(<div key={`empty-${i}`} className="aspect-square" />);
                      }

                      // Actual days
                      for (let d = 1; d <= daysInMonth; d++) {
                        const date = new Date(attendanceYear, attendanceMonth, d);
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                        const dateStr = `${attendanceYear}-${String(attendanceMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const record = attendanceRecords.find(r => r.date === dateStr);
                        const isPresent = record?.status === 'Present' || record?.status === 'Present (Regularized)';
                        const isWFH = record?.status === 'WFH';
                        const isHalfDay = record?.status === 'Half Day';
                        const isAbsent = record?.status === 'Absent';
                        const isOnLeave = record?.status === 'On Leave';

                        let cellClass = 'bg-white text-[#9B9BAD] border-[#F4F3EF]';
                        if (isWeekend) {
                          cellClass = 'bg-[#FAFAFA] text-[#D1D1D1] border-transparent';
                        } else if (isPresent) {
                          cellClass = 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]';
                        } else if (isWFH) {
                          cellClass = 'bg-[#E0F7FA] text-[#00838F] border-[#B2EBF2]';
                        } else if (isHalfDay) {
                          cellClass = 'bg-[#FFF3E0] text-[#EF6C00] border-[#FFE0B2]';
                        } else if (isAbsent) {
                          cellClass = 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]';
                        } else if (isOnLeave) {
                          cellClass = 'bg-[#F3E5F5] text-[#6A1B9A] border-[#E1BEE7]';
                        }

                        const hasTimeTracking = isPresent || isWFH || isHalfDay;

                        days.push(
                          <div
                            key={d}
                            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border ${cellClass}`}
                            title={
                              record
                                ? `Status: ${record.status}\nCheck-in: ${record.checkIn ? formatTime(record.checkIn) : '09:00 AM'}\nCheck-out: ${record.checkOut ? formatTime(record.checkOut) : hasTimeTracking ? 'Active' : '—'}\nActive Time: ${getActiveTime(record)}\nNotes: ${record.notes || 'None'}`
                                : undefined
                            }
                          >
                            <span className="text-[12px] font-black">{d}</span>
                            {hasTimeTracking && (
                              <div className="flex flex-col items-center mt-0.5 w-full px-1">
                                <span className="text-[8px] font-extrabold tracking-tighter leading-none mb-0.5">
                                  {getActiveTime(record)}
                                </span>
                                <div className="flex flex-col text-[6.5px] font-semibold leading-[7.5px] tracking-tighter text-center opacity-90">
                                  <span className="text-blue-600 font-bold">
                                    In: {record.checkIn ? formatTime(record.checkIn) : '09:00 AM'}
                                  </span>
                                  <span className="text-[#C62828] font-bold">
                                    Out: {getCheckoutTime(record)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {isAbsent && (
                              <span className="text-[7px] font-black tracking-widest mt-1 opacity-70">
                                ABSENT
                              </span>
                            )}
                            {isOnLeave && (
                              <span className="text-[7px] font-black tracking-widest mt-1 opacity-70">
                                LEAVE
                              </span>
                            )}
                          </div>
                        );
                      }
                      return days;
                    })()}
                  </div>
                )}              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-8 border-t border-[#F4F3EF] flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4CAF50] shadow-[0_0_8px_rgba(76,175,80,0.3)]" />
                <span className="text-[10px] font-bold text-[#6B6B7E] uppercase">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F44336] shadow-[0_0_8px_rgba(244,67,54,0.3)]" />
                <span className="text-[10px] font-bold text-[#6B6B7E] uppercase">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EEEEEE]" />
                <span className="text-[10px] font-bold text-[#6B6B7E] uppercase">Weekend</span>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
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

