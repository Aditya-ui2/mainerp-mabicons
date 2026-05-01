import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUserPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiX,
  FiFileText,
  FiDownload,
  FiUpload,
  FiInfo,
} from "react-icons/fi";

import axios from "axios";
import {
  getAllClients,
  deleteClient,
  getAdminHierarchy,
  onboardClient,
  clientSignup,
  getClientDocuments,
  getClientDetails,
  editClient,
  getAllTeamLeaders,
} from "../../service/api";
import { jwtDecode } from "jwt-decode";
import { DocumentUpload } from "./DocumentUpload";
import { toast } from "react-hot-toast";

const CustomersTab = ({ isDarkMode }) => {
  const [Clients, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusOptions, setStatusOptions] = useState([
    { label: "Accepted", value: "Accepted" },
    { label: "Rejected", value: "Rejected" },
    { label: "Pending", value: "Pending" },
  ]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  
  // Safely decode token
  const getDecodedToken = () => {
    try {
      const token = localStorage.getItem("token");
      return token ? jwtDecode(token) : null;
    } catch (e) {
      console.error("Error decoding token:", e);
      return null;
    }
  };

  // Add new state for customer details modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Add this array for dropdown options (you can fetch this from an API if needed)

  // Move these state declarations to the top with other state variables
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientDocuments, setClientDocuments] = useState({});
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Add new state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Add new state for KAM assignment
  const [isAssignKAMModalOpen, setIsAssignKAMModalOpen] = useState(false);
  const [selectedClientForKAM, setSelectedClientForKAM] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchCustomers();
    // Only fetch assignee options if user is not SuperAdmin
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === 'SuperAdmin' || decoded.role === 'Admin') {
          fetchAssigneeOptions();
        }
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  const fetchAssigneeOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      
      let teamLeaders = [];
      if (decoded.role === 'SuperAdmin') {
        const response = await getAllTeamLeaders();
        teamLeaders = response.teamLeaders || [];
      } else {
        const response = await getAdminHierarchy(decoded.id);
        teamLeaders = response.adminHierarchy?.teamLeaders || [];
      }
      
      setAssigneeOptions(teamLeaders);
    } catch (error) {
      console.error("Error fetching team leaders:", error);
    }
  };

  useEffect(() => {
    const results = Clients.filter((customer) => {
      const searchableFields = [
        customer.name,
        customer.company,
        customer.email,
        customer.contactNumber,
        customer.status,
        customer.gstNumber,
        customer.assignedTo,
      ];

      return searchableFields.some(
        (field) =>
          field &&
          field.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredCustomers(results);
  }, [Clients, searchTerm]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllClients();
      // Check if response.data exists and contains the clients array
      const clientsData = response?.data?.clients || response?.clients || [];
      const formattedCustomers = clientsData.map((client) => ({
        id: client.id || client._id,
        name: client.name,
        company: client.companyName || "N/A",
        email: client.email,
        contactNumber: client.contactNumber,
        status: client.status || "Pending",
        gstNumber: client.gstNumber,
        assignedTo: client.teamLeader
          ? `${client.teamLeader.name} (${client.teamLeader.email})`
          : "Unassigned",
        teamLeader: client.teamLeader || null,
      }));
      setCustomers(formattedCustomers);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to fetch Clients");
    } finally {
      setIsLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    companyName: "",
    numberOfCompanies: "",
    companyPAN: "",
    gst: "",
    cin: "",
    ownerDetails: "",
    authorizedSignatory: "",
    spocName: "",
    spocEmail: "",
    spocContact: "",
    employeeMasterSheet: null,
    currentSalaryStructure: null,
    complianceInfo: "",
    previousSalarySheets: null,
    hrPolicies: null,
    leaveBalance: "",
    registeredAddress: "",
    corporateAddress: "",
    website: "",
    status: "Active",
    assignedTo: "",
    authorizedSignatoryEmail: "",
    authorizedSignatoryContact: "",
    ownerEmail: "",
    ownerContact: "",
    ownerDirectorDetails: [
      {
        name: "",
        email: "",
        contact: "",
      },
    ],
    password: "",
    logo: null,
    letterHead: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setNewCustomer((prev) => ({
        ...prev,
        [name]: files.length === 1 ? files[0] : Array.from(files),
      }));
    } else {
      setNewCustomer((prev) => {
        const updates = { [name]: value };

        // If company name is being updated, also update the password
        if (name === "companyName") {
          updates.password = `${value}@123`;
        }

        return { ...prev, ...updates };
      });
    }
  };

  // Function to get the latest client ID
  const getLatestClientId = async () => {
    try {
      const response = await getAllClients();
      if (response.clients && response.clients.length > 0) {
        // Get the most recently added client's ID
        const latestClient = response.clients[response.clients.length - 1];
        return latestClient._id; // Use _id from the response
      }
      return null;
    } catch (error) {
      console.error("Error fetching latest client:", error);
      return null;
    }
  };

  // Modify handleSubmit to get the correct client ID
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      toast.loading("Adding customer..."); // Show loading toast

      const formData = {
        name: newCustomer.spocName,
        email: newCustomer.spocEmail,
        companyName: newCustomer.companyName,
        corporateAddress: newCustomer.corporateAddress,
        contactNumber: newCustomer.spocContact,
        gstNumber: newCustomer.gst,
        panNumber: newCustomer.companyPAN,
        cinNumber: newCustomer.cin,
        numberOfCompanies: newCustomer.numberOfCompanies,
        website: newCustomer.website || null,
        authorizedSignatory: {
          name: newCustomer.authorizedSignatory,
          email: newCustomer.authorizedSignatoryEmail,
          contact: newCustomer.authorizedSignatoryContact,
        },
        ownerDirectorDetails: newCustomer.ownerDirectorDetails,
      };

      const response = await clientSignup(formData);

      // Check if we have a successful response
      if (response.message === response.client) {
        // Close the modal
        setIsModalOpen(false);

        // Refresh the customers list
        await fetchCustomers();

        // Show success toast
        toast.dismiss(); // Dismiss loading toast
        toast.success("Customer added successfully! 🎉", {
          duration: 3000,
          position: "top-center",
        });

        // Reset the form data
        setNewCustomer({
          companyName: "",
          numberOfCompanies: "",
          companyPAN: "",
          gst: "",
          cin: "",
          ownerDetails: "",
          authorizedSignatory: "",
          spocName: "",
          spocEmail: "",
          spocContact: "",
          employeeMasterSheet: null,
          currentSalaryStructure: null,
          complianceInfo: "",
          previousSalarySheets: null,
          hrPolicies: null,
          leaveBalance: "",
          registeredAddress: "",
          corporateAddress: "",
          website: "",
          status: "Active",
          assignedTo: "",
          authorizedSignatoryEmail: "",
          authorizedSignatoryContact: "",
          ownerEmail: "",
          ownerContact: "",
          ownerDirectorDetails: [
            {
              name: "",
              email: "",
              contact: "",
            },
          ],
          password: "",
          logo: null,
          letterHead: null,
        });
      } else {
        throw new Error("Failed to register client");
      }
    } catch (error) {
      // Show error toast
      toast.dismiss(); // Dismiss loading toast
      toast.error(
        error.message || "Failed to add customer. Please try again.",
        {
          duration: 4000,
          position: "top-center",
        }
      );
      console.error("Failed to add customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  // Add new handler for opening customer details
  const handleCustomerClick = async (customer) => {
    try {
      const response = await getClientDetails(customer.id);
      if (response.success) {
        setSelectedCustomer({
          ...customer,
          ...response.data, // Merge the detailed data with existing customer data
        });
      }
      setIsDetailsModalOpen(true);
      await fetchClientDocuments(customer.id);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
    }
  };

  const fetchClientDocuments = async (clientId) => {
    setIsLoadingDocuments(true);
    try {
      const response = await getClientDocuments(clientId);
      if (response.success && response.documents) {
        setClientDocuments(response.documents);
      } else {
        setClientDocuments({});
      }
    } catch (error) {
      console.error("Failed to fetch client documents:", error);
      setClientDocuments({});
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const LoadingAnimation = () => (
    <div className="flex justify-center items-center h-64">
      <div className="relative">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`absolute top-0 left-0 w-16 h-16 rounded-full ${
              isDarkMode ? "border-white" : "border-black"
            } border-2`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 1, 0.1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
        <motion.div
          className={`w-8 h-8 rounded-full ${
            isDarkMode ? "bg-white" : "bg-black"
          }`}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );

  const NoResultsMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center h-64 ${
        isDarkMode ? "text-gray-300" : "text-gray-600"
      }`}
    >
      <FiSearch className="text-6xl mb-4" />
      <h3 className="text-2xl font-semibold mb-2">No Clients found</h3>
      <p className="text-center">
        We couldn't find any Clients matching your search.
        <br />
        Try adjusting your search terms or filters.
      </p>
    </motion.div>
  );

  // Add new state for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const handleDeleteClick = async (customer) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteClient(customer.id);
        // Remove the customer from the local state
        setCustomers((prevCustomers) =>
          prevCustomers.filter((c) => c.id !== customer.id)
        );
        toast.success("Customer deleted successfully");
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  // Update the delete button in the table row
  const deleteButton = (
    <button
      onClick={(e) => handleDeleteClick(customer)}
      className={`p-1 rounded-full ${
        isDarkMode
          ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
          : "bg-gray-200 hover:bg-black text-black hover:text-white"
      } transition-colors duration-150`}
    >
      <FiTrash2 className="text-lg" />
    </button>
  );

  // Add delete confirmation modal
  const deleteModal = (
    <AnimatePresence>
      {isDeleteModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } rounded-lg p-6 max-w-md w-full mx-4`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            <h3 className="text-xl font-bold mb-4">Delete Customer</h3>
            <p className="mb-6">
              Are you sure you want to delete {customerToDelete?.companyName}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCustomerToDelete(null);
                }}
                className={`px-4 py-2 rounded ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Add a helper function to handle owner/director details changes
  const handleOwnerDirectorChange = (index, field, value) => {
    setNewCustomer((prev) => {
      const updatedOwnerDirectors = [...prev.ownerDirectorDetails];
      updatedOwnerDirectors[index] = {
        ...updatedOwnerDirectors[index],
        [field]: value,
      };
      return {
        ...prev,
        ownerDirectorDetails: updatedOwnerDirectors,
      };
    });
  };

  // Add this new function to handle owner deletion
  const handleDeleteOwner = (indexToDelete) => {
    setNewCustomer((prev) => ({
      ...prev,
      ownerDirectorDetails: prev.ownerDirectorDetails.filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  const DocumentsList = () => {
    const documentTypes = [
      {
        id: "employeeMasterDatabase",
        title: "Employee Master Database",
        key: "employeeMasterDatabase",
      },
      {
        id: "currentSalaryStructure",
        title: "Current Salary Structure",
        key: "currentSalaryStructure",
      },
      {
        id: "previousSalarySheets",
        title: "Previous Salary Sheets",
        key: "previousSalarySheets",
      },
      {
        id: "currentHRPolicies",
        title: "Current HR Policies",
        key: "currentHRPolicies",
      },
      { id: "leaveBalance", title: "Leave Balance", key: "leaveBalance" },
      { id: "companyLogo", title: "Company Logo", key: "companyLogo" },
      { id: "letterhead", title: "Letterhead", key: "letterhead" },
    ];

    if (isLoadingDocuments) {
      return (
        <div className="w-full flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((doc) => {
            const documentData = clientDocuments[doc.key];
            const isDocumentAvailable = documentData?.status === "available";

            return (
              <div
                key={doc.id}
                className={`flex flex-col justify-between p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-lg h-full`}
              >
                <div>
                  <h3 className="font-medium text-lg mb-2">{doc.title}</h3>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mb-4`}
                  >
                    {isDocumentAvailable ? (
                      <>
                        <p className="mb-1">File: {documentData.name}</p>
                        <p>Type: {documentData.mimeType}</p>
                      </>
                    ) : (
                      <p className="text-yellow-500">
                        {documentData?.error || "Not uploaded"}
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isDocumentAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {isDocumentAvailable ? "Available" : "Not Available"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-center items-center">
                  {isDocumentAvailable ? (
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={documentData.viewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-lg ${
                          isDarkMode
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white transition-colors duration-200 flex items-center`}
                      >
                        <FiFileText className="mr-2" />
                        View
                      </a>
                      <a
                        href={documentData.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-lg ${
                          isDarkMode
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-green-500 hover:bg-green-600"
                        } text-white transition-colors duration-200 flex items-center`}
                      >
                        <FiDownload className="mr-2" />
                        Download
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedClientId(selectedCustomer.id);
                        setIsDocumentModalOpen(true);
                      }}
                      className={`w-full px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-600 hover:bg-gray-500"
                          : "bg-black hover:bg-gray-800"
                      } text-white transition-colors duration-200 flex items-center justify-center`}
                    >
                      <FiUpload className="mr-2" />
                      Upload
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Update the handleEditClick function to fetch complete client details
  const handleEditClick = async (e, customer) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const response = await getClientDetails(customer.id);
      const clientDetails = response.data;

      setEditingCustomer({
        clientId: customer.id,
        name: clientDetails.name,
        companyName: clientDetails.companyName,
        email: clientDetails.email,
        corporateAddress: clientDetails.corporateAddress,
        contactNumber: clientDetails.contactNumber,
        gstNumber: clientDetails.gstNumber,
        panNumber: clientDetails.panNumber,
        cinNumber: clientDetails.cinNumber,
        numberOfCompanies: clientDetails.numberOfCompanies,
        website: clientDetails.website,
        authorizedSignatory: clientDetails.authorizedSignatory || {
          name: "",
          email: "",
          contact: "",
        },
        ownerDirectorDetails: clientDetails.ownerDirectorDetails || [
          {
            name: "",
            email: "",
            contact: "",
          },
        ],
      });

      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
      toast.error(error.message || "Failed to fetch client details");
    } finally {
      setIsLoading(false);
    }
  };

  // Add handler for edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await editClient(editingCustomer);
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      fetchCustomers(); // Refresh the customers list
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error(error.message || "Failed to update customer");
    }
  };

  const handleAssignKAM = async (teamLeaderId) => {
    try {
      setIsAssigning(true);
      const res = await editClient({
        clientId: selectedClientForKAM.id,
        teamLeaderId: teamLeaderId
      });
      
      if (res.success) {
        toast.success(`Client assigned to new KAM successfully!`);
        setIsAssignKAMModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error('Assign KAM failed:', err);
      toast.error(err.message || 'Failed to assign KAM');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <motion.div
      className="p-2 md:p-4 w-full h-[calc(100vh-4rem)] overflow-auto"
      style={{ zoom: "90%" }}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Clients</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 rounded-lg ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-black hover:bg-gray-800 text-white"
          } transition-colors duration-200 shadow-lg`}
        >
          <FiUserPlus className="mr-2 text-lg" />
          <span className="font-semibold">Add Clients</span>
        </button>
      </div>

      {/* Search section */}
      <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search Clients..."
            value={searchTerm}
            onChange={handleSearch}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-gray-800 text-white"
                : "bg-white text-black border border-black"
            } focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200`}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className={`${isDarkMode ? "bg-gray-800" : "bg-black"}`}>
            <tr>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                NAME
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                COMPANY
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                EMAIL
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                STATUS
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                ASSIGNED TO
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
              >
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => handleCustomerClick(customer)}
                className={`${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                } cursor-pointer`}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-xs">
                        {customer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="ml-2 text-xs truncate max-w-[100px]">
                      {customer.id}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {customer.contactNumber}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {customer.company}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {customer.email}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
                      customer.status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : customer.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {customer.assignedTo || "Unassigned"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  <div className="flex items-center space-x-2">
                    {customer.status === "Requested" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                          setIsOnboardModalOpen(true);
                        }}
                        className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                      >
                        Onboard
                      </button>
                    )}
                    {customer.status === "Accepted" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientForKAM(customer);
                          setIsAssignKAMModalOpen(true);
                        }}
                        className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200 font-bold"
                      >
                        Assign KAM
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(customer);
                      }}
                      className={`p-1 rounded text-xs ${
                        isDarkMode
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-100 hover:bg-red-200 text-red-800"
                      } transition-colors duration-200`}
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`fixed inset-0 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              } overflow-y-auto`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } px-4 py-4`}
              >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Add New Client</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`p-2 rounded-full ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    } transition-colors duration-200`}
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="max-w-7xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Form Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Basic Information Section */}
                    <div
                      className={`col-span-1 p-6 rounded-xl ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-6">
                        Basic Information
                      </h3>
                      <div className="space-y-4">
                        {/* Company Name field */}
                        <div>
                          <label className="block mb-2 font-medium">
                            Company Name
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={newCustomer.companyName}
                            onChange={handleInputChange}
                            placeholder="Enter company name"
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>

                        {/* Existing fields continue below */}
                        <div>
                          <label className="block mb-2 font-medium">
                            No. of Companies/Firms
                          </label>
                          <input
                            type="number"
                            name="numberOfCompanies"
                            value={newCustomer.numberOfCompanies}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            Company PAN
                          </label>
                          <input
                            type="text"
                            name="companyPAN"
                            value={newCustomer.companyPAN}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">GST</label>
                          <input
                            type="text"
                            name="gst"
                            value={newCustomer.gst}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">CIN</label>
                          <input
                            type="text"
                            name="cin"
                            value={newCustomer.cin}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            Assigned To
                          </label>
                          <div className="relative">
                            <select
                              name="assignedTo"
                              value={newCustomer.assignedTo}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-2 rounded-lg appearance-none ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              required
                            >
                              <option value="">Select an assignee</option>
                              {assigneeOptions.map((assignee) => (
                                <option key={assignee.id} value={assignee.id}>
                                  {assignee.name} - {assignee.role}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="fill-current h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div
                      className={`col-span-1 p-6 rounded-xl ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-6">
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 font-medium">
                            Company name
                          </label>
                          {newCustomer.ownerDirectorDetails.map(
                            (owner, index) => (
                              <div
                                key={index}
                                className="relative space-y-2 mb-4 p-4 border rounded-lg border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-grow space-y-2">
                                    <input
                                      type="text"
                                      value={owner.name}
                                      onChange={(e) =>
                                        handleOwnerDirectorChange(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Name"
                                      className={`w-full px-4 py-2 rounded-lg ${
                                        isDarkMode
                                          ? "bg-gray-800 border-gray-600"
                                          : "bg-white border-gray-300"
                                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      required
                                    />
                                    <input
                                      type="email"
                                      value={owner.email}
                                      onChange={(e) =>
                                        handleOwnerDirectorChange(
                                          index,
                                          "email",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Email"
                                      className={`w-full px-4 py-2 rounded-lg ${
                                        isDarkMode
                                          ? "bg-gray-800 border-gray-600"
                                          : "bg-white border-gray-300"
                                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      required
                                    />
                                    <input
                                      type="tel"
                                      value={owner.contact}
                                      onChange={(e) =>
                                        handleOwnerDirectorChange(
                                          index,
                                          "contact",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Contact"
                                      className={`w-full px-4 py-2 rounded-lg ${
                                        isDarkMode
                                          ? "bg-gray-800 border-gray-600"
                                          : "bg-white border-gray-300"
                                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      required
                                    />
                                  </div>
                                  {/* Only show delete button if there's more than one owner */}
                                  {newCustomer.ownerDirectorDetails.length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOwner(index)}
                                      className={`ml-2 p-2 rounded-full ${
                                        isDarkMode
                                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                          : "bg-gray-200 hover:bg-red-500 text-gray-600 hover:text-white"
                                      } transition-colors duration-200`}
                                    >
                                      <FiTrash2 className="text-sm" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setNewCustomer((prev) => ({
                                ...prev,
                                ownerDirectorDetails: [
                                  ...prev.ownerDirectorDetails,
                                  { name: "", email: "", contact: "" },
                                ],
                              }))
                            }
                            className={`mt-2 px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-gray-200 hover:bg-gray-300"
                            } transition-colors duration-200 flex items-center`}
                          >
                            <FiUserPlus className="mr-2" />
                            Add Another Owner/Director
                          </button>
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            Authorized Signatory
                          </label>
                          <div className="space-y-2">
                            <input
                              type="text"
                              name="authorizedSignatory"
                              value={newCustomer.authorizedSignatory}
                              onChange={handleInputChange}
                              placeholder="Name"
                              className={`w-full px-4 py-2 rounded-lg ${
                                isDarkMode  
                                  ? "bg-gray-800 border-gray-600"
                                  : "bg-white border-gray-300"
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              required
                            />
                            <input
                              type="email"
                              name="authorizedSignatoryEmail"
                              value={newCustomer.authorizedSignatoryEmail}
                              onChange={handleInputChange}
                              placeholder="Email"
                              className={`w-full px-4 py-2 rounded-lg ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600"
                                  : "bg-white border-gray-300"
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              required
                            />
                            <input
                              type="tel"
                              name="authorizedSignatoryContact"
                              value={newCustomer.authorizedSignatoryContact}
                              onChange={handleInputChange}
                              placeholder="Contact"
                              className={`w-full px-4 py-2 rounded-lg ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600"
                                  : "bg-white border-gray-300"
                              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            SPOC Name
                          </label>
                          <input
                            type="text"
                            name="spocName"
                            value={newCustomer.spocName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            SPOC Contact
                          </label>
                          <input
                            type="tel"
                            name="spocContact"
                            value={newCustomer.spocContact}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            SPOC Email
                          </label>
                          <input
                            type="email"
                            name="spocEmail"
                            value={newCustomer.spocEmail}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div
                      className={`col-span-1 lg:col-span-3 p-6 rounded-xl ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <h3 className="text-xl font-semibold mb-6">
                        Additional Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 font-medium">
                            Compliance Information
                          </label>
                          <textarea
                            name="complianceInfo"
                            value={newCustomer.complianceInfo}
                            onChange={handleInputChange}
                            rows="4"
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">
                            Leave Balance
                          </label>
                          <input
                            type="text"
                            name="leaveBalance"
                            value={newCustomer.leaveBalance}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">
                            Registered Address
                          </label>
                          <textarea
                            name="registeredAddress"
                            value={newCustomer.registeredAddress}
                            onChange={handleInputChange}
                            rows="3"
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">
                            Corporate Address
                          </label>
                          <textarea
                            name="corporateAddress"
                            value={newCustomer.corporateAddress}
                            onChange={handleInputChange}
                            rows="3"
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">
                            Website
                            <span className="text-sm text-gray-500 ml-2">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={newCustomer.website}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600"
                                : "bg-white border-gray-300"
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div
                    className={`sticky bottom-0 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } py-4 border-t ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="max-w-7xl mx-auto px-4 flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className={`px-6 py-2 rounded-lg ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        } transition-colors duration-200`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 
                          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isLoading ? "Adding..." : "Add Customer"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedCustomer && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`absolute right-0 h-full w-full ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              } overflow-y-auto shadow-xl`}
              variants={{
                hidden: { x: "100%" },
                visible: { x: "0%" },
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                } px-4 py-3 shadow-sm`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedCustomer.company}
                    </h3>
                    <p
                      className={`text-sm bg-blue-gray-50 p-1 rounded-lg ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Client ID: <span className="font-semibold">{selectedCustomer.id}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCustomer.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : selectedCustomer.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedCustomer.status}
                    </span>
                    <button
                      onClick={() => setIsDetailsModalOpen(false)}
                      className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Basic Information Card */}
                  <div
                    className={`rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } shadow overflow-hidden`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <h4 className="text-base font-semibold">
                        Basic Information
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="Company Name"
                        value={selectedCustomer.company}
                      />
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="Created At"
                        value={new Date(
                          selectedCustomer.createdAt
                        ).toLocaleString()}
                      />
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="Website"
                        value={selectedCustomer.website || "N/A"}
                        isLink
                      />
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="Number of Companies"
                        value={selectedCustomer.numberOfCompanies}
                      />
                    </div>
                  </div>

                  {/* Company Details Card */}
                  <div
                    className={`rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } shadow overflow-hidden`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <h4 className="text-base font-semibold">
                        Company Details
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="Corporate Address"
                        value={selectedCustomer.corporateAddress}
                      />
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="GST Number"
                        value={selectedCustomer.gstNumber}
                      />
                      <InfoItem
                        isDarkMode={isDarkMode}
                        label="PAN Number"
                        value={selectedCustomer.panNumber}
                      />
                      
                    </div>
                  </div>

                  {/* Contact Information Card - Full Width */}
                  <div
                    className={`rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } shadow overflow-hidden lg:col-span-2`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <h4 className="text-base font-semibold">
                        Contact Information
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ContactSection
                          isDarkMode={isDarkMode}
                          title="SPOC Details"
                          name={selectedCustomer.spocName || "N/A"}
                          email={selectedCustomer.email}
                          contact={selectedCustomer.contactNumber}
                          className={`${
                            isDarkMode ? "bg-gray-600" : "bg-gray-50"
                          } p-3 rounded-lg`}
                        />
                        <ContactSection
                          isDarkMode={isDarkMode}
                          title="Authorized Signatory"
                          name={selectedCustomer.authorizedSignatory?.name}
                          email={selectedCustomer.authorizedSignatory?.email}
                          contact={
                            selectedCustomer.authorizedSignatory?.contact
                          }
                          className={`${
                            isDarkMode ? "bg-gray-600" : "bg-gray-50"
                          } p-3 rounded-lg`}
                        />
                        {selectedCustomer.ownerDirectorDetails?.map(
                          (director, index) => (
                            <ContactSection
                              key={index}
                              isDarkMode={isDarkMode}
                              title={`Owner/Director `}
                              name={director.name}
                              email={director.email}
                              contact={director.contact}
                              className={`${
                                isDarkMode ? "bg-gray-600" : "bg-gray-50"
                              } p-3 rounded-lg`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documents Section - Full Width */}
                  <div
                    className={`rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } shadow overflow-hidden lg:col-span-2`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                      <h4 className="text-base font-semibold">Documents</h4>
                      <button
                        onClick={() => {
                          setSelectedClientId(selectedCustomer.id);
                          setIsDocumentModalOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm ${
                          isDarkMode
                            ? "bg-gray-600 hover:bg-gray-500"
                            : "bg-gray-100 hover:bg-gray-200"
                        } transition-colors duration-200`}
                      >
                        <FiUpload className="w-4 h-4" />
                        <span>Upload Documents</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <DocumentsList />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {deleteModal}

      {/* Move the Onboard Modal here, inside the main return statement */}
      <AnimatePresence>
        {isOnboardModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              } rounded-lg p-6 max-w-md w-full mx-4`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <h3 className="text-xl font-bold mb-4">Onboard Client</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await onboardClient({
                      clientId: selectedCustomer.id,
                      action: "Accepted",
                      teamLeaderId: selectedTeamLeader,
                    });

                    // Close the modal first
                    setIsOnboardModalOpen(false);

                    // Reset the selected team leader
                    setSelectedTeamLeader("");

                    // Show success message
                    toast.success("Client onboarded successfully");

                    // Refresh the customers list
                    await fetchCustomers();
                  } catch (error) {
                    console.error("Error onboarding client:", error);
                    toast.error("Failed to onboard client");
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block mb-2 font-medium">
                    Select Team Leader
                  </label>
                  <select
                    value={selectedTeamLeader}
                    onChange={(e) => setSelectedTeamLeader(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Select a Team Leader</option>
                    {assigneeOptions.map((tl) => (
                      <option key={tl._id} value={tl._id}>
                        {tl.name} - {tl.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsOnboardModalOpen(false)}
                    className={`px-4 py-2 rounded ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DocumentUpload
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedClientId(null);
          // Refresh documents by calling fetchClientDocuments
          if (selectedCustomer?.id) {
            fetchClientDocuments(selectedCustomer.id);
          }
        }}
        clientId={selectedClientId}
        isDarkMode={isDarkMode}
        // Add an onUploadSuccess prop to refresh documents after successful upload
        onUploadSuccess={() => {
          if (selectedCustomer?.id) {
            fetchClientDocuments(selectedCustomer.id);
          }
        }}
      />

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingCustomer && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`fixed inset-0 ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              } overflow-y-auto`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div
                    className={`sticky top-0 z-10 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
                    } border-b ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    } px-4 py-4`}
                  >
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Edit Customer</h2>
                      <button
                        onClick={() => setIsEditModalOpen(false)}
                        className={`p-2 rounded-full ${
                          isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        } transition-colors duration-200`}
                      >
                        <FiX className="text-2xl" />
                      </button>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="max-w-7xl mx-auto px-4 py-6">
                    <form onSubmit={handleEditSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Basic Information */}
                        <div
                          className={`col-span-1 p-6 rounded-xl ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <h3 className="text-xl font-semibold mb-6">
                            Basic Information
                          </h3>
                          <div className="space-y-4">
                            {/* Company Name */}
                            <div>
                              <label className="block mb-2 font-medium">
                                Company Name
                              </label>
                              <input
                                type="text"
                                value={editingCustomer.companyName}
                                onChange={(e) =>
                                  setEditingCustomer({
                                    ...editingCustomer,
                                    companyName: e.target.value,
                                  })
                                }
                                className={`w-full px-4 py-2 rounded-lg ${
                                  isDarkMode
                                    ? "bg-gray-800 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                required
                              />
                            </div>

                            {/* Add other basic information fields similarly */}
                          </div>
                        </div>

                        {/* Add other sections similarly */}
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(false)}
                          className={`px-6 py-2 rounded-lg ${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-gray-200 hover:bg-gray-300"
                          } transition-colors duration-200`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign KAM Modal */}
      <AnimatePresence>
        {isAssignKAMModalOpen && selectedClientForKAM && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignKAMModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl ${
                isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white"
              }`}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <FiUserPlus size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Assign KAM
                    </h3>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                      For {selectedClientForKAM.company}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignKAMModalOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8">
                <div className="space-y-4">
                  <p className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    Choose a Key Account Manager (KAM) to assign to this client. This person will manage all operation and recruitment tasks.
                  </p>
                  
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {assigneeOptions.length > 0 ? (
                      assigneeOptions.map((kam) => (
                        <button
                          key={kam._id || kam.id}
                          onClick={() => handleAssignKAM(kam._id || kam.id)}
                          disabled={isAssigning}
                          className={`w-full group flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                            isDarkMode
                              ? "bg-slate-800/50 border-slate-700 hover:border-purple-500 hover:bg-slate-800"
                              : "bg-gray-50 border-gray-100 hover:border-purple-300 hover:bg-white hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {kam.name.charAt(0)}
                            </div>
                            <div>
                              <div className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {kam.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {kam.email}
                              </div>
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isDarkMode ? "bg-slate-700 text-slate-400" : "bg-white text-purple-600 shadow-sm"
                          } group-hover:scale-110`}>
                            {isAssigning ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiUserPlus size={16} />
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-sm text-gray-500 italic">No available Team Leaders/KAMs found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-8 py-4 border-t flex justify-end ${
                isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-gray-50 border-gray-100"
              }`}>
                <button
                  onClick={() => setIsAssignKAMModalOpen(false)}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-colors ${
                    isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper Components
const InfoItem = ({ label, value, isLink, isDarkMode }) => (
  <div className=" flex items-center gap-2 justify-between">
    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
      {label}
    </p>
    {isLink && value !== "N/A" ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
      >
        {value}
      </a>
    ) : (
      <p className="text-base font-medium mt-1">{value}</p>
    )}
  </div>
);

const ContactSection = ({
  title,
  name,
  email,
  contact,
  className = "",
  isDarkMode,
}) => (
  <div className={`rounded-lg p-4 shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} ${className}`}>
    <h5 className={`text-lg font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
      {title}
    </h5>
    <div className="mt-2 space-y-1">
      <p className="font-medium">{name || "N/A"}</p>
      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {email || "N/A"}
      </p>
      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {contact || "N/A"}
      </p>
    </div>
  </div>
);

export default CustomersTab;

