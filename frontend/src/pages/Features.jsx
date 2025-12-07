import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <h1>Features</h1>
        <div className="features-grid">
          {[
            {
              title: 'Interactive Maps',
              description: 'Track your journey with our interactive maps and location-based features.'
            },
            {
              title: 'Photo Gallery',
              description: 'Store and organize your travel photos with our beautiful gallery.'
            },
            {
              title: 'Travel Journal',
              description: 'Document your adventures with our easy-to-use journaling tools.'
            },
            {
              title: 'Packing Lists',
              description: 'Create and manage packing lists for all your trips.'
            }
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              className="feature-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Features;
