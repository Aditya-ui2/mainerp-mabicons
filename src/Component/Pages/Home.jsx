import React, { useEffect, useState, useRef } from 'react'
import Hero from '../Utilities/Hero'
import Navbar from '../Utilities/Navbar'
import About from './About'
import Services from './services'
import ContactUs from './ContactUs'
import Footer from '../Utilities/Footer'
import Features from './Features'
import useInView from '../Utilities/useInView'

const Home = () => {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);

  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = [heroRef, aboutRef, featuresRef, servicesRef, contactRef];
      sections.forEach((ref) => {
        if (ref.current && ref.current.getBoundingClientRect().top < window.innerHeight / 2) {
          setActiveSection(ref.current.dataset.section);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='w-screen h-screen'>
      <Navbar activeSection={activeSection} sectionRefs={{ heroRef, aboutRef, featuresRef, servicesRef, contactRef }} />
      <div ref={heroRef} data-section="hero"><Hero /></div>
      <div ref={aboutRef} data-section="about"><About /></div>
      <div ref={featuresRef} data-section="features"><Features /></div>
      <div ref={servicesRef} data-section="services"><Services /></div>
      <div ref={contactRef} data-section="contact"><ContactUs /></div>
      <Footer />
    </div>
  )
}

export default Home