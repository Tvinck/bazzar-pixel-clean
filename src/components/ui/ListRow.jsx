import { motion } from 'framer-motion';

const ListRow = ({
  icon,
  title,
  subtitle,
  value,
  onClick,
  chevron = true,
  badge,
  danger = false,
}) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3
      cursor-pointer transition-colors duration-150
      active:bg-glass rounded-card
      ${danger ? 'text-red-400' : 'text-text-primary'}
    `}
  >
    {icon && (
      <div className="w-9 h-9 rounded-[10px] bg-glass 
                      flex items-center justify-center 
                      text-lg flex-shrink-0">
        {icon}
      </div>
    )}
    
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium truncate
                     ${danger ? 'text-red-400' : 'text-text-primary'}`}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-text-secondary truncate mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
    
    <div className="flex items-center gap-2 flex-shrink-0">
      {badge && (
        <span className="px-2 py-0.5 bg-accent-purple/20 
                         text-accent-purple text-xs rounded-full">
          {badge}
        </span>
      )}
      {value && (
        <span className="text-sm text-text-secondary">{value}</span>
      )}
      {chevron && onClick && (
        <span className="text-text-secondary text-xs">›</span>
      )}
    </div>
  </motion.div>
);

export default ListRow;
