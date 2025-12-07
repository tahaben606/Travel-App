import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobeAmericas, FaMapMarkedAlt, FaUsers, FaMobileAlt } from 'react-icons/fa';

const About = () => {
  const stats = [
    { value: '10,000+', label: 'Active Travelers', icon: <FaUsers /> },
    { value: '50+', label: 'Countries', icon: <FaGlobeAmericas /> },
    { value: '100K+', label: 'Stories Shared', icon: <FaMapMarkedAlt /> },
    { value: '24/7', label: 'Support', icon: <FaMobileAlt /> },
  ];

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="about-hero">
        <div className="container">
          <h1>Our Story</h1>
          <p className="subtitle">Helping travelers document their journeys since 2023</p>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <motion.div 
            className="about-content"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Why We Started</h2>
            <p>
              Travel Journal was born from a simple idea: every journey tells a story worth remembering. 
              We noticed that while people take thousands of photos during their travels, these memories 
              often get lost in the digital abyss. Our mission is to help travelers preserve and share 
              their adventures in a beautiful, organized way.
            </p>
          </motion.div>

          <motion.div 
            className="stats-grid"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="team-section">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            {[
              { name: 'Alex Chen', role: 'Founder & CEO', avatar: 'AC' },
              { name: 'Jamie Smith', role: 'Lead Developer', avatar: 'JS' },
              { name: 'Taylor Wilson', role: 'Designer', avatar: 'TW' },
              { name: 'Morgan Lee', role: 'Community Manager', avatar: 'ML' },
            ].map((member, index) => (
              <motion.div 
                key={index} 
                className="team-card"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="team-avatar">{member.avatar}</div>
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default About;
