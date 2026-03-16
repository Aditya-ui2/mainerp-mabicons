import React, { useEffect, useRef, useState } from 'react';
import { Typography, Button } from '@material-tailwind/react';
import * as THREE from 'three';
import heroImage from '../../assets/images/hero.svg';
import { Dialog, Card, CardBody, CardFooter, Input, Textarea } from "@material-tailwind/react";
import { motion, AnimatePresence } from "framer-motion";

function Hero() {
  const canvasRef = useRef(null);
  const starsRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.z = 1;

    // Create star field
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      size: 0.005,
      vertexColors: true,
    });

    const starVertices = [];
    const starColors = [];
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = Math.random() * 10 - 5;
      starVertices.push(x, y, z);

      // Initial color (black)
      starColors.push(0, 0, 0);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      const positions = starGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += 0.01;
        if (positions[i + 2] > 5) {
          positions[i + 2] = -5;
        }
      }
      starGeometry.attributes.position.needsUpdate = true;

      stars.rotation.z += 0.0002;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Theme change handler
    const handleThemeChange = (e) => {
      const isDarkMode = e.matches;
      const starColors = starsRef.current.geometry.attributes.color.array;
      for (let i = 0; i < starColors.length; i += 3) {
        const color = isDarkMode ? 1 : 0; // 1 for white in dark mode, 0 for black in light mode
        starColors[i] = starColors[i + 1] = starColors[i + 2] = color;
      }
      starsRef.current.geometry.attributes.color.needsUpdate = true;
    };

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(handleThemeChange);
    handleThemeChange(darkModeMediaQuery);

    return () => {
      window.removeEventListener('resize', handleResize);
      darkModeMediaQuery.removeListener(handleThemeChange);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: ''
    });
  };

  // Add this function to handle smooth scrolling
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-800 dark:text-gray-200 py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-70" />
      <div className="max-w-7xl mx-auto relative z-10 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-center mb-10">
              <Typography 
                variant="h1" 
                className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
              >
                Revolutionize<br></br> your organization<br></br> with our user-friendly ERP
              </Typography>
              <Typography 
                variant="h2" 
                className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
              >
                for<br></br> MSME & Startups
              </Typography>
              <Typography 
                variant="lead" 
                className="text-base text-gray-600 dark:text-gray-300"
              >
                Unlock Efficiency and Growth with Our Comprehensive HR ERP Solution, Tailored for Modern Workforces.
              </Typography>
            </div>
            <div className="flex flex-row space-x-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gray-800 text-white dark:bg-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-100"
                onClick={() => setIsModalOpen(true)}
              >
                Request a Demo
              </Button>
              <Button 
                size="lg" 
                variant="outlined" 
                className="border-gray-800 text-gray-800 dark:border-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                onClick={scrollToFeatures}
              >
                Explore Features
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={heroImage}
              alt="ERP Solution"
              className="w-4/5 h-auto mx-auto"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Dialog
            size="md"
            open={isModalOpen}
            handler={() => setIsModalOpen(false)}
            className="bg-transparent shadow-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="mx-auto w-full max-w-[24rem] bg-white dark:bg-gray-800">
                <CardBody className="flex flex-col gap-4">
                  <Typography variant="h4" color="blue-gray" className="mb-2 dark:text-white">
                    Request a Demo
                  </Typography>
                  <Typography className="text-sm text-gray-600 dark:text-gray-300">
                    Fill out the form below and we'll get back to you shortly.
                  </Typography>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                      label="Full Name"
                      size="lg"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="dark:text-white"
                    />
                    <Input
                      type="email"
                      label="Email"
                      size="lg"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="dark:text-white"
                    />
                    <Input
                      label="Company Name"
                      size="lg"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      required
                      className="dark:text-white"
                    />
                    <Input
                      type="tel"
                      label="Phone Number"
                      size="lg"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                      className="dark:text-white"
                    />
                    <Textarea
                      label="Message"
                      size="lg"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="dark:text-white"
                    />
                    <CardFooter className="pt-0 flex gap-2">
                      <Button
                        variant="gradient"
                        type="submit"
                        fullWidth
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Submit Request
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setIsModalOpen(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </CardFooter>
                  </form>
                </CardBody>
              </Card>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Hero;
