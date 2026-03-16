import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import toggleSound from '../../assets/sound/20170101-light-switch-on-80675.mp3';
import logo from '../../assets/images/ERP LOGO.png';

const Navbar = ({ activeSection, sectionRefs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <motion.nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md' 
          : 'bg-transparent'
      }`}
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center">
              <img 
                className="h-8 w-auto sm:h-10 object-contain" 
                src={logo} 
                alt="Logo" 
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-2 space-x-4">
            <NavLink onClick={() => scrollToSection(sectionRefs.heroRef)} isActive={activeSection === 'hero'}>Home</NavLink>
            <NavLink onClick={() => scrollToSection(sectionRefs.aboutRef)} isActive={activeSection === 'about'}>About</NavLink>
            <NavLink onClick={() => scrollToSection(sectionRefs.featuresRef)} isActive={activeSection === 'features'}>Features</NavLink>
            <NavLink onClick={() => scrollToSection(sectionRefs.servicesRef)} isActive={activeSection === 'services'}>Services</NavLink>
            <NavLink onClick={() => scrollToSection(sectionRefs.contactRef)} isActive={activeSection === 'contact'}>Contact</NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              to="/login" 
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              LOGIN
            </Link>
            <Link 
              to="/client-login" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              LOGIN AS CLIENT
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="lg:hidden overflow-hidden"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={mobileMenuVariants}
      >
        <div className="px-4 pt-2 pb-3 space-y-2 bg-white dark:bg-gray-900 shadow-lg">
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-2">
            <NavLink mobile onClick={() => scrollToSection(sectionRefs.heroRef)} isActive={activeSection === 'hero'}>Home</NavLink>
            <NavLink mobile onClick={() => scrollToSection(sectionRefs.aboutRef)} isActive={activeSection === 'about'}>About</NavLink>
            <NavLink mobile onClick={() => scrollToSection(sectionRefs.featuresRef)} isActive={activeSection === 'features'}>Features</NavLink>
            <NavLink mobile onClick={() => scrollToSection(sectionRefs.servicesRef)} isActive={activeSection === 'services'}>Services</NavLink>
            <NavLink mobile onClick={() => scrollToSection(sectionRefs.contactRef)} isActive={activeSection === 'contact'}>Contact</NavLink>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/login" 
              className="block w-full text-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              LOGIN
            </Link>
            <Link 
              to="/client-login" 
              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              LOGIN AS CLIENT
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}

const NavLink = ({ onClick, children, isActive, mobile }) => (
  <motion.div
    whileHover={{ scale: mobile ? 1 : 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <button 
      onClick={onClick}
      className={`
        w-full text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md
        ${isActive 
          ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30' 
          : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
        }
        ${mobile ? 'text-left' : ''}
      `}
    >
      {children}
    </button>
  </motion.div>
);

export default Navbar;