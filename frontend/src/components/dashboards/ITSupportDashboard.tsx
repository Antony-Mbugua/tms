import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ITSupportDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-6">
          IT Support Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user?.firstName}! Monitor system health, security logs, and user management from here.
        </p>
      </motion.div>
    </div>
  );
};

export default ITSupportDashboard;
