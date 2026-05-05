import React from 'react';

export const Desktop: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-[calc(100vh-48px)] overflow-hidden bg-cover bg-center">
      {/* Ethereal Desktop Background */}
      <div className="absolute inset-0 bg-[#020617] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-transparent to-rose-950/20 -z-10" />
      
      {/* Ambient Light Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse -z-10" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full animate-float -z-10" />

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-white/10 text-8xl font-light tracking-[0.2em] uppercase select-none animate-float">
          Aether
        </h1>
      </div>

      {children}
    </div>
  );
};
