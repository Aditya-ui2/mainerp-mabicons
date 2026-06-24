import React from 'react';
import { Typography } from '@material-tailwind/react';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography className="text-center text-base">
            &copy; {new Date().getFullYear()} Mabicons Technosoft. All rights reserved.
          </Typography>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;