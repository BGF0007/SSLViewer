import React from 'react';
import { motion } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  position = 'top' 
}) => {
  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`absolute z-50 ${positionStyles[position]} 
        bg-white/10 backdrop-blur-md 
        text-white text-xs 
        px-3 py-2 
        rounded-lg 
        border border-white/10 
        shadow-lg shadow-black/20
        pointer-events-none`}
    >
      {children}
    </motion.div>
  );
};

export default Tooltip;
