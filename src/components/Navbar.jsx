import React from "react";
import {
  Navbar,
  Typography,
  IconButton,
  Button,
  Avatar,
  MenuHandler,
  MenuList,
  MenuItem,
  Menu,
  Badge,
  Dialog,
  DialogHeader,
  DialogBody,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  PowerIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const NotificationItem = ({ title, message, time, isNew }) => (
  <div className={`p-4 ${isNew ? 'bg-blue-50/80 dark:bg-blue-900/30' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/70 cursor-pointer transition-all duration-300 border-l-4 ${isNew ? 'border-blue-500' : 'border-transparent'}`}>
    <div className="flex items-center justify-between mb-1">
      <Typography variant="small" className="font-semibold dark:text-white">
        {title}
      </Typography>
      <Typography variant="small" className="text-blue-gray-500 dark:text-blue-gray-400 text-xs">
        {time}
      </Typography>
    </div>
    <Typography variant="small" className="text-blue-gray-500 dark:text-blue-gray-400">
      {message}
    </Typography>
  </div>
);

const NotificationBadge = ({ icon: Icon, count }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const notifications = [
    {
      id: 1,
      title: "New Task Assigned",
      message: "You have been assigned a new task: Project Review",
      time: "5 min ago",
      isNew: true
    },
    {
      id: 2,
      title: "Meeting Reminder",
      message: "Team meeting starts in 30 minutes",
      time: "30 min ago",
      isNew: true
    },
    {
      id: 3,
      title: "Document Updated",
      message: "Project documentation has been updated",
      time: "2 hours ago",
      isNew: false
    },
    {
      id: 4,
      title: "Task Completed",
      message: "Website redesign task has been marked as complete",
      time: "1 day ago",
      isNew: false
    }
  ];

  return (
    <>
      <Badge content={count} className="bg-red-500">
        <IconButton
          variant="text"
          className="text-blue-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-white"
          onClick={() => setIsOpen(true)}
        >
          <Icon className="h-5 w-5" />
        </IconButton>
      </Badge>

      <Dialog
        open={isOpen}
        handler={setIsOpen}
        className="dark:bg-gray-900"
        size="sm"
        animate={{
          mount: { scale: 1, opacity: 1 },
          unmount: { scale: 0.9, opacity: 0 },
        }}
      >
        <DialogHeader className="border-b border-blue-gray-100 dark:border-blue-gray-800">
          <div className="flex items-center justify-between w-full">
            <Typography variant="h6" className="dark:text-white">
              Notifications
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="text"
                size="sm"
                className="text-blue-500 dark:text-blue-400"
                onClick={() => console.log('Mark all as read')}
              >
                Mark all as read
              </Button>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="p-0 overflow-y-auto max-h-[400px] divide-y divide-blue-gray-100 dark:divide-blue-gray-800">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              isNew={notification.isNew}
            />
          ))}
        </DialogBody>
      </Dialog>
    </>
  );
};

const ProfileMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    {
      label: "My Profile",
      icon: UserCircleIcon,
      onClick: () => console.log("Profile clicked"),
    },
    {
      label: "Settings",
      icon: Cog6ToothIcon,
      onClick: () => console.log("Settings clicked"),
    },
    {
      label: "Sign Out",
      icon: PowerIcon,
      onClick: () => console.log("Sign out clicked"),
      color: "red",
    },
  ];

  return (
    // <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
    //   <MenuHandler>
    //     <Button
    //       variant="text"
    //       className="flex items-center gap-2 rounded-full py-2 px-4 hover:bg-blue-gray-50/50 dark:hover:bg-blue-gray-800/50 transition-all duration-300 shadow-sm hover:shadow-md"
    //     >
    //       <Avatar
    //         variant="circular"
    //         size="sm"
    //         alt="John Doe"
    //         className="border-2 border-blue-500 p-0.5 ring-2 ring-offset-2 ring-blue-500/20"
    //         src="https://docs.material-tailwind.com/img/face-2.jpg"
    //       />
    //       <div className="flex flex-col items-start">
    //         <Typography variant="small" className="font-medium text-blue-gray-900 dark:text-white">
    //           John Doe
    //         </Typography>
    //         <Typography variant="small" className="text-xs font-normal text-blue-gray-500 dark:text-blue-gray-400">
    //           Customer
    //         </Typography>
    //       </div>
    //       <ChevronDownIcon
    //         strokeWidth={2.5}
    //         className={`h-3 w-3 transition-transform dark:text-white ${
    //           isMenuOpen ? "rotate-180" : ""
    //         }`}
    //       />
    //     </Button>
    //   </MenuHandler>
    //   <MenuList className="p-1 dark:bg-gray-900 dark:border-gray-800 shadow-xl">
    //     {menuItems.map(({ label, icon: Icon, onClick, color }) => (
    //       <MenuItem
    //         key={label}
    //         onClick={onClick}
    //         className={`flex items-center gap-2 rounded hover:bg-blue-gray-50/50 dark:hover:bg-blue-gray-800/50 ${
    //           color ? `text-${color}-500` : "dark:text-white"
    //         }`}
    //       >
    //         <Icon className={`h-4 w-4 ${color ? `text-${color}-500` : "dark:text-white"}`} />
    //         <Typography
    //           variant="small"
    //           className="font-normal"
    //         >
    //           {label}
    //         </Typography>
    //       </MenuItem>
    //     ))}
    //   </MenuList>
    // </Menu>
    <></>
  );
};

const RocketLogo = () => {
  const logoVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    animate: {
      y: [-2, 2],
      rotate: [0, 5, -5],
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.5,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        }
      }
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 cursor-pointer"
      whileHover="hover"
      variants={logoVariants}
    >
      <motion.div
        variants={iconVariants}
        animate="animate"
        className="text-2xl"
      >
        ⚡
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2"
      >
        <Typography
          as="span"
          variant="h5"
          className="font-bold dark:text-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"
        >
          MABICONS
        </Typography>
        <Typography
          as="span"
          variant="h6"
          className="font-normal text-blue-gray-600 dark:text-blue-gray-400"
        >
          ERP
        </Typography>
      </motion.div>
    </motion.div>
  );
};

export function NavbarWithSearch({ onProfileClick, companyName }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('department');
    localStorage.removeItem('recruitmentTabAuth');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300">
              <img
                // src={Logo} 
                src="http://www.mabicons.com/wp-content/uploads/2023/11/cropped-logo-1a-1.png"
                alt="ERP Logo"
                className="h-8 w-auto sm:h-10 object-contain filter drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
              />
            </div>
          </div>

          {/* Center section - Company Name (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="relative group">
              <Typography
                variant="h4"
                className={`font-bold ${darkMode ? 'text-white' : 'text-black'} transition-all duration-300`}
              >
                {companyName}
              </Typography>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Right section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <IconButton
              variant="text"
              color="blue-gray"
              className="hover:bg-blue-gray-50/50 dark:hover:bg-blue-gray-800/50 transition-all duration-300"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-500 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <MoonIcon className="h-5 w-5 dark:text-white hover:rotate-90 transition-transform duration-300" />
              )}
            </IconButton>

            <div className="border-l border-blue-gray-100 dark:border-blue-gray-800 h-8 mx-2" />

            <ProfileMenu />

            <IconButton
              variant="text"
              className="rounded-full dark:text-white hover:bg-blue-gray-50/50 dark:hover:bg-blue-gray-800/50 transition-all duration-300"
              onClick={onProfileClick}
            >
              <UserCircleIcon className="h-6 w-6" />
            </IconButton>

            <IconButton
              variant="text"
              className="rounded-full text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/30 transition-all duration-300"
              onClick={handleLogout}
            >
              <PowerIcon className="h-6 w-6" />
            </IconButton>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <IconButton
              variant="text"
              className="ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {!isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </IconButton>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800"
            >
              {/* Company Name (mobile) */}
              <div className="py-4 text-center">
                <Typography
                  variant="h5"
                  className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}
                >
                  {companyName}
                </Typography>
              </div>

              {/* Mobile menu items */}
              <div className="flex flex-col space-y-4 px-4 pb-4">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {darkMode ? (
                    <>
                      <SunIcon className="h-5 w-5 text-yellow-500" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onProfileClick}
                  className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors duration-200"
                >
                  <PowerIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

