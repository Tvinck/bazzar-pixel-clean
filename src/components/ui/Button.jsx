import { motion } from 'framer-motion';

const variants = {
  primary: `
    bg-gradient-to-r from-accent-purple to-accent-pink
    text-white shadow-lg shadow-accent-purple/30
    hover:shadow-accent-purple/50
  `,
  glass: `
    bg-glass border border-glass-border
    text-text-primary backdrop-blur-xl
    hover:bg-glass-hover
  `,
  ghost: `
    bg-transparent text-text-secondary
    hover:text-text-primary hover:bg-glass
  `,
  danger: `
    bg-red-500/20 border border-red-500/30
    text-red-400 hover:bg-red-500/30
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-chip',
  md: 'px-4 py-2.5 text-sm rounded-button',
  lg: 'px-6 py-3.5 text-base rounded-button',
  full: 'w-full px-4 py-3.5 text-base rounded-button',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon,
}) => {
  const handleClick = () => {
    if (disabled || loading) return;
    // Haptic feedback
    window.Telegram?.WebApp?.HapticFeedback
      ?.impactOccurred('light');
    onClick?.();
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2
        font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current 
                        border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="text-base">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
