import { useState } from 'react';
import { Button } from './ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import FloatingAfterscribe from './FloatingAfterscribe';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingAfterscribeManagerProps {
  showToggleButton?: boolean;
}

export default function FloatingAfterscribeManager({ showToggleButton = true }: FloatingAfterscribeManagerProps) {
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);

  const toggleFloating = () => {
    setIsFloatingVisible(!isFloatingVisible);
  };

  const closeFloating = () => {
    setIsFloatingVisible(false);
  };

  return (
    <>
      {/* Toggle Button */}
      {showToggleButton && (
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={toggleFloating}
            size="icon"
            className={`
              h-14 w-14 rounded-full shadow-lg transition-all duration-300
              ${isFloatingVisible
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
          >
            <motion.div
              animate={{ rotate: isFloatingVisible ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isFloatingVisible ? <Plus className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.div>
          </Button>
        </motion.div>
      )}

      {/* Floating Afterscribe */}
      <AnimatePresence>
        {isFloatingVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <FloatingAfterscribe 
              isFloating={true} 
              onClose={closeFloating}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
