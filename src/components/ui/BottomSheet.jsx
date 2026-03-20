import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { cn } from '../../utils/cn';

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = ['40%', '85%'],
  defaultSnap = 0,
  showHandle = true,
  showOverlay = true,
  className = '',
}) => {
  const sheetRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Haptic feedback on open
  useEffect(() => {
    if (isOpen) {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }
  }, [isOpen]);

  // Swipe gesture for closing
  const bind = useDrag(
    ({ movement: [, my], velocity: [, vy], last }) => {
      if (last) {
        if (my > 100 || vy > 0.5) {
          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
          onClose();
        }
      }
    },
    { 
      axis: 'y',
      filterTaps: true,
      rubberband: true,
    }
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
          )}

          {/* Sheet */}
          <motion.div
            {...bind()}
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[70]",
              "bg-bg-secondary rounded-t-[24px]",
              "border-t border-white/5 shadow-2xl",
              "flex flex-col touch-none",
              className
            )}
            style={{ 
              maxHeight: snapPoints[defaultSnap] || '90vh'
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-4 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-white/10" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 pb-4 border-b border-white/5">
                <h3 className="text-white font-bold text-lg tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 active:scale-90 transition-all"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-12 pt-2 scrollbar-none overscroll-contain touch-auto">
              {children}
            </div>

            {/* iOS Bottom Padding */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
