import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  icon,
  maxLength,
  multiline = false,
  rows = 3,
  className = '',
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  const inputClass = `
    w-full bg-bg-secondary border rounded-input
    text-text-primary placeholder-text-secondary
    px-4 py-3 text-sm outline-none
    transition-all duration-200
    ${icon ? 'pl-10' : ''}
    ${error 
      ? 'border-red-500/50 focus:border-red-500' 
      : focused 
        ? 'border-accent-purple/60' 
        : 'border-glass-border'
    }
  `;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-text-secondary 
                          uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 
                           text-text-secondary text-base">
            {icon}
          </span>
        )}
        
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={inputClass + ' resize-none'}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={inputClass}
          />
        )}
        
        {/* Галочка при успешном вводе */}
        <AnimatePresence>
          {hasValue && !error && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                         text-green-400 text-sm"
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex justify-between items-center">
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              ⚠️ {error}
            </motion.p>
          )}
          {hint && !error && (
            <p className="text-xs text-text-secondary">{hint}</p>
          )}
        </AnimatePresence>
        
        {maxLength && (
          <p className="text-xs text-text-secondary ml-auto">
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;
