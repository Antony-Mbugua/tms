import React from 'react'
import { motion } from 'framer-motion'
import { Truck } from 'lucide-react'

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            rotate: [0, 10, -10, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="mb-8"
        >
          <Truck size={64} className="text-primary mx-auto" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-semibold mb-4"
        >
          AOL TMS
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: i * 0.2 
              }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
