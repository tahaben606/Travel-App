"use client"

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCheck, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import { FaQuoteLeft, FaStar, FaCompass, FaBookOpen, FaSuitcase, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import PillNav from '../components/PillNav';
import '../styles/landing.css';

// Logo placeholder
const logo = 'https://via.placeholder.com/40x40/00BCD4/FFFFFF?text=TJ';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("features")
  const [hoveredPin, setHoveredPin] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(scrollPercent)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setEmailSubmitted(true)
      setTimeout(() => {
        setEmailSubmitted(false)
        setEmail("")
      }, 3000)
    }
  }

  const features = [
    {
      title: "Map Your Journey",
      desc: "Add markers, routes & GPS tracking",
      color: "#FFD166",
      icon: () => <span className="text-3xl">📍</span>,
    },
    {
      title: "Capture Moments",
      desc: "Upload photos & notes with location tags",
      color: "#06D6A0",
      icon: () => <span className="text-3xl">📸</span>,
    },
    {
      title: "Story Timeline",
      desc: "Visual day-by-day adventure log",
      color: "#FF9E6D",
      icon: () => <span className="text-3xl">📅</span>,
    },
    {
      title: "Packing Lists",
      desc: "Track essentials & local discoveries",
      color: "#7B68EE",
      icon: () => <span className="text-3xl">🧳</span>,
    },
  ]

  const testimonials = [
    {
      name: "Maya Rodriguez",
      role: "Travel Blogger",
      text: "This app transformed how I document trips! The timeline feature is genius.",
      avatar: "MR",
      color: "#FFD166",
    },
    {
      name: "Alex Chen",
      role: "Adventure Photographer",
      text: "As a solo traveler, this journal helps organize memories perfectly.",
      avatar: "AC",
      color: "#06D6A0",
    },
    {
      name: "Sam Wilson",
      role: "Digital Nomad",
      text: "My Japan travel journal is my most prized digital possession!",
      avatar: "SW",
      color: "#7B68EE",
    },
  ]

  const pricingPlans = [
    {
      name: "Wanderer",
      price: "$0",
      period: "forever",
      features: ["3 Travel Stories", "Basic Maps", "50 Photos/Month"],
      cta: "Get Started",
      popular: false,
      color: "#06D6A0",
    },
    {
      name: "Explorer",
      price: "$4.99",
      period: "per month",
      features: ["Unlimited Stories", "Advanced Maps", "Cloud Sync", "Priority Support"],
      cta: "Start Free Trial",
      popular: true,
      color: "#FFD166",
    },
    {
      name: "Globetrotter",
      price: "$9.99",
      period: "per month",
      features: ["Everything in Explorer", "AI Assistant", "Printed Journal", "Offline Access"],
      cta: "Learn More",
      popular: false,
      color: "#7B68EE",
    },
  ]

  // Handle login button click
  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup');

  // Handle navigation to sections
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.querySelector(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80, // Account for fixed header
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="landing-page">
      <PillNav
        logo={logo}
        logoAlt="Travel Journal Logo"
        className={isScrolled ? 'scrolled' : ''}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      {/* Animated Background Elements */}
      <div className="bg-elements">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-shape"
            animate={{
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "var(--yellow)" : i % 3 === 1 ? "var(--cyan)" : "var(--white)",
              opacity: 0.1,
              width: `${20 + Math.random() * 80}px`,
              height: `${20 + Math.random() * 80}px`,
              borderRadius: Math.random() > 0.7 ? "50%" : "12px",
              border: i % 2 === 0 ? "2px solid var(--black)" : "none",
            }}
          />
        ))}
      </div>

      {/* Navigation Progress */}
      <div className={`nav-progress ${isScrolled ? "visible" : ""}`}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${scrollProgress}%` }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <span>✨ NEW GENERATION TRAVEL JOURNAL</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line">Document Your Journey.</span>
              <span className="title-line accent">Relive Every Step.</span>
            </h1>

            <p className="hero-subtitle">
              Capture memories with photos, maps & timelines — your adventure, beautifully preserved in a modern travel
              journal.
            </p>

            {/* Signup / Login buttons removed per request */}

            <div className="hero-stats">
              {[
                { value: "10k+", label: "Travel Stories" },
                { value: "150+", label: "Countries" },
                { value: "50k+", label: "Moments" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="stat-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your Travel Companion</h2>
            <p className="section-subtitle">Everything you need to document the adventure of a lifetime</p>
          </div>

          <div className="features-grid">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                  {feature.icon()}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                <div className="feature-badge">NEW</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Traveler Stories</h2>
            <p className="section-subtitle">Hear from explorers who documented their journeys</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="testimonial-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="testimonial-avatar" style={{ backgroundColor: testimonial.color }}>
                  {testimonial.avatar}
                </div>
                <div className="testimonial-quote">"{testimonial.text}"</div>
                <div className="testimonial-info">
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-subtitle">Start free or upgrade for unlimited travel stories</p>
          </div>

          <div className="pricing-grid">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                className={`pricing-card ${plan.popular ? "popular" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {plan.popular && <div className="popular-badge">⭐ MOST POPULAR</div>}

                <div className="pricing-header">
                  <h3>{plan.name}</h3>
                  <div className="pricing-price">{plan.price}</div>
                  <div className="pricing-period">{plan.period}</div>
                </div>

                <ul className="pricing-features">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx}>
                      <span>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn btn-full ${plan.popular ? "btn-primary" : "btn-outline"}`}
                  style={{ backgroundColor: plan.popular ? plan.color : "transparent" }}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-name">✈️ TRAVEL STORY JOURNAL</div>
              <p className="brand-tagline">Made for explorers, by explorers.</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
              </div>

              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
              </div>

              <div className="footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
              </div>

              <div className="footer-column">
                <h4>Connect</h4>
                <div className="newsletter">
                  <form onSubmit={handleEmailSubmit}>
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit">→</button>
                  </form>
                  <AnimatePresence>
                    {emailSubmitted && (
                      <motion.div
                        className="submit-success"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        Thanks! Check your email ✨
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="copyright">© 2025 Travel Story Journal. All adventures reserved.</div>
              <div className="footer-stats">
                <span>🗺️ 150+ Countries</span>
                <span>📖 10,000+ Stories</span>
                <span>✨ Made with ❤️</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
