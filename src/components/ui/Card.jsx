const variants = {
  glass: `
    bg-glass backdrop-blur-3xl 
    border border-glass-border
    shadow-xl shadow-black/20
  `,
  solid: `
    bg-bg-secondary border border-glass-border
  `,
  gradient: `
    bg-gradient-to-br from-accent-purple/10 to-accent-pink/10
    backdrop-blur-xl border border-accent-purple/20
  `,
};

const Card = ({ 
  children, 
  variant = 'glass',
  className = '',
  onClick,
  padding = true,
}) => (
  <div
    onClick={onClick}
    className={`
      rounded-card transition-all duration-200
      ${variants[variant]}
      ${padding ? 'p-4' : ''}
      ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

export default Card;
