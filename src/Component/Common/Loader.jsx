import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullPage = true, text = 'Loading...' }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const dotVariants = {
    initial: {
      y: 0,
      opacity: 0.4,
      scale: 1,
    },
    animate: {
      y: [0, -10, 0],
      opacity: [0.4, 1, 0.4],
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            className="w-4 h-4 rounded-full bg-[#1B4DA0] shadow-[0_0_15px_rgba(27,77,160,0.4)]"
          />
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xs font-black uppercase tracking-[0.2em] text-[#9B9BAD] animate-pulse"
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12 w-full h-full min-h-[200px]">
      {loaderContent}
    </div>
  );
};

export default Loader;
