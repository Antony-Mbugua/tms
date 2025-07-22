import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const DispatcherDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Dispatcher Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user?.firstName}! Manage loads and coordinate with drivers from here.
        </p>
      </motion.div>
    </div>
  );
};

export default DispatcherDashboard;
