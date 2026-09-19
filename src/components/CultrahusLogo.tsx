import React from 'react';

interface CultrahusLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  textColor?: 'light' | 'dark';
}

export const CultrahusLogo: React.FC<CultrahusLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'dark'
}) => {
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    hero: 'w-36 h-36 sm:w-44 sm:h-44'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-full overflow-hidden border border-[#556342]/40 shadow-md bg-[#f7f4ec] transition-transform duration-200 hover:scale-105`}>
        <img
          src="/cultrahus_logo.jpg"
          alt="Cultrahus Emblem - Vision to Realism"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Graceful fallback to static logo path if needed
            const target = e.currentTarget;
            if (target.src !== '/logo.jpg') {
              target.src = '/logo.jpg';
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-serif font-extrabold tracking-wider ${
                textColor === 'light' ? 'text-[#f5f2e9]' : 'text-[#2e3722]'
              } ${size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-lg'}`}
            >
              CULTRAHUS
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#4d5d36]/20 text-[#7a8e5b] border border-[#5b6d40]/30">
              SANGAM 2026
            </span>
          </div>
          <span
            className={`text-[10px] tracking-widest uppercase font-medium ${
              textColor === 'light' ? 'text-[#cbd6be]' : 'text-[#5d674b]'
            }`}
          >
            Vision to Realism
          </span>
        </div>
      )}
    </div>
  );
};
