import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Input, Button } from "@material-tailwind/react";
import { clientSignup } from './service/api';

const Particle = ({ x, y, size, color, duration }) => (
  <motion.div
    className={`absolute rounded-full ${size} ${color}`}
    style={{ x, y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      y: y + 200,
      scale: [0, 1, 0.5]
    }}
    transition={{ duration, repeat: Infinity, repeatDelay: Math.random() * 2 }}
  />
);

const Planet = () => {
  const orbitAnimation = useAnimation();

  useEffect(() => {
    orbitAnimation.start({
      rotate: 360,
      transition: { duration: 200, repeat: Infinity, ease: "linear" }
    });
  }, [orbitAnimation]);

  return (
    <motion.div
      className="relative w-80 h-80"
      animate={orbitAnimation}
    >
      <motion.div
        className="absolute inset-0 bg-purple-500 rounded-full shadow-lg"
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 20px rgba(147, 51, 234, 0.5)',
            '0 0 40px rgba(147, 51, 234, 0.7)',
            '0 0 20px rgba(147, 51, 234, 0.5)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-2 bg-purple-300 rounded-full opacity-30" />
        <div className="absolute inset-4 bg-purple-200 rounded-full opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-900 rounded-full opacity-50" />
      </motion.div>
      
      {/* Orbiting satellites */}
      {[
        { size: 'w-8 h-8', orbitSize: 180, duration: 18, color: 'bg-green-300' },
        { size: 'w-6 h-6', orbitSize: 150, duration: 15, color: 'bg-yellow-300' },
        { size: 'w-4 h-4', orbitSize: 120, duration: 12, color: 'bg-red-300' },
      ].map((satellite, i) => (
        <motion.div
          key={i}
          className={`absolute ${satellite.size} ${satellite.color} rounded-full shadow-md`}
          animate={{
            rotate: 360,
            x: Math.cos(i * (Math.PI * 2 / 3)) * satellite.orbitSize,
            y: Math.sin(i * (Math.PI * 2 / 3)) * satellite.orbitSize,
          }}
          transition={{ duration: satellite.duration, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full opacity-80" />
        </motion.div>
      ))}

      {/* Orbiting rings */}
      {[180, 150, 120].map((size, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute rounded-full border border-purple-400 opacity-20"
          style={{
            width: size * 2,
            height: size * 2,
            left: -size,
            top: -size,
          }}
        />
      ))}
    </motion.div>
  );
};

const Star = ({ x, y, size }) => (
  <motion.div
    className={`absolute rounded-full bg-white ${size}`}
    style={{ x, y }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
    }}
    transition={{
      duration: 2 + Math.random() * 3,
      repeat: Infinity,
      repeatType: "reverse",
    }}
  />
);

const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = [...Array(150)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() > 0.95 ? 'w-1.5 h-1.5' : Math.random() > 0.8 ? 'w-1 h-1' : 'w-0.5 h-0.5',
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <Star key={i} {...star} />
      ))}
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    corporateAddress: '',
    contactNumber: '',
    gstNumber: '',
    panNumber: '',
    numberOfCompanies: '',
    authorizedSignatory: {
      name: '',
      email: '',
      contact: ''
    },
    ownerDirectorDetails: [
      {
        name: '',
        email: '',
        contact: ''
      }
    ],
    website: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleOwnerDirectorChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ownerDirectorDetails: prev.ownerDirectorDetails.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addOwnerDirector = () => {
    setFormData(prev => ({
      ...prev,
      ownerDirectorDetails: [
        ...prev.ownerDirectorDetails,
        { name: '', email: '', contact: '' }
      ]
    }));
  };

  const removeOwnerDirector = (index) => {
    setFormData(prev => ({
      ...prev,
      ownerDirectorDetails: prev.ownerDirectorDetails.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage("Preparing for liftoff! 🚀");
    setShowToast(true);

    try {
      const response = await clientSignup(formData);
      console.log('Signup response:', response);
      
      if (response.data) {
        // Store the entire response data including client.id
        localStorage.setItem('userData', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'client');
        
        console.log('Data saved to localStorage:', {
          userData: response.data,
          token: response.data.token,
          userType: 'client'
        });

        setToastMessage("Welcome aboard, space explorer! 🎉");
        
        // Navigate to document upload
        setTimeout(() => {
          setShowToast(false);
          navigate('/document-upload', { replace: true });
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setToastMessage(error.message || "Houston, we have a problem! 🛑");
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <>
            <h3 className="text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                type="text"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-gray-700 text-white"
                required
              />
              <Input
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-700 text-white"
                required
              />
              <Input
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-gray-700 text-white"
                required
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-white mb-4">Company Details</h3>
            <div className="space-y-4">
              <Input
                type="text"
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-gray-700 text-white"
              />
              <Input
                type="text"
                label="Corporate Address"
                name="corporateAddress"
                value={formData.corporateAddress}
                onChange={handleChange}
                className="bg-gray-700 text-white"
              />
              <Input
                type="tel"
                label="Contact Number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="bg-gray-700 text-white"
              />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className="text-white mb-4">Legal Information</h3>
            <div className="space-y-4">
              <Input
                type="text"
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="bg-gray-700 text-white"
              />
              <Input
                type="text"
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className="bg-gray-700 text-white"
              />
              <Input
                type="number"
                label="Number of Companies"
                name="numberOfCompanies"
                value={formData.numberOfCompanies}
                onChange={handleChange}
                className="bg-gray-700 text-white"
              />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="text-white mb-4">Authorized Signatory</h3>
            <div className="space-y-4">
              <Input
                type="text"
                label="Name"
                value={formData.authorizedSignatory.name}
                onChange={(e) => handleNestedChange('authorizedSignatory', 'name', e.target.value)}
                className="bg-gray-700 text-white"
              />
              <Input
                type="email"
                label="Email"
                value={formData.authorizedSignatory.email}
                onChange={(e) => handleNestedChange('authorizedSignatory', 'email', e.target.value)}
                className="bg-gray-700 text-white"
              />
              <Input
                type="tel"
                label="Contact"
                value={formData.authorizedSignatory.contact}
                onChange={(e) => handleNestedChange('authorizedSignatory', 'contact', e.target.value)}
                className="bg-gray-700 text-white"
              />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h3 className="text-white mb-4">Owner/Director Details</h3>
            {formData.ownerDirectorDetails.map((director, index) => (
              <div key={index} className="space-y-4 mb-6 p-4 border border-gray-700 rounded">
                <div className="flex justify-between items-center">
                  <h4 className="text-white">Owner/Director {index + 1}</h4>
                  {formData.ownerDirectorDetails.length > 1 && (
                    <Button
                      onClick={() => removeOwnerDirector(index)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Input
                  type="text"
                  label="Name"
                  value={director.name}
                  onChange={(e) => handleOwnerDirectorChange(index, 'name', e.target.value)}
                  className="bg-gray-700 text-white"
                />
                <Input
                  type="email"
                  label="Email"
                  value={director.email}
                  onChange={(e) => handleOwnerDirectorChange(index, 'email', e.target.value)}
                  className="bg-gray-700 text-white"
                />
                <Input
                  type="tel"
                  label="Contact"
                  value={director.contact}
                  onChange={(e) => handleOwnerDirectorChange(index, 'contact', e.target.value)}
                  className="bg-gray-700 text-white"
                />
              </div>
            ))}
            <Button
              onClick={addOwnerDirector}
              className="bg-gray-600 hover:bg-gray-700 text-white w-full mt-4"
            >
              Add Another Owner/Director
            </Button>
          </>
        );
      case 6:
        return (
          <>
            <h3 className="text-white mb-4">Website Information</h3>
            <div className="space-y-4">
              <Input
                type="url"
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="bg-gray-700 text-white"
                placeholder="https://example.com"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left half - Planet Animation */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80')] bg-cover bg-center opacity-10" />
        <Starfield />
        <Planet />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center text-white"
        >
          <h1 className="text-4xl font-bold mb-4">Join Our Universe</h1>
          <p className="text-xl">Sign up to start your interstellar journey!</p>
        </motion.div>
      </div>

      {/* Right half - Sign up form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-900 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl px-8 pt-8 pb-8 max-h-[80vh] overflow-y-auto 
            scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700 
            hover:scrollbar-thumb-purple-400 scrollbar-thumb-rounded-full">
            <h2 className="text-4xl font-bold text-center text-white mb-6">Create Account</h2>
            <p className="text-center text-gray-400 mb-8 text-lg">Step {currentStep} of 6</p>
            
            <div className="space-y-6">
              {renderFormStep()}
            </div>

            <div className="flex justify-between mt-6 sticky bottom-0 bg-gray-800 pt-4">
              {currentStep > 1 && (
                <Button
                  onClick={prevStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Previous
                </Button>
              )}
              {currentStep < 6 ? (
                <Button
                  onClick={nextStep}
                  className="bg-purple-500 hover:bg-purple-600 text-white ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-purple-500 hover:bg-purple-600 text-white ml-auto"
                >
                  Launch 🚀
                </Button>
              )}
            </div>

            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-500 hover:text-purple-600 transition duration-300">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
      
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

const Toast = ({ message, isVisible, onClose }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50"
      >
        <p>{message}</p>
        <Rocket />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3 }}
          onAnimationComplete={onClose}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

const Rocket = () => (
  <motion.div
    className="w-12 h-24 mx-auto mt-2"
    initial={{ y: 16 }}
    animate={{ y: -16 }}
    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
  >
    <svg width="100%" height="100%" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rocket body */}
      <path d="M50 0L80 120H20L50 0Z" fill="#D1D5DB"/>
      <path d="M50 0L65 120H35L50 0Z" fill="#F3F4F6"/>
      
      {/* Windows */}
      <circle cx="50" cy="50" r="10" fill="#8B5CF6"/>
      <circle cx="50" cy="80" r="8" fill="#8B5CF6"/>
      
      {/* Fins */}
      <path d="M20 120L0 180V120H20Z" fill="#9CA3AF"/>
      <path d="M80 120L100 180V120H80Z" fill="#9CA3AF"/>
      
      {/* Flame */}
      <motion.path
        d="M30 120C30 150 50 160 50 180C50 160 70 150 70 120H30Z"
        fill="#FCD34D"
        initial={{ scaleY: 0.8, y: 0 }}
        animate={{ scaleY: 1.2, y: 10 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d="M40 120C40 140 50 150 50 160C50 150 60 140 60 120H40Z"
        fill="#F59E0B"
        initial={{ scaleY: 0.8, y: 0 }}
        animate={{ scaleY: 1.2, y: 5 }}
        transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
      />
    </svg>
  </motion.div>
);

export default SignUp;