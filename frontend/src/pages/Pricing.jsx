import React from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '3 Travel Stories',
        'Basic Maps',
        '50 Photos/Month',
        'Community Support'
      ],
      cta: 'Get Started',
      featured: false
    },
    {
      name: 'Explorer',
      price: '$4.99',
      period: 'per month',
      features: [
        'Unlimited Stories',
        'Advanced Maps',
        '500 Photos/Month',
        'Priority Support',
        'Offline Access'
      ],
      cta: 'Start Free Trial',
      featured: true
    },
    {
      name: 'Globetrotter',
      price: '$9.99',
      period: 'per month',
      features: [
        'Everything in Explorer',
        'Unlimited Photos',
        'AI Trip Planning',
        '24/7 Support',
        'Custom Domain',
        'Advanced Analytics'
      ],
      cta: 'Choose Plan',
      featured: false
    }
  ];

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className="pricing-header">
          <h1>Simple, transparent pricing</h1>
          <p>Choose the plan that's right for your travel needs</p>
        </div>
        
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.name}
              className={`pricing-card ${plan.featured ? 'featured' : ''}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {plan.featured && <div className="featured-badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <div className="price">
                <span className="amount">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>
              <ul className="features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <span className="check">✓</span> {feature}
                  </li>
                ))}
              </ul>
              <button className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Pricing;
