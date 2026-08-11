import { motion } from 'framer-motion';

const PremiumChefAnimation = () => {
  return (
    <div className="relative w-full h-64 mx-auto mb-6 flex items-center justify-center scale-105">
      {/* Soft background glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-64 h-64 bg-primary-500/30 rounded-full blur-3xl z-0"
      />

      {/* Minimalist Professional Chef Silhouette Background */}
      <motion.div
        animate={{ y: [0, -5, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 z-0 opacity-40 mix-blend-overlay"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chef Hat Premium Vector */}
          <path d="M20 70C15 70 10 65 10 55C10 45 15 40 25 40C30 20 50 10 70 15C85 10 105 20 110 40C120 40 125 45 125 55C125 65 120 70 115 70L20 70Z" fill="url(#chefHatGrad)"/>
          <path d="M25 70L30 100C30 105 40 110 65 110C90 110 100 105 100 100L105 70H25Z" fill="url(#chefHatGrad)"/>
          <defs>
            <linearGradient id="chefHatGrad" x1="10" y1="10" x2="120" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Serving Plate (Base) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute bottom-8 z-10"
      >
        <svg width="200" height="40" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="100" cy="20" rx="90" ry="15" fill="url(#plateGradient)" />
          <ellipse cx="100" cy="22" rx="95" ry="16" fill="url(#plateGradientDark)" />
          <defs>
            <linearGradient id="plateGradient" x1="0" y1="0" x2="200" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="plateGradientDark" x1="0" y1="0" x2="200" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#94A3B8" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* The Logo embedded inside the presentation */}
      <motion.div
        animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-16 z-20"
      >
        <img 
          src="/logo.png" 
          alt="Rasoi Junction" 
          className="w-24 h-24 rounded-full shadow-[0_10px_40px_rgba(245,158,11,0.6)] border-[3px] border-white/80 bg-white"
        />
      </motion.div>

      {/* Steam lines lifting gracefully */}
      <div className="absolute bottom-40 z-30 flex gap-4">
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width="20"
            height="60"
            viewBox="0 0 20 60"
            fill="none"
            animate={{ y: [10, -25], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.5
            }}
          >
            <path d="M10 60C10 40 20 30 10 10C0 -10 10 -20 10 -20" stroke="url(#steamGradient)" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <linearGradient id="steamGradient" x1="10" y1="60" x2="10" y2="-20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" stopOpacity="0" />
                <stop offset="0.5" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
            </defs>
          </motion.svg>
        ))}
      </div>

      {/* Silver Cloche (Food Cover) that opens up */}
      <motion.div
        animate={{ y: [0, -100, -100, 0], opacity: [1, 0, 0, 1], scale: [1, 1.05, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-12 z-40 origin-bottom"
      >
        <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Handle */}
          <circle cx="90" cy="15" r="10" fill="url(#clocheGradient)" />
          {/* Dome */}
          <path d="M10 90C10 40 40 25 90 25C140 25 170 40 170 90H10Z" fill="url(#clocheGradient)" />
          <path d="M10 90C10 40 40 25 90 25C140 25 170 40 170 90H10Z" fill="url(#clocheShine)" opacity="0.6"/>
          {/* Rim */}
          <rect x="0" y="90" width="180" height="10" rx="5" fill="url(#clocheGradient)" />
          
          <defs>
            <linearGradient id="clocheGradient" x1="0" y1="0" x2="180" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F1F5F9" />
              <stop offset="0.5" stopColor="#94A3B8" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="clocheShine" x1="40" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.9" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};

export default PremiumChefAnimation;
