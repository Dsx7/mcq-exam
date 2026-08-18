import React from 'react';

export default function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
    xl: 'w-16 h-16 text-3xl',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-violet-600 blur-lg opacity-40 rounded-full mix-blend-screen" />
      
      {/* Abstract Polygon Base */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-xl"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" /> {/* violet-500 */}
            <stop offset="100%" stopColor="#4C1D95" /> {/* violet-900 */}
          </linearGradient>
          <linearGradient id="accentGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" /> {/* teal-400 */}
            <stop offset="100%" stopColor="#0D9488" /> {/* teal-600 */}
          </linearGradient>
        </defs>
        
        {/* Hexagon shape */}
        <path 
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
          fill="url(#logoGradient)" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="2"
        />
        
        {/* Inner dynamic shapes */}
        <path 
          d="M35 50 L45 65 L70 35" 
          stroke="url(#accentGradient)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]"
        />
        
        {/* Accent dot */}
        <circle cx="35" cy="35" r="4" fill="#2DD4BF" />
      </svg>
    </div>
  );
}
