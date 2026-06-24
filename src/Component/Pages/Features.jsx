import React from "react";
import { Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import banner from "../../assets/images/the-words-should-be-pay-role.jpg";
import payroll from "../../assets/images/payroll-attendance-leave-management-performance-tr.jpg";
import core from "../../assets/images/core-features-accounting-crm-project-document.png";
import advanced from "../../assets/images/advanced-tools-custom-reporting-notifications.png";

function Features() {
  const featuresList = [
    {
      title: "Payroll",
      image: payroll,
      items: [
        "Attendance",
        "Leave Management",
        "Performance Tracking",
        "Training & Development",
        "HR Analytics",
      ],
    },
    {
      title: "Core Features",
      image: core,
      items: ["Accounting", "CRM", "Project", "Document"],
    },
    {
      title: "Advanced Tools",
      image: advanced,
      items: ["Custom Reporting", "Notifications", "Mobile App"],
    },
  ];

  return (
    <div className="min-h-screen bg-white px-4 py-16 relative overflow-hidden">
      {/* Decorative Circle */}
      <div className="absolute left-0 bottom-0 w-72 h-72 bg-teal-400/20 rounded-full -translate-x-1/2 translate-y-1/2" />
      <div className="absolute right-0 top-1/2 w-96 h-96 bg-teal-400/20 rounded-full translate-x-1/2 -translate-y-1/2" />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Heading Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              variant="h1"
              className="text-[#2D3748] text-6xl font-bold mb-6"
            >
              Features
            </Typography>
            <Typography className="text-gray-500 max-w-3xl mx-auto text-xl">
              Discover the comprehensive suite of features that make Mabicons HR
              ERP the ultimate solution for your business
            </Typography>
          </motion.div>
        </div>

        {/* Features Dashboard Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-20"
        >
          <img
            src={banner}
            alt="ERP Dashboard"
            className="w-full mx-auto rounded-lg"
            style={{ maxWidth: '100%' }}
          />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          {featuresList.map((section, index) => (
            <Card key={index} title={section.title} image={section.image} items={section.items} />
          ))}
        </motion.div>

        {/* Mobile App Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 text-center"
        >
          {/* Add content if needed */}
        </motion.div>

        {/* Dora AI Watermark */}
      </motion.div>
    </div>
  );
}

const Card = ({ title, image, items }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
        },
      },
    }}
    className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full"
  >
    <img 
      src={image} 
      alt={title} 
      className="w-full h-32 object-cover rounded-t-lg mb-4"
      style={{ maxHeight: '150px', objectFit: 'cover' }}
    />
    <div className="flex items-center mb-4">
      <svg className="w-6 h-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <Typography variant="h5" className="text-[#2D3748] font-semibold">
        {title}
      </Typography>
    </div>
    <ul className="space-y-3">
      {items.map((item, itemIndex) => (
        <li key={itemIndex} className="flex items-center text-gray-600">
          <svg
            className="w-5 h-5 mr-3 text-teal-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2} d="M5 13l4 4L19 7"
            />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);

export default Features;
