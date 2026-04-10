import React, { useState } from 'react';
import { Typography, Dialog, DialogHeader, DialogBody, DialogFooter, Button } from '@material-tailwind/react';
import { motion } from 'framer-motion';
import s1 from '../../assets/images/service/ic4 (4).jpeg';
import s2 from '../../assets/images/service/ic4 (3).jpeg';
import s3 from '../../assets/images/service/ic4 (2).jpeg';
import s4 from '../../assets/images/service/ic4 (1).jpeg';
import s5 from '../../assets/images/service/ic4 (5).jpeg';
import s6 from '../../assets/images/service/ic4 (6).jpeg';
import s7 from '../../assets/images/service/2-last.jpeg';
import s8 from '../../assets/images/service/last.jpeg';

const icons = {
  erp: (
    <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  automation: (
    <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  integration: (
    <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
};

const services = [
  {
    title: 'Core ERP Solutions',
    description: 'Comprehensive enterprise resource planning system that integrates all core business processes.',
    icon: icons.erp,
    image: s1,
    details: {
      features: [
        'Real-time business analytics',
        'Integrated modules for finance, HR, and operations',
        'Customizable workflows',
        'Automated reporting systems',
        'Multi-location support'
      ],
      benefits: [
        'Increased operational efficiency',
        'Reduced operational costs',
        'Improved data accuracy',
        'Better decision-making capabilities',
        'Enhanced productivity'
      ]
    }
  },
  {
    title: 'Process Automation',
    description: 'Streamline your business processes with intelligent automation solutions.',
    icon: icons.automation,
    image: s2,
    details: {
      features: [
        'Workflow automation',
        'Document processing',
        'Task scheduling',
        'Process monitoring',
        'Integration capabilities'
      ],
      benefits: [
        'Reduced manual work',
        'Minimized errors',
        'Faster processing times',
        'Improved compliance',
        'Cost savings'
      ]
    }
  },
  {
    title: 'System Integration',
    description: 'Seamlessly connect all your business applications and data sources.',
    icon: icons.integration,
    image: s3,
    details: {
      features: [
        'API integration',
        'Data synchronization',
        'Legacy system support',
        'Real-time updates',
        'Secure data transfer'
      ],
      benefits: [
        'Unified data access',
        'Streamlined operations',
        'Enhanced collaboration',
        'Improved data consistency',
        'Better system reliability'
      ]
    }
  },
  {
    title: 'Talent Acquisition',
    description: 'We simplify your recruitment journey with tailored services.',
    icon: icons.erp,
    image: s4,
    details: {
      features: [
        'Expert CV shortlisting to match your needs',
        'Professional interview assistance',
        'Flexible replacement cycles (30, 60, 90 days) for hires'
      ],
      benefits: [
        'Streamlined recruitment process',
        'Improved candidate quality',
        'Reduced time-to-hire'
      ]
    }
  },
  {
    title: 'HR Generalist Services',
    description: 'From onboarding to employee lifecycle management, we take care of everything.',
    icon: icons.erp,
    image: s6,
    details: {
      features: [
        'Offer letter and appointment letter generation',
        'Employee code assignments',
        'Structured onboarding and induction programs'
      ],
      benefits: [
        'Enhanced employee experience',
        'Improved retention rates',
        'Efficient HR operations'
      ]
    }
  },
  {
    title: 'Payroll and Compliance',
    description: 'Ensure your payroll is accurate and compliant with our reliable solutions.',
    icon: icons.erp,
    image: s5,
    details: {
      features: [
        'Salary structure design and compliance with PF & ESIC regulations',
        'Automated attendance tracking and salary computation',
        'Comprehensive reports for management and regulatory purposes'
      ],
      benefits: [
        'Accurate payroll processing',
        'Reduced compliance risks',
        'Time savings for HR teams'
      ]
    }
  },
  {
    title: 'Performance Management',
    description: 'Empower your workforce with clear performance metrics.',
    icon: icons.erp,
    image: s7,
    details: {
      features: [
        'KRA and KPI definition and execution',
        'Daily, monthly, and departmental MIS reports'
      ],
      benefits: [
        'Improved employee performance',
        'Clear accountability',
        'Data-driven decision making'
      ]
    }
  },
  {
    title: 'People & Cultural Development',
    description: 'Build a positive and thriving workplace culture with our support.',
    icon: icons.erp,
    image: s8,
    details: {
      features: [
        'Employee engagement and motivation programs',
        'Policy creation and handbook development',
        'Online learning and development sessions'
      ],
      benefits: [
        'Enhanced workplace culture',
        'Increased employee satisfaction',
        'Continuous learning opportunities'
      ]
    }
  }
];

function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <motion.div 
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Main Heading Section */}
        <div className="relative mb-24">
          {/* Background decorative elements */}
          <div className="absolute -left-4 -top-4 w-20 h-20 bg-gray-100 rounded-lg -z-10"></div>
          <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-gray-200 rounded-full -z-10"></div>
          
          {/* Main heading content */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Typography 
              variant="h1" 
              className="text-[#2D3748] text-6xl font-bold mb-2"
            >
              Our Services
            </Typography>
            <motion.div 
              className="w-20 h-1 bg-[#2D3748]"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            ></motion.div>
          </motion.div>
        </div>

        {/* Enterprise Solutions Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Typography variant="h2" className="text-[#2D3748] text-4xl font-bold mb-4">
            Enterprise Solutions
          </Typography>
          <Typography className="text-gray-600 max-w-2xl mx-auto">
            Transforming businesses with cutting-edge ERP solutions
          </Typography>
        </motion.div>

        {/* Rest of your services grid and modal code remains the same */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleOpenModal(service)}
            >
              <div className="w-full h-48 relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <Typography variant="h5" className="text-[#2D3748] text-xl font-semibold mb-2">
                  {service.title}
                </Typography>
                <Typography className="text-gray-600 text-sm leading-relaxed flex-grow">
                  {service.description}
                </Typography>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors mt-4 flex items-center gap-2">
                  Learn More
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <Dialog size="xl" open={isModalOpen} handler={() => setIsModalOpen(false)}>
          {selectedService ? (
            <>
              <DialogHeader className="flex items-center gap-3">
                <div className="text-gray-600">
                  {selectedService.icon}
                </div>
                <Typography variant="h4">
                  {selectedService.title}
                </Typography>
              </DialogHeader>
              <DialogBody divider className="h-[40rem] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Typography variant="h5" color="blue-gray" className="mb-4">
                      Key Features
                    </Typography>
                    <ul className="list-disc pl-6 space-y-3">
                      {selectedService.details.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-gray-600"
                        >
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Typography variant="h5" color="blue-gray" className="mb-4">
                      Benefits
                    </Typography>
                    <ul className="list-disc pl-6 space-y-3">
                      {selectedService.details.benefits.map((benefit, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-gray-600"
                        >
                          {benefit}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="text" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Get Started
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div />
          )}
        </Dialog>
      </motion.div>
    </div>
  );
}

export default Services;