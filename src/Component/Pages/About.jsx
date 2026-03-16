import React from 'react';
import { Typography } from '@material-tailwind/react';
import { motion } from 'framer-motion';
import image1 from '../../assets/images/about/WhatsApp Image 2024-12-16 at 3.27.22 PM.jpeg'
import image2 from '../../assets/images/about/WhatsApp Image 2024-12-16 at 3.27.24 PM (1).jpeg'
import image3 from '../../assets/images/about/WhatsApp Image 2024-12-16 at 3.27.24 PM.jpeg'
import image4 from '../../assets/images/about/WhatsApp Image 2024-12-16 at 3.27.25 PM.jpeg'
import image5 from '../../assets/images/about/last.jpeg'
import imagefirst from '../../assets/images/start image/1.jpeg'
import imagetwo from '../../assets/images/start image/2.jpeg'
import imagethree from '../../assets/images/start image/3.jpeg'

function About() {
  const fadeInAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const topServices = [
    {
      title: 'Professional Development',
      description: 'Enhance your skills and knowledge with our tailored professional development programs.',
      buttonText: 'Join Now',
      icon: imagefirst
    },
    {
      title: 'Consulting Services',
      description: 'Our expert consultants provide strategic guidance to help your business thrive.',
      buttonText: 'Get a Quote',
      icon: imagetwo
    },
    {
      title: 'Project Management',
      description: 'Streamline your projects with our efficient project management tools and methodologies.',
      buttonText: 'Learn More',
      icon: imagethree
    }
  ];

  const ServiceSection = ({ title, description, services }) => (
    <div className="mb-20">
      <div className="text-center mb-16">
        <Typography variant="h2" className="text-[#2D3748] text-4xl font-bold mb-4">
          {title}
        </Typography>
        {description && (
          <Typography className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </Typography>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            variants={fadeInAnimation}
            initial="initial"
            animate="animate"
            className="border border-gray-200 rounded-lg p-6 aspect-[4/3] flex flex-col"
          >
            <img
              src={service.icon}
              alt={service.title}
              className=" mb-4"
              style={{ color: '#68D391' }}
            />
            <Typography variant="h5" className="text-[#2D3748] text-xl font-semibold mb-2">
              {service.title}
            </Typography>
            <Typography className="text-gray-600 text-sm leading-relaxed flex-grow">
              {service.description}
            </Typography>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors mt-auto">
              {service.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
             <Typography
        variant="h1"
        className="text-[#2D3748] text-4xl font-bold mb-16 text-center max-w-lg"
      >
        Welcome to Mabicons Solutions
        Your Partner in Success
      </Typography>

        <ServiceSection services={topServices} />

        <ServiceSection
          title="What We Offer"
          description="Welcome to Mabicons ERP, where we redefine the way businesses manage and optimize their workforce. Our integrated HRMS solutions are designed to streamline HR processes, enhance employee engagement, and improve organizational productivity."
          services={[
            {
              title: 'Talent Acquisition',
              description: 'We simplify your recruitment journey with tailored services: Expert CV shortlisting to match your needs, Professional interview assistance, Flexible replacement cycles (30, 60, 90 days) for hires.',
              buttonText: 'Learn More',
              icon: image1 // Placeholder icon, replace as needed
            },
            {
              title: 'HR Generalist Services',
              description: 'From onboarding to employee lifecycle management, we take care of everything: Offer letter and appointment letter generation, Employee code assignments, Structured onboarding and induction programs.',
              buttonText: 'Learn More',
              icon: image5 // Placeholder icon, replace as needed
            },
            {
              title: 'Payroll and Compliance',
              description: 'Ensure your payroll is accurate and compliant with our reliable solutions: Salary structure design and compliance with PF & ESIC regulations, Automated attendance tracking and salary computation, Comprehensive reports for management and regulatory purposes.',
              buttonText: 'Learn More',
              icon: image3 // Placeholder icon, replace as needed
            },
            {
              title: 'Performance Management',
              description: 'Empower your workforce with clear performance metrics: KRA and KPI definition and execution, Daily, monthly, and departmental MIS reports.',
              buttonText: 'Learn More',
              icon: image2 // Placeholder icon, replace as needed
            },
            {
              title: 'People & Cultural Development',
              description: 'Build a positive and thriving workplace culture with our support: Employee engagement and motivation programs, Policy creation and handbook development, Online learning and development sessions.',
              buttonText: 'Learn More',
              icon: image4 // Placeholder icon, replace as needed
            }
          ]}
        />

      </motion.div>
    </div>
  );
}

export default About;