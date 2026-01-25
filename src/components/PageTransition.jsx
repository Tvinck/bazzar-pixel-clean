import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        scale: 0.98,
        filter: 'blur(10px)',
    },
    in: {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
    },
    out: {
        opacity: 0,
        scale: 1.02,
        filter: 'blur(10px)',
    }
};

const pageTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1
};

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className={`w-full h-full ${className}`}
            style={{ willChange: 'opacity, transform' }} // Hardware acceleration hint
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
