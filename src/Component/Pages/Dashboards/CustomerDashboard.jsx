import React, { useState, useEffect, useCallback } from "react";
import { Input, DatePicker } from "@material-tailwind/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { VideoCameraIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { closeRecruitmentRequest } from "../service/api";
import { XCircleIcon } from "@heroicons/react/24/outline";

import {
  DocumentIcon,
  DocumentTextIcon,
  CheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  Card,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  List,
  ListItem,
  ListItemPrefix,
  Badge,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import Timeline from "../../../components/Timeline";
import ChatWindow from "../../../components/ChatWindow";
import DocumentUpload from "../../../components/DocumentUpload";
import { NavbarWithSearch } from "../../../components/Navbar";
import { KeyIcon, PencilIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
import {
  resetClientPassword,
  createRecruitmentRequest,
  getClientRequests,
  acceptRecruitmentRequest,
  rejectRecruitmentRequest,
  rejectCandidate,
  acceptCandidate,
  scheduleInterview,
  getRecruitmentStatus,
} from "../service/api";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  UserCircleIcon,
  UserPlusIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  UsersIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Select, Option } from "@material-tailwind/react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { motion } from "framer-motion";
import { getClientDetails } from "../service/api";

const TaskChip = ({ task }) => (
  <div
    className={`
      px-2 py-1 mb-1 rounded text-xs font-medium group relative
      ${
        task.status === "review"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
          : ""
      }
      ${
        task.status === "pending"
          ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
          : ""
      }
      ${
        task.status === "resolved"
          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
          : ""
      }
      ${
        task.status === "active"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
          : ""
      }
    `}
  >
    <div className="font-semibold">{task.time}</div>
    <div className="truncate max-w-[120px]">{task.title}</div>

    {/* Tooltip */}
    <div
      className="absolute left-0 -top-12 bg-gray-900 text-white px-2 py-1 rounded text-xs 
                    invisible opacity-0 group-hover:visible group-hover:opacity-100 
                    transition-all duration-200 z-50 whitespace-normal max-w-[200px] break-words"
    >
      {task.title}
    </div>
  </div>
);

const AddRecruitmentModal = ({
  isOpen,
  handleOpen,
  onSubmit,
  newRecruit,
  handleRecruitChange,
}) => {
  return (
    <Dialog
      open={isOpen}
      handler={handleOpen}
      size="xxl"
      className="dark:bg-gray-800"
      animate={{
        mount: { scale: 1, opacity: 1 },
        unmount: { scale: 0.9, opacity: 0 },
      }}
    >
      <DialogHeader className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <UserPlusIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <Typography variant="h5" className="font-bold dark:text-white">
              Add New Recruitment Request
            </Typography>
            <Typography
              variant="small"
              className="text-gray-600 dark:text-gray-400"
            >
              Fill in the details to create a new recruitment position
            </Typography>
          </div>
        </div>
        <IconButton
          variant="text"
          color="gray"
          onClick={handleOpen}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </DialogHeader>

      <DialogBody className="px-6 py-4 overflow-auto max-h-[calc(100vh-200px)]">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Basic Information Section */}
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <UserCircleIcon className="h-5 w-5 text-indigo-500" />
              </div>
              <Typography
                variant="h6"
                className="font-semibold dark:text-white"
              >
                Basic Information
              </Typography>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                name="position"
                label="Position"
                value={newRecruit.position}
                onChange={handleRecruitChange}
                className="w-full focus:ring-2 focus:ring-indigo-500"
                containerProps={{ className: "min-w-[100px]" }}
                required
                icon={<BriefcaseIcon className="h-5 w-5 text-indigo-500" />}
              />

              <Input
                type="text"
                name="keywords"
                label="Keywords (max 3, comma-separated)"
                value={newRecruit.keywords}
                onChange={(e) => {
                  const keywords = e.target.value
                    .split(",")
                    .map((k) => k.trim());
                  if (keywords.length <= 3) {
                    handleRecruitChange(e);
                  } else {
                    // Only take the first 3 keywords
                    const limitedKeywords = keywords.slice(0, 3).join(", ");
                    handleRecruitChange({
                      target: { name: "keywords", value: limitedKeywords },
                    });
                  }
                }}
                className="w-full focus:ring-2 focus:ring-indigo-500"
                containerProps={{ className: "min-w-[100px]" }}
                icon={<TagIcon className="h-5 w-5 text-indigo-500" />}
                error={newRecruit.keywords.split(",").length > 3}
                helperText={
                  newRecruit.keywords.split(",").length > 3
                    ? "Maximum 3 keywords allowed"
                    : `${
                        3 -
                        newRecruit.keywords.split(",").filter((k) => k.trim())
                          .length
                      } keywords remaining`
                }
              />
            </div>
          </div>

          {/* Experience & Location Section */}
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <Typography
                variant="h6"
                className="font-semibold dark:text-white"
              >
                Experience & Location
              </Typography>
            </div>

            <div className="space-y-4">
              <Input
                type="number"
                name="experienceYears"
                label="Experience (Years)"
                value={newRecruit.experienceYears}
                onChange={handleRecruitChange}
                className="w-full focus:ring-2 focus:ring-emerald-500"
                containerProps={{ className: "min-w-[100px]" }}
                icon={<ClockIcon className="h-5 w-5 text-emerald-500" />}
              />

              <Input
                type="text"
                name="currentLocation"
                label="Current Location"
                value={newRecruit.currentLocation}
                onChange={handleRecruitChange}
                className="w-full focus:ring-2 focus:ring-emerald-500"
                containerProps={{ className: "min-w-[100px]" }}
                icon={<MapPinIcon className="h-5 w-5 text-emerald-500" />}
              />

              <Input
                type="text"
                name="preferredLocation"
                label="Preferred Location"
                value={newRecruit.preferredLocation}
                onChange={handleRecruitChange}
                className="w-full focus:ring-2 focus:ring-emerald-500"
                containerProps={{ className: "min-w-[100px]" }}
                icon={<GlobeAltIcon className="h-5 w-5 text-emerald-500" />}
              />
            </div>
          </div>

          {/* Compensation & Requirements Section */}
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-amber-500" />
              </div>
              <Typography
                variant="h6"
                className="font-semibold dark:text-white"
              >
                Compensation & Requirements
              </Typography>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                name="annualSalary"
                label="Annual Salary (Lacs)"
                value={newRecruit.annualSalary}
                onChange={handleRecruitChange}
                className="w-full focus:ring-2 focus:ring-amber-500"
                containerProps={{ className: "min-w-[100px]" }}
                icon={<CurrencyDollarIcon className="h-5 w-5 text-amber-500" />}
              />

              <Select
                label="Notice Period"
                name="noticePeriod"
                value={newRecruit.noticePeriod}
                onChange={(value) =>
                  handleRecruitChange({
                    target: { name: "noticePeriod", value },
                  })
                }
                className="w-full"
              >
                <Option value="">Select Notice Period</Option>
                <Option value="Immediate">Immediate</Option>
                <Option value="1 month">1 month</Option>
                <Option value="2 months">2 months</Option>
                <Option value="3 months">3 months</Option>
              </Select>

              <Select
                label="UG Qualification"
                name="ugQualification"
                value={newRecruit.ugQualification}
                onChange={(value) =>
                  handleRecruitChange({
                    target: { name: "ugQualification", value },
                  })
                }
                className="w-full"
                animate={{
                  mount: { y: 0 },
                  unmount: { y: 25 },
                }}
                lockScroll={true}
                filter={(searchQuery, options) =>
                  options.filter((option) =>
                    option.props.value
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                }
              >
                <Option value="">Select Qualification</Option>
                <Option value="Any Graduate">Any Graduate</Option>
                <Option value="Not Required">Not Required</Option>
                <Option value="B.Tech/B.E.">B.Tech/B.E.</Option>
                <Option value="BCA">BCA</Option>
                <Option value="B.Sc">B.Sc</Option>
                <Option value="B.Sc Computer Science">
                  B.Sc Computer Science
                </Option>
                <Option value="B.Sc IT">B.Sc Information Technology</Option>
                <Option value="B.Com">B.Com</Option>
                <Option value="BBA">BBA</Option>
                <Option value="BBA IT">BBA Information Technology</Option>
                <Option value="B.A">B.A</Option>
                <Option value="B.Arch">B.Arch</Option>
                <Option value="BDS">BDS</Option>
                <Option value="BHM">BHM</Option>
                <Option value="B.Pharm">B.Pharm</Option>
                <Option value="Other">Other Bachelor's Degree</Option>
              </Select>

              {/* <Select
                label="PG Qualification"
                name="pgQualification"
                value={newRecruit.pgQualification}
                onChange={(value) =>
                  handleRecruitChange({
                    target: { name: "pgQualification", value },
                  })
                }
                className="w-full mt-4"
              >
                <Option value="">Select Post Graduation</Option>
                <Option value="Not Required">Not Required</Option>
                <Option value="M.Tech">M.Tech</Option>
                <Option value="MCA">MCA</Option>
                <Option value="M.Sc">M.Sc</Option>
                <Option value="MBA">MBA</Option>
                <Option value="M.Com">M.Com</Option>
                <Option value="M.A">M.A</Option>
                <Option value="Other">Other Master's Degree</Option>
              </Select> */}
            </div>
          </div>
        </form>
      </DialogBody>

      <DialogFooter className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-end gap-4">
          <Button
            variant="outlined"
            color="gray"
            onClick={handleOpen}
            className="flex items-center gap-2"
          >
            <XMarkIcon className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={onSubmit}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Submit Request
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

const TaskDetailModal = ({ isOpen, handleOpen, selectedDate, tasks }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase() || "medium") {
      case "high":
        return "red";
      case "medium":
        return "amber";
      case "low":
        return "green";
      default:
        return "blue-gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Dialog
      open={isOpen}
      handler={handleOpen}
      size="lg"
      className="dark:bg-gray-800 p-0"
      animate={{
        mount: { scale: 1, opacity: 1 },
        unmount: { scale: 0.9, opacity: 0 },
      }}
    >
      <DialogHeader className="flex flex-col space-y-4 px-6 pt-6 pb-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-500/20 p-2 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <Typography variant="h5" className="font-bold dark:text-white">
                {format(selectedDate, "MMMM d, yyyy")}
              </Typography>
              <Typography
                variant="small"
                className="text-gray-600 dark:text-gray-400"
              >
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} scheduled
              </Typography>
            </div>
          </div>
          <IconButton
            variant="text"
            color="gray"
            onClick={handleOpen}
            className="rounded-full"
          >
            <XMarkIcon className="h-6 w-6" />
          </IconButton>
        </div>
      </DialogHeader>

      <DialogBody className="px-6 py-4 overflow-auto max-h-[60vh]">
        <div className="space-y-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      task.status === "completed"
                        ? "bg-green-50 dark:bg-green-500/20"
                        : task.status === "pending"
                        ? "bg-amber-50 dark:bg-amber-500/20"
                        : "bg-blue-50 dark:bg-blue-500/20"
                    }`}
                  >
                    {getStatusIcon(task.status)}
                  </div>
                  <div>
                    <Typography
                      variant="h6"
                      className="font-semibold dark:text-white"
                    >
                      {task.title}
                    </Typography>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      {task.time}
                    </div>
                  </div>
                </div>
                <Chip
                  size="sm"
                  variant="ghost"
                  value={task.priority}
                  color={getPriorityColor(task.priority)}
                  className="capitalize font-medium"
                />
              </div>

              {task.description && (
                <Typography className="text-gray-600 dark:text-gray-400 mb-4">
                  {task.description}
                </Typography>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <Typography
                    variant="small"
                    className="font-medium dark:text-gray-300"
                  >
                    {task.assignee || "Unassigned"}
                  </Typography>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <TagIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <Chip
                    size="sm"
                    variant="ghost"
                    value={task.type}
                    color={
                      task.type === "meeting"
                        ? "blue"
                        : task.type === "review"
                        ? "amber"
                        : task.type === "deadline"
                        ? "red"
                        : "green"
                    }
                    className="capitalize"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  );
};

const DayCell = ({ day, tasks, isCurrentMonth, isToday }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpen = () => setIsModalOpen(!isModalOpen);

  const displayTasks = tasks.slice(0, 2); // Only show first 2 tasks
  const remainingTasks = tasks.length - 2;

  return (
    <>
      <div
        onClick={tasks.length > 0 ? handleOpen : undefined}
        className={`
          min-h-[120px] p-2 rounded-lg border transition-all duration-200
          ${
            isCurrentMonth
              ? "border-gray-200 dark:border-gray-700"
              : "border-transparent"
          }
          ${isToday ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" : ""}
          ${
            tasks.length > 0
              ? "hover:shadow-md dark:hover:shadow-gray-800 cursor-pointer"
              : ""
          }
          dark:hover:border-gray-600
          ${!isCurrentMonth ? "opacity-50" : ""}
          relative group overflow-hidden
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <Typography
            className={`
              font-medium rounded-full w-8 h-8 flex items-center justify-center
              ${isToday ? "bg-blue-500 text-white" : ""}
              ${
                isCurrentMonth
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-600"
              }
            `}
          >
            {format(day, "d")}
          </Typography>
          {tasks.length > 0 && (
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
          )}
        </div>

        <div className="space-y-1">
          {displayTasks.map((task) => (
            <TaskChip key={task.id} task={task} />
          ))}

          {remainingTasks > 0 && (
            <div className="flex justify-end mt-1">
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                +{remainingTasks} more
              </span>
            </div>
          )}
        </div>

        {isModalOpen && (
          <TaskDetailModal
            isOpen={isModalOpen}
            handleOpen={handleOpen}
            selectedDate={day}
            tasks={tasks}
          />
        )}
      </div>
    </>
  );
};

// Enhanced StatsCard component
const StatsCard = ({ title, value, color, icon: Icon }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:border-${color}-500`}
  >
    <div className="flex items-center justify-between">
      <div
        className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-500/20 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className={`h-6 w-6 text-${color}-500`} />
      </div>
    </div>
    <div className="mt-4">
      <Typography variant="h3" className={`font-bold text-${color}-500 mb-1`}>
        {value}
      </Typography>
      <Typography
        variant="small"
        className="font-medium text-gray-600 dark:text-gray-400"
      >
        {title}
      </Typography>
    </div>
  </div>
);

const MyProfileModal = ({ isOpen, handleOpen, clientData = {} }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const token = jwtDecode(localStorage.getItem("token"));
      const clientId = token.id;

      await resetClientPassword(clientId, passwordData.newPassword);

      setSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error.message || "Failed to update password");
    }
  };

  const TabButton = ({ tab, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${
          activeTab === tab
            ? "bg-blue-50 text-blue-500 dark:bg-blue-500/20"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <Dialog
      open={isOpen}
      handler={handleOpen}
      size="md"
      className="dark:bg-gray-800"
    >
      <DialogHeader className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <Typography
          variant="h5"
          className="font-bold dark:text-white"
          handler={handleOpen}
        >
          My Profile
        </Typography>
        <div className="flex gap-2">
          <TabButton tab="profile" label="Profile" icon={UserCircleIcon} />
          <TabButton tab="security" label="Security" icon={KeyIcon} />
        </div>
      </DialogHeader>

      <DialogBody className="px-6 py-4 overflow-auto max-h-[calc(100vh-200px)]">
        {activeTab === "profile" ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={
                    clientData?.profileImage ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full mb-4 bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <Typography variant="h4" className="font-bold dark:text-white">
                {clientData?.name || "N/A"}
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-400">
                Client
              </Typography>
            </div>

            <List>
              <ListItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <ListItemPrefix>
                  <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                </ListItemPrefix>
                <div>
                  <Typography
                    variant="small"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Email
                  </Typography>
                  <Typography className="font-medium dark:text-white">
                    {clientData?.email || "N/A"}
                  </Typography>
                </div>
              </ListItem>

              <ListItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <ListItemPrefix>
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />
                </ListItemPrefix>
                <div>
                  <Typography
                    variant="small"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Company
                  </Typography>
                  <Typography className="font-medium dark:text-white">
                    {clientData?.companyName || "N/A"}
                  </Typography>
                </div>
              </ListItem>

              <ListItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <ListItemPrefix>
                  <PhoneIcon className="h-5 w-5 text-blue-500" />
                </ListItemPrefix>
                <div>
                  <Typography
                    variant="small"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Contact
                  </Typography>
                  <Typography className="font-medium dark:text-white">
                    {clientData?.contactNumber || "N/A"}
                  </Typography>
                </div>
              </ListItem>

              <ListItem className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <ListItemPrefix>
                  <MapPinIcon className="h-5 w-5 text-blue-500" />
                </ListItemPrefix>
                <div>
                  <Typography
                    variant="small"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Address
                  </Typography>
                  <Typography className="font-medium dark:text-white">
                    {clientData?.companyAddress || "N/A"}
                  </Typography>
                </div>
              </ListItem>
            </List>
          </>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-500/20 rounded-lg p-4">
              <Typography className="text-blue-500 font-medium">
                Password Requirements
              </Typography>
              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Minimum 8 characters long</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Typography
                  variant="small"
                  className="text-gray-600 dark:text-gray-400 mb-2"
                >
                  Current Password
                </Typography>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  className="text-gray-600 dark:text-gray-400 mb-2"
                >
                  New Password
                </Typography>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <Typography
                  variant="small"
                  className="text-gray-600 dark:text-gray-400 mb-2"
                >
                  Confirm New Password
                </Typography>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/20 text-red-500">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/20 text-green-500">
                  {success}
                </div>
              )}

              <Button
                type="submit"
                variant="filled"
                color="blue"
                className="w-full"
                size="lg"
              >
                Update Password
              </Button>
            </form>
          </div>
        )}
      </DialogBody>

      <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outlined" color="gray" onClick={handleOpen}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

// Add this new component for the search bar
const CalendarSearch = ({ onSearch }) => {
  return (
    <div className="mb-6 relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search tasks by title, type, or assignee..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-300 shadow-sm hover:shadow-md"
        />
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientData, setClientData] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const formatInterviewDateTime = (dateTimeString) => {
    try {
      if (!dateTimeString) return "Not scheduled";
      
      const date = new Date(dateTimeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      return format(date, "dd MMM yyyy 'at' hh:mm a");
    } catch (error) {
      console.error("Error formatting interview date:", error);
      return "Invalid date";
    }
  };

  const handleClosePosition = async (positionId) => {
    try {
      // Get user ID from JWT token
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);

      await closeRecruitmentRequest({
        recruitmentId: positionId,
        userType: "client",
        userId: decodedToken.id, // Using ID from decoded token
      });

      // Refresh the recruitment requests list
      await fetchRecruitmentRequests();

      toast.success("Position closed successfully");
    } catch (error) {
      console.error("Failed to close position:", error);
      toast.error(error.message || "Failed to close position");
    }
  };

  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="colored"
  />;
  const [selectedRecruit, setSelectedRecruit] = useState(null);
  const [meetingDate, setMeetingDate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [rejectedCandidates, setRejectedCandidates] = useState({});

  const handleScheduleModalOpen = () => {
    setIsScheduleModalOpen(!isScheduleModalOpen);
  };
  const ScheduleInterviewModal = ({
    isOpen,
    handleOpen,
    selectedRecruit,
    meetingDate,
    setMeetingDate,
    onScheduleSuccess,
  }) => {
    const [meetingTime, setMeetingTime] = useState("10:00");
    const [meetingType, setMeetingType] = useState("online");
    const [meetingLocation, setMeetingLocation] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        // Format date to DD-MM-YYYY
        const formattedDate = format(meetingDate, "dd-MM-yyyy");

        // Call the scheduleInterview API
        await scheduleInterview({
          recruitmentId: selectedRecruit.id,
          fileId: selectedRecruit.cv.fileId,
          interviewDate: formattedDate,
          interviewTime: meetingTime,
        });

        toast.success("Interview scheduled successfully!");
        onScheduleSuccess();
        await fetchRecruitmentRequests(); // Call the fetch function directly
        handleOpen(); // Close the modal
      } catch (error) {
        console.error("Failed to schedule interview:", error);
        toast.error(error.message || "Failed to schedule interview");
      }
    };

    return (
      <Dialog
        open={isOpen}
        handler={handleOpen}
        size="md"
        className="dark:bg-gray-800"
      >
        <DialogHeader className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <Typography variant="h5" className="font-bold dark:text-white">
                Schedule Interview
              </Typography>
              <Typography
                variant="small"
                className="text-gray-600 dark:text-gray-400"
              >
                {selectedRecruit?.name}
              </Typography>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interview Details Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                <Typography className="font-medium text-blue-500">
                  Interview Details
                </Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Typography
                    variant="small"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Interview Date
                  </Typography>
                  <Input
                    type="date"
                    value={format(meetingDate || new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setMeetingDate(new Date(e.target.value))}
                    className="w-full !border-blue-200 focus:!border-blue-500 dark:!border-blue-700"
                    containerProps={{ className: "!min-w-0" }}
                    required
                  />
                </div>

                {/* Time Picker */}
                <div className="space-y-2">
                  <Typography
                    variant="small"
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    Interview Time
                  </Typography>
                  <Input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full !border-blue-200 focus:!border-blue-500 dark:!border-blue-700"
                    containerProps={{ className: "!min-w-0" }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Field (only for in-person) */}
            {meetingType === "inPerson" && (
              <div className="space-y-2">
                <Typography
                  variant="small"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  Interview Location
                </Typography>
                <Textarea
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="Enter the interview venue details..."
                  className="w-full !border-gray-200 focus:!border-blue-500 dark:!border-gray-700"
                  rows={3}
                  required
                />
              </div>
            )}
          </form>
        </DialogBody>

        <DialogFooter className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end gap-4">
            <Button
              variant="outlined"
              color="gray"
              onClick={handleOpen}
              className="flex items-center gap-2"
            >
              <XMarkIcon className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              onClick={handleSubmit}
            >
              <CalendarDaysIcon className="h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    );
  };

  const RejectDialog = () => (
    <Dialog open={openRejectDialog} handler={() => setOpenRejectDialog(false)}>
      <DialogHeader className="flex items-center gap-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <XMarkIcon className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <Typography variant="h5">Reject Candidate</Typography>
          <Typography variant="small" color="gray" className="font-normal">
            Please provide a reason for rejection
          </Typography>
        </div>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          <Select
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(value) => setRejectionReason(value)}
          >
            <Option value="insufficient_experience">
              Insufficient Experience
            </Option>
            <Option value="skill_mismatch">Skill Mismatch</Option>
            {/* <Option value="salary_expectations">Salary Expectations Too High</Option> */}
            <Option value="location_constraint">Location Constraints</Option>
            <Option value="qualification_mismatch">
              Qualification Mismatch
            </Option>
            {/* <Option value="other">Other</Option> */}
          </Select>

          {rejectionReason === "other" && (
            <Textarea
              label="Specify Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}
        </div>
      </DialogBody>
      <DialogFooter className="space-x-2">
        <Button
          variant="outlined"
          color="gray"
          onClick={() => {
            setOpenRejectDialog(false);
            setRejectionReason("");
            setSelectedCandidate(null);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          color="red"
          onClick={() => handleFinalReject()}
        >
          Confirm Rejection
        </Button>
      </DialogFooter>
    </Dialog>
  );
  const handleRejectCandidate = (positionId, cv) => {
    setSelectedCandidate({ positionId, cv });
    setOpenRejectDialog(true);
  };
  const handleFinalReject = async () => {
    try {
      if (!selectedCandidate || !rejectionReason) return;

      await rejectCandidate({
        recruitmentId: selectedCandidate.positionId,
        fileId: selectedCandidate.cv.fileId,
        reason: rejectionReason,
      });

      toast.success("Candidate rejected successfully");
      setOpenRejectDialog(false);
      setRejectionReason("");
      setSelectedCandidate(null);
      fetchRecruitmentRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to reject candidate");
      console.error(error);
    }
  };
  const fetchRecruitmentRequests = async () => {
    try {
      setIsRefreshing(true);
      const response = await getClientRequests(clientData._id);

      if (response?.requests) {
        setPositions(response.requests);
        console.log("Updated positions:", response.requests); // Debug log
      }
    } catch (error) {
      console.error("Error fetching recruitment requests:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (clientData?.teamLeader?._id) {
      console.log("Refreshing recruitment requests...");
      fetchRecruitmentRequests();
    }
  }, [clientData, refreshTrigger]);

  const [recruits, setRecruits] = useState([
    {
      name: "John Doe",
      position: "Software Engineer",
      details: "5 years of experience in full-stack development.",
    },
    {
      name: "Jane Smith",
      position: "Product Manager",
      details: "Expert in agile methodologies and product lifecycle.",
    },
    {
      name: "Alice Johnson",
      position: "UI/UX Designer",
      details: "Passionate about creating user-friendly interfaces.",
    },
  ]); // State to manage recruits
  const [positions, setPositions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [positionsPerPage] = useState(5); // You can adjust this number

  // Add this pagination logic before the return statement
  const indexOfLastPosition = currentPage * positionsPerPage;
  const indexOfFirstPosition = indexOfLastPosition - positionsPerPage;
  const currentPositions = positions.slice(
    indexOfFirstPosition,
    indexOfLastPosition
  );
  const totalPages = Math.ceil(positions.length / positionsPerPage);

  // Add this function to handle page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add clientData as dependency

  const [newRecruit, setNewRecruit] = useState({
    name: "",
    position: "",
    details: "",
    keywords: "",
    excludeKeywords: "",
    itSkills: "",
    experienceYears: "",
    currentLocation: "Jaipur",
    preferredLocation: "",
    excludeAnywhere: false,
    annualSalary: "",
    department: "",
    industry: "",
    company: "",
    excludeCompany: "",
    designation: "",
    noticePeriod: "Any",
    ugQualification: "Any UG qualification",
    pgQualification: "Any PG qualification",
    diversityDetails: "",
    gender: "All candidates",
    candidateAge: "",
    workPermit: "",
    showCandidates: "All candidates",
    verifiedMobile: false,
    verifiedEmail: false,
    attachedResume: false,
  }); // State for new recruit details
  const [showRecruitForm, setShowRecruitForm] = useState(false); // State to manage form visibility

  const handleRecruitChange = (e) => {
    const { name, value } = e.target;
    setNewRecruit((prev) => ({ ...prev, [name]: value }));
  };
  const [isRecruitmentModalOpen, setIsRecruitmentModalOpen] = useState(false);

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await acceptRecruitmentRequest({
        requestId,
        teamLeaderId: clientData.teamLeader._id,
        clientId: clientData._id,
      });

      // Update the local state to reflect the change
      setPositions((prevPositions) =>
        prevPositions.map((pos) =>
          pos._id === requestId ? { ...pos, status: "accepted" } : pos
        )
      );
    } catch (error) {
      console.error("Error accepting request:", error);
      // Show error message to user
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await rejectRecruitmentRequest({
        requestId,
        teamLeaderId: clientData.teamLeader._id,
        clientId: clientData._id,
      });

      // Update the local state to reflect the change
      setPositions((prevPositions) =>
        prevPositions.map((pos) =>
          pos._id === requestId ? { ...pos, status: "rejected" } : pos
        )
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
      // Show error message to user
    }
  };

  const handleRecruitmentModalOpen = () => {
    setIsRecruitmentModalOpen(!isRecruitmentModalOpen);
  };
  const handleAddRecruit = async (e) => {
    e.preventDefault();
    try {
      // Get the client ID from the JWT token
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const clientId = decoded.id;
      const teamLeaderId = clientData.teamLeader._id;
      console.log({ teamLeaderId });
      // Format the data according to the API requirements
      const requestData = {
        name: clientData?.companyName || "MABICONS", // Set name to company name
        position: newRecruit.position,
        keywords: newRecruit.keywords,
        experience: newRecruit.experienceYears,
        currLocation: newRecruit.currentLocation,
        preferredLocation: newRecruit.preferredLocation,
        salary: newRecruit.annualSalary,
        noticePeriod: newRecruit.noticePeriod.split(" ")[0], // Convert "2 months" to 2
        qualification: newRecruit.ugQualification,
        employeeId: "", // If needed, add this
        teamLeaderId: teamLeaderId, // If needed, add this
        clientId: clientId,
      };

      // Call the API
      const response = await createRecruitmentRequest(requestData);

      // If successful, update the local state
      setPositions((prev) => [
        ...prev,
        {
          position: newRecruit.position,
          department: newRecruit.department,
          experienceYears: `${newRecruit.experienceYears} Years`,
          currentLocation: newRecruit.currentLocation,
          preferredLocation: newRecruit.preferredLocation,
          annualSalary: newRecruit.annualSalary,
          keywords: newRecruit.keywords,
          noticePeriod: newRecruit.noticePeriod,
          ugQualification: newRecruit.ugQualification,
          status: "active",
        },
      ]);

      // Reset the form
      setNewRecruit({
        position: "",
        details: "",
        keywords: "",
        excludeKeywords: "",
        itSkills: "",
        experienceYears: "",
        currentLocation: "Jaipur",
        preferredLocation: "",
        excludeAnywhere: false,
        annualSalary: "",
        department: "",
        industry: "",
        company: "",
        excludeCompany: "",
        designation: "",
        noticePeriod: "Any",
        ugQualification: "Any UG qualification",
        pgQualification: "Any PG qualification",
        diversityDetails: "",
        gender: "All candidates",
        candidateAge: "",
        workPermit: "",
        showCandidates: "All candidates",
        verifiedMobile: false,
        verifiedEmail: false,
        attachedResume: false,
      });

      // Close the modal
      handleRecruitmentModalOpen();

      // Show success message (you can add a toast notification here)
      console.log("Recruitment request created successfully:", response);
    } catch (error) {
      // Handle errors (you can add a toast notification here)
      console.error("Failed to create recruitment request:", error);
      // You might want to show an error message to the user
    }
  };

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        console.log("Fetching client data..."); // Debug log 1

        const token = localStorage.getItem("token");
        console.log("Token:", token); // Debug log 2

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded); // Debug log 3

        const clientId = decoded.id;
        console.log("Client ID:", clientId); // Debug log 4

        const data = await getClientDetails(clientId);
        console.log("Received client data:", data); // Debug log 5

        setClientData(data.data);
      } catch (error) {
        console.error("Error in fetchClientData:", error);
      }
    };

    fetchClientData();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const clientId = decoded.userId;

        const response = await getClientRequests(clientId);
        setPositions(response.data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        toast.error("Failed to fetch positions");
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [refreshTrigger]);

  useEffect(() => {
    console.log("clientData state updated:", clientData);
  }, [clientData]);

  const handleProfileOpen = useCallback(() => {
    console.log("handleProfileOpen called"); // Debug log
    setIsProfileOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    console.log("Profile modal state changed:", isProfileOpen);
  }, [isProfileOpen]);

  const handleFileUpload = (document) => {
    setUploadedDocuments((prev) => [
      ...prev,
      {
        ...document,
        sender: "customer",
      },
    ]);
  };
  const getTaskType = (status) => {
    switch (status.toLowerCase()) {
      case "review":
        return "review";
      case "pending":
        return "Pending";
      case "resolved":
        return "Completed";
      case "active":
        return "Active";
      default:
        return "In process";
    }
  };

  // Convert API tasks to calendar format
  const formatApiTasks = useCallback((tasks) => {
    if (!tasks) return [];
  
    return tasks.reduce((acc, task) => {
      try {
        const date = new Date(task.dueDate);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn(`Invalid date for task: ${task._id}`);
          return acc;
        }
  
        const existingDateIndex = acc.findIndex((item) =>
          isSameDay(new Date(item.date), date)
        );
  
        const formattedTask = {
          id: task._id,
          title: task.title,
          description: task.description,
          time: format(date, "hh:mm a"),
          type: getTaskType(task.status),
          status: task.status.toLowerCase(),
          priority: task.priority.toLowerCase(),
          assignee: "You",
        };
  
        if (existingDateIndex >= 0) {
          acc[existingDateIndex].tasks.push(formattedTask);
        } else {
          acc.push({
            date: date,
            tasks: [formattedTask],
          });
        }
  
        return acc;
      } catch (error) {
        console.error(`Error formatting task: ${task._id}`, error);
        return acc;
      }
    }, []);
  }, []);

  const getTaskStats = useCallback(() => {
    if (!clientData?.tasks) {
      return {
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0,
      };
    }

    return clientData.tasks.reduce(
      (acc, task) => {
        acc.total++;

        switch (task.status.toLowerCase()) {
          case "active":
          case "work in progress":
            acc.inProgress++;
            break;
          case "resolved":
            acc.completed++;
            break;
          case "pending":
            acc.pending++;
            break;
        }

        return acc;
      },
      {
        total: 0,
        inProgress: 0,
        completed: 0,
        pending: 0,
      }
    );
  }, [clientData]);

  // Get the stats
  const taskStats = getTaskStats();

  const getDaysInMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getTasksForDate = (date) => {
    if (!clientData?.tasks) return [];
  
    try {
      const formattedTasks = formatApiTasks(clientData.tasks);
      const dayTasks = formattedTasks.find((dt) => {
        try {
          return isSameDay(new Date(dt.date), date);
        } catch (error) {
          console.error("Error comparing dates:", error);
          return false;
        }
      })?.tasks || [];
  
      if (!searchQuery) return dayTasks;
  
      return dayTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.status &&
            task.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (task.description &&
            task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } catch (error) {
      console.error("Error getting tasks for date:", error);
      return [];
    }
  };

  const getTaskColor = (type, priority) => {
    switch (type) {
      case "meeting":
        return priority === "high" ? "blue" : "light-blue";
      case "review":
        return priority === "high" ? "amber" : "yellow";
      case "call":
        return priority === "high" ? "green" : "light-green";
      case "deadline":
        return "red";
      default:
        return "gray";
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <Card className="p-6 mb-6 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <CalendarDaysIcon className="h-8 w-8 text-blue-500" />
            <Typography
              variant="h4"
              className="font-bold text-gray-800 dark:text-white"
            >
              Calendar
            </Typography>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="text"
              className="flex items-center gap-2 dark:text-white"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeftIcon strokeWidth={2} className="h-4 w-4" />
            </Button>
            <Typography variant="h6" className="font-medium dark:text-white">
              {format(currentDate, "MMMM yyyy")}
            </Typography>
            <Button
              variant="text"
              className="flex items-center gap-2 dark:text-white"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRightIcon strokeWidth={2} className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Updated CalendarSearch component */}
        <CalendarSearch onSearch={handleSearch} />

        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <Typography
              key={day}
              className="text-center font-medium text-gray-600 dark:text-gray-400"
            >
              {day}
            </Typography>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <DayCell
                key={day.toString()}
                day={day}
                tasks={dayTasks}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
              />
            );
          })}
        </div>
      </Card>
    );
  };

  // Add this function to handle accepting candidates
  const handleAcceptCandidate = async (positionId, cv) => {
    try {
      await acceptCandidate({
        recruitmentId: positionId,
        fileId: cv.fileId,
        reason: "skills matched", // You can make this dynamic if needed
      });

      toast.success("Candidate shortlisted successfully");
      fetchRecruitmentRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to shortlist candidate");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavbarWithSearch
        onProfileClick={handleProfileOpen}
        companyName={clientData?.companyName || "MABICONS"} // Pass company name as prop
      />

      <MyProfileModal
        isOpen={isProfileOpen}
        handleOpen={handleProfileOpen}
        clientData={clientData}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20">
                  <UserIcon className="h-8 w-8 text-blue-500" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Typography
                    variant="h3"
                    className="text-gray-800 dark:text-white font-bold"
                  >
                    Welcome back, {clientData?.name}!
                  </Typography>
                  <motion.span
                    initial={{ rotate: -45 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-2xl"
                  >
                    👋
                  </motion.span>
                </div>
                <Typography
                  variant="paragraph"
                  className="text-gray-600 dark:text-gray-400"
                >
                  Here's what's happening with your projects today.
                </Typography>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              title="Total Tasks"
              value={taskStats.total.toString()}
              color="blue"
              icon={ClockIcon}
            />
            <StatsCard
              title="In Progress"
              value={taskStats.inProgress.toString()}
              color="amber"
              icon={CalendarDaysIcon}
            />
            <StatsCard
              title="Completed"
              value={taskStats.completed.toString()}
              color="green"
              icon={CheckCircleIcon}
            />
            <StatsCard
              title="Pending"
              value={taskStats.pending.toString()}
              color="red"
              icon={ExclamationCircleIcon}
            />
          </div>
        </div>

        {/* Calendar Section */}
        {renderCalendar()}

        {/* Main Content - Updated grid layout */}
        <div className="">
          <div className="md:col-span-4">
            <Card className="sticky top-6 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 dark:bg-gray-800">
              <ChatWindow uploadedDocuments={uploadedDocuments} />
            </Card>
          </div>
        </div>
      </div>
      {/* Recruitment Section */}
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-7xl mt-10 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Recruitment
            </h2>
          </div>
          <AddRecruitmentModal
            isOpen={isRecruitmentModalOpen}
            handleOpen={handleRecruitmentModalOpen}
            onSubmit={handleAddRecruit}
            newRecruit={newRecruit}
            handleRecruitChange={handleRecruitChange}
          />
          {/* Submitted Requests List */}

          {positions.length > 0 ? (
            <div className="overflow-hidden rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-2xl">
              {/* Enhanced Header Section */}
              <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <BriefcaseIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <Typography
                        variant="h5"
                        className="font-bold text-gray-900 dark:text-white"
                      >
                        Positions opened by you
                      </Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Typography className="text-sm text-gray-600 dark:text-gray-400">
                          Total Positions:
                        </Typography>
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                          {positions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outlined"
                      color="blue"
                      className="flex items-center gap-2"
                      onClick={fetchRecruitmentRequests}
                      disabled={isRefreshing}
                    >
                      <svg
                        className={`h-4 w-4 ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button
                      className="flex items-center gap-2 px-4 py-2.5
              bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 
              hover:from-blue-600 hover:via-blue-700 hover:to-blue-600
              text-white font-medium rounded-xl
              transform hover:scale-105 hover:-translate-y-0.5
              transition-all duration-300 ease-out
              shadow-lg hover:shadow-blue-500/30
              border border-blue-400/20"
                      onClick={() => handleRecruitmentModalOpen()}
                    >
                      <PlusIcon className="h-5 w-5" />
                      Add New Position
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Table Content */}
              <div className="overflow-y-scroll h-[500px]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Position & Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Experience & Salary
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location & Notice
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Qualification
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Posted Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {positions.map((position, index) => (
                      <tr
                        key={position._id}
                        className={`
                hover:bg-blue-50/50 dark:hover:bg-gray-700/50
                transition-colors duration-200
                ${index % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/20" : ""}
              `}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {/* Position Header */}
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2.5 rounded-xl ${
                                  position.closedBy
                                    ? "bg-gray-100 dark:bg-gray-800"
                                    : "bg-blue-50 dark:bg-blue-900/20"
                                }`}
                              >
                                <BriefcaseIcon
                                  className={`h-6 w-6 ${
                                    position.closedBy
                                      ? "text-gray-400"
                                      : "text-blue-500"
                                  }`}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className={`text-lg font-semibold ${
                                    position.closedBy
                                      ? "text-gray-500"
                                      : "text-gray-900"
                                  } dark:text-gray-400`}
                                >
                                  {position.position}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
  ${
    position.closedBy
      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400"
  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      position.closedBy
                                        ? "bg-gray-500"
                                        : "bg-green-500"
                                    }`}
                                  />
                                  {position.closedBy ? "Closed" : "Active"}
                                </span>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mt-4">
                              <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                  position.closedBy
                                    ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                    : "bg-blue-50 dark:bg-blue-900/20"
                                }`}
                              >
                                <UsersIcon
                                  className={`h-4 w-4 ${
                                    position.closedBy
                                      ? "text-gray-400"
                                      : "text-blue-500"
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span
                                    className={`text-sm font-medium ${
                                      position.closedBy
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                    } dark:text-gray-400`}
                                  >
                                    {position.uploadedCVs?.length || 0}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Candidates
                                  </span>
                                </div>
                              </div>

                              <div
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                  position.closedBy
                                    ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                    : "bg-green-50 dark:bg-green-900/20"
                                }`}
                              >
                                <CheckCircleIcon
                                  className={`h-4 w-4 ${
                                    position.closedBy
                                      ? "text-gray-400"
                                      : "text-green-500"
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span
                                    className={`text-sm font-medium ${
                                      position.closedBy
                                        ? "text-gray-500"
                                        : "text-green-700"
                                    } dark:text-gray-400`}
                                  >
                                    {position.shortlisted?.length || 0}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Shortlisted
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Requirements */}
                            <div className="mt-4 grid grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <ClockIcon className="h-4 w-4 text-gray-400" />
                                  <span
                                    className={`text-sm ${
                                      position.closedBy
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                    } dark:text-gray-400`}
                                  >
                                    {position.experience} Years
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                                  <span
                                    className={`text-sm ${
                                      position.closedBy
                                        ? "text-gray-500"
                                        : "text-gray-600"
                                    } dark:text-gray-400`}
                                  >
                                    ₹{position.salary} LPA
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                                  <span
                                    className={`text-sm ${
                                      position.closedBy
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                    } dark:text-gray-400`}
                                  >
                                    {position.currentLocation}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {position.keywords.map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-full
            ${
              position.closedBy
                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
                                  >
                                    {keyword.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(position.keywords)
                              ? position.keywords
                              : position.keywords.split(",")
                            ).map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 
                        dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full
                        border border-indigo-100 dark:border-indigo-800
                        shadow-sm"
                              >
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {position.experience} Years
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ₹{position.salary} Lakhs
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {position.currentLocation}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {position.noticePeriod} Month(s)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm
                  bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {position.qualification}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(position.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Enhanced Empty State
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-xl">
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 rounded-full bg-blue-50 dark:bg-blue-500/20 animate-pulse">
                  <BriefcaseIcon className="h-16 w-16 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    No Positions Opened Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    You haven't created any recruitment positions yet. Click the
                    "Add New Position" button to get started with your hiring
                    process.
                  </p>
                </div>
                <Button
                  className="mt-4 flex items-center gap-3 px-6 py-3
          bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 
          hover:from-blue-600 hover:via-blue-700 hover:to-blue-600
          text-white font-medium rounded-xl
          transform hover:scale-105 hover:-translate-y-0.5
          transition-all duration-300 ease-out
          shadow-lg hover:shadow-blue-500/30
          border border-blue-400/20"
                  onClick={() => handleRecruitmentModalOpen()}
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Your First Position
                </Button>
              </div>
            </div>
          )}
          {/* Recruits Table */}
          <div className="overflow-hidden rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-10">
            {/* Table Header Section */}

            {/* Table Content */}
            <div className="overflow-hidden rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Table Header Section */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <div>
                    <Typography
                      variant="h6"
                      className="font-bold text-gray-900 dark:text-white"
                    >
                      Recruits List
                    </Typography>
                    <Typography className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      A detailed overview of all recruitment candidates and
                      their current status
                    </Typography>
                  </div>

                  {/* Added Candidates Counter */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-blue-500" />
                        <Typography
                          variant="h6"
                          className="font-bold text-gray-900 dark:text-white"
                        >
                          {positions.reduce(
                            (total, position) =>
                              total + (position.uploadedCVs?.length || 0),
                            0
                          )}
                        </Typography>
                      </div>
                      <Typography className="text-sm text-gray-500 dark:text-gray-400">
                        Total Candidates
                      </Typography>
                    </div>
                    <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <Typography
                          variant="h6"
                          className="font-bold text-gray-900 dark:text-white"
                        >
                          {positions.reduce(
                            (total, position) =>
                              total + (position.shortlisted?.length || 0),
                            0
                          )}
                        </Typography>
                      </div>
                      <Typography className="text-sm text-gray-500 dark:text-gray-400">
                        Shortlisted
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Content */}

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        POSITION DETAILS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        REQUIREMENTS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CANDIDATES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {positions
                      .filter((position) => position.uploadedCVs?.length > 0)
                      .map((position) => (
                        <tr
                          key={position._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              {/* Position Header */}
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2.5 rounded-xl ${
                                    position.closedBy
                                      ? "bg-gray-100 dark:bg-gray-800"
                                      : "bg-blue-50 dark:bg-blue-900/20"
                                  }`}
                                >
                                  <BriefcaseIcon
                                    className={`h-6 w-6 ${
                                      position.closedBy
                                        ? "text-gray-400"
                                        : "text-blue-500"
                                    }`}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span
                                    className={`text-lg font-semibold ${
                                      position.closedBy
                                        ? "text-gray-500"
                                        : "text-gray-900"
                                    } dark:text-gray-400`}
                                  >
                                    {position.position}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
  ${
    position.closedBy
      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400"
  }`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        position.closedBy
                                          ? "bg-gray-500"
                                          : "bg-green-500"
                                      }`}
                                    />
                                    {position.closedBy ? "Closed" : "Active"}
                                  </span>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 mt-4">
                                <div
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                    position.closedBy
                                      ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                      : "bg-blue-50 dark:bg-blue-900/20"
                                  }`}
                                >
                                  <UsersIcon
                                    className={`h-4 w-4 ${
                                      position.closedBy
                                        ? "text-gray-400"
                                        : "text-blue-500"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span
                                      className={`text-sm font-medium ${
                                        position.closedBy
                                          ? "text-gray-500"
                                          : "text-gray-900"
                                      } dark:text-gray-400`}
                                    >
                                      {position.uploadedCVs?.length || 0}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Candidates
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                    position.closedBy
                                      ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                      : "bg-green-50 dark:bg-green-900/20"
                                  }`}
                                >
                                  <CheckCircleIcon
                                    className={`h-4 w-4 ${
                                      position.closedBy
                                        ? "text-gray-400"
                                        : "text-green-500"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span
                                      className={`text-sm font-medium ${
                                        position.closedBy
                                          ? "text-gray-500"
                                          : "text-green-700"
                                      } dark:text-gray-400`}
                                    >
                                      {position.shortlisted?.length || 0}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Shortlisted
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Requirements */}
                              <div className="mt-4 grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-gray-400" />
                                    <span
                                      className={`text-sm ${
                                        position.closedBy
                                          ? "text-gray-500"
                                          : "text-gray-900"
                                      } dark:text-gray-400`}
                                    >
                                      {position.experience} Years
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                                    <span
                                      className={`text-sm ${
                                        position.closedBy
                                          ? "text-gray-500"
                                          : "text-gray-600"
                                      } dark:text-gray-400`}
                                    >
                                      ₹{position.salary} LPA
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                                    <span
                                      className={`text-sm ${
                                        position.closedBy
                                          ? "text-gray-500"
                                          : "text-gray-900"
                                      } dark:text-gray-400`}
                                    >
                                      {position.currentLocation}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
  {(typeof position.keywords === 'string' 
    ? position.keywords.split(',')
    : Array.isArray(position.keywords)
    ? position.keywords
    : []
  ).map((keyword, idx) => (
    <span
      key={idx}
      className={`px-2.5 py-1 text-xs font-medium rounded-full
        ${position.closedBy
          ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        }`}
    >
      {keyword.trim()}
    </span>
  ))}
</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <div>Experience: {position.experience} years</div>
                              <div>Salary: {position.salary} LPA</div>
                              <div>Location: {position.currentLocation}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Array.isArray(position.keywords)
                                  ? position.keywords[0]
                                      .split(",")
                                      .map((keyword, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
                                        >
                                          {keyword.trim()}
                                        </span>
                                      ))
                                  : position.keywords
                                      .split(",")
                                      .map((keyword, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
                                        >
                                          {keyword.trim()}
                                        </span>
                                      ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-4">
                              {position.uploadedCVs.map((cv) => {
                                const isShortlisted =
                                  position.shortlisted?.find(
                                    (s) => s.fileId === cv.fileId
                                  );
                                const isRejected = position.rejected?.find(
                                  (r) => r.fileId === cv.fileId
                                );

                                return (
                                  <div
                                    key={cv.fileId}
                                    className={`flex items-center justify-between p-4 rounded-lg border
        ${
          position.closedBy
            ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75"
            : isShortlisted
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : isRejected
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
        }`}
                                  >
                                    {/* Left side with document info */}
                                    <div className="flex items-center gap-3">
                                      <div
                                        onClick={() =>
                                          !position.closedBy &&
                                          window.open(
                                            cv.webViewLink,
                                            "_blank",
                                            "noopener,noreferrer"
                                          )
                                        }
                                        className={`flex items-center gap-3 ${
                                          position.closedBy
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer group hover:opacity-80"
                                        } transition-opacity duration-200`}
                                      >
                                        <div
                                          className={`p-2 rounded-lg ${
                                            position.closedBy
                                              ? "bg-gray-100 dark:bg-gray-800/50"
                                              : isShortlisted
                                              ? "bg-green-100 dark:bg-green-800/50 group-hover:bg-green-200"
                                              : "bg-gray-100 dark:bg-gray-800/50 group-hover:bg-gray-200"
                                          } transition-colors duration-200`}
                                        >
                                          <DocumentTextIcon
                                            className={`h-5 w-5 ${
                                              position.closedBy
                                                ? "text-gray-400"
                                                : isShortlisted
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-blue-500"
                                            }`}
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <span
                                            className={`text-sm font-medium ${
                                              position.closedBy
                                                ? "text-gray-500 dark:text-gray-400"
                                                : isShortlisted
                                                ? "text-green-700 dark:text-green-400"
                                                : "text-gray-600 dark:text-gray-300"
                                            }`}
                                          >
                                            {cv.originalName}
                                          </span>
                                          {isShortlisted &&
                                            !position.closedBy && (
                                              <span className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                                                <CheckIcon className="h-3 w-3" />
                                                Shortlisted Candidate
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right side with actions - Only show if position is not closed */}
                                    {!position.closedBy && (
                                      <div className="flex items-center gap-3">
                                        {/* Your existing action buttons (Schedule Interview, Shortlist, Reject) */}
                                        {isShortlisted && (
                                          <>
                                            {position.shortlisted.find(
                                              (s) => s.fileId === cv.fileId
                                            )?.isInterviewScheduled ? (
                                              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm text-blue-700 dark:text-blue-400">
                                                  Interview:{" "}
                                                  {formatInterviewDateTime(
                                                    position.shortlisted.find(
                                                      (s) =>
                                                        s.fileId === cv.fileId
                                                    )?.interviewTime
                                                  )}
                                                </span>
                                              </div>
                                            ) : (
                                              <Button
                                                variant="filled"
                                                size="sm"
                                                className="flex items-center gap-2"
                                                onClick={() => {
                                                  setSelectedRecruit({
                                                    id: position._id,
                                                    cv: cv,
                                                    name: cv.originalName,
                                                  });
                                                  setMeetingDate(new Date());
                                                  handleScheduleModalOpen();
                                                }}
                                              >
                                                <CalendarDaysIcon className="h-4 w-4" />
                                                Schedule Interview
                                              </Button>
                                            )}
                                          </>
                                        )}

                                        {!isShortlisted && !isRejected && (
                                          <div className="flex gap-2">
                                            <Button
                                              variant="filled"
                                              color="green"
                                              size="sm"
                                              className="flex items-center gap-1"
                                              onClick={() =>
                                                handleAcceptCandidate(
                                                  position._id,
                                                  cv
                                                )
                                              }
                                            >
                                              <CheckIcon className="h-4 w-4" />
                                              Shortlist
                                            </Button>
                                            <Button
                                              variant="filled"
                                              color="red"
                                              size="sm"
                                              className="flex items-center gap-1"
                                              onClick={() => {
                                                setSelectedCandidate({
                                                  positionId: position._id,
                                                  cv,
                                                });
                                                setOpenRejectDialog(true);
                                              }}
                                            >
                                              <XMarkIcon className="h-4 w-4" />
                                              Reject
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <RejectDialog />
                  <ScheduleInterviewModal
                    isOpen={isScheduleModalOpen}
                    handleOpen={handleScheduleModalOpen}
                    selectedRecruit={selectedRecruit}
                    meetingDate={meetingDate}
                    setMeetingDate={setMeetingDate}
                    onScheduleSuccess={() =>
                      setRefreshTrigger((prev) => prev + 1)
                    } // Add this prop
                  />
                </table>
                {positions.filter(
                  (position) => position.uploadedCVs?.length > 0
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No positions with candidates available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
