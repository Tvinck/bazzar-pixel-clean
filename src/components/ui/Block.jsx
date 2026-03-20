import React from 'react';

/**
 * iOS-style Block
 * Used to group related UI elements (like list rows) inside a themed container.
 */
const Block = ({ children, className = '', title }) => (
    <div className="mb-6">
        {title && (
            <p className="text-[13px] text-gray-400 font-medium uppercase tracking-wider mb-2 ml-4">
                {title}
            </p>
        )}
        <div className={`bg-bg-secondary rounded-card overflow-hidden ${className}`}>
            {children}
        </div>
    </div>
);

export default Block;
