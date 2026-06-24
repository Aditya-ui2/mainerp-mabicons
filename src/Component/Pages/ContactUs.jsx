import React from 'react';
import { Typography } from '@material-tailwind/react';
import { motion } from 'framer-motion';

const contactInfo = [
  {
    title: "Email",
    value: "erpmabicons@gmail.com",
    link: "mailto:erpmabicons@gmail.com",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Phone",
    value: "+91 9983807331",
    link: "tel:+919983807331",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
  },
  {
    title: "Location",
    value: "09, opposite Sunny Trade Centre, Gangaram Nagar, New Aatish Market, RHB Colony, Mansarovar, Jaipur, Rajasthan 302020",
    link: "https://maps.google.com/?q=09,+opposite+Sunny+Trade+Centre,+Gangaram+Nagar,+New+Aatish+Market,+RHB+Colony,+Mansarovar,+Jaipur,+Rajasthan+302020",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <Typography variant="h1" className="text-[#2D3748] text-5xl md:text-6xl font-bold mb-4">
            Get In Touch
          </Typography>
          <Typography className="text-gray-600 text-lg max-w-2xl mx-auto">
            We'd love to hear from you. Reach out to us through any of these channels.
          </Typography>
        </motion.div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactInfo.map((info, index) => (
            <motion.a
              href={info.link}
              target={info.title === "Location" ? "_blank" : "_self"}
              rel="noopener noreferrer"
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* Icon Header */}
                <div className={`bg-gradient-to-r ${info.color} p-6 flex justify-center`}>
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    {info.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 text-center">
                  <Typography variant="h5" className="text-[#2D3748] font-bold mb-3">
                    {info.title}
                  </Typography>
                  <Typography className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                    {info.value}
                  </Typography>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Additional CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <Typography variant="h4" className="text-[#2D3748] font-bold mb-3">
              We're Here to Help
            </Typography>
            <Typography className="text-gray-600">
              Our team is available Monday to Saturday, 9:00 AM to 6:00 PM IST.
              We typically respond within 24 hours.
            </Typography>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ContactUs;