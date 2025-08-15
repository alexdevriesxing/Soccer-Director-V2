import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const silhouettes = [
    { id: 1, text: 'Football Manager', delay: 0.5 },
    { id: 2, text: 'Build Your Legacy', delay: 2 },
    { id: 3, text: 'Lead Your Team to Glory', delay: 2 },
  ];

  useEffect(() => {
    if (currentIndex < silhouettes.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, silhouettes[currentIndex].delay * 1000);
      return () => clearTimeout(timer);
    } else if (currentIndex === silhouettes.length - 1) {
      const timer = setTimeout(() => {
        setIsComplete(true);
        onComplete();
      }, silhouettes[currentIndex].delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.5,
        duration: 0.8,
      },
    }),
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // cubic-bezier values for easeOutExpo
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.6, 1] // cubic-bezier values for easeInOut
      }
    }
  } as const;

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
      <AnimatePresence mode="wait">
        {!isComplete && (
          <motion.div
            key={silhouettes[currentIndex].id}
            className="text-center p-8"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            custom={currentIndex}
          >
            <motion.div
              className="relative w-64 h-64 mx-auto mb-8"
              variants={textVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 opacity-20 rounded-full blur-xl"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-900 rounded-full opacity-30"></div>
              </div>
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold text-white mb-4"
              variants={textVariants}
            >
              {silhouettes[currentIndex].text}
            </motion.h1>
            <motion.div 
              className="w-32 h-1 bg-blue-500 mx-auto mt-4"
              initial={{ scaleX: 0 }}
              animate={{ 
                scaleX: [0, 1, 0],
                transformOrigin: 'center',
              }}
              transition={{ 
                duration: silhouettes[currentIndex].delay,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroAnimation;
