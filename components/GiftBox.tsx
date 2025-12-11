import React from 'react';

interface GiftBoxProps {
  isOpen: boolean;
  onClick: () => void;
}

const GiftBox: React.FC<GiftBoxProps> = ({ isOpen, onClick }) => {
  // Styles for the box faces
  const boxSize = "w-40 h-40";
  const translateZ = "translate-z-[5rem]"; // Half of 10rem (w-40)
  
  // Wrapper rotation state
  const wrapperClass = isOpen ? "rotate-x-10 rotate-y-12" : "animate-hover cursor-pointer hover:scale-105";

  // Lid animation: Rotate back and lift slightly
  const lidTransform = isOpen 
    ? "rotate-x-[-110deg] translate-y-[-3rem] translate-z-[1rem]" 
    : "rotate-x-0 translate-y-0 translate-z-[5rem]"; 

  // Common shadow and lighting classes
  // Using inset shadows to simulate occlusion near edges
  const faceShadow = "shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]";
  
  return (
    <div className="perspective-1000 group relative z-10" onClick={onClick}>
      <div 
        className={`relative ${boxSize} preserve-3d transition-transform duration-1000 ease-in-out ${wrapperClass}`}
        style={{ transform: isOpen ? 'rotateX(20deg) rotateY(-20deg) translateY(100px)' : 'rotateX(-20deg) rotateY(45deg)' }}
      >
        {/* --- BODY OF THE BOX --- */}
        
        {/* Bottom - Darkest, barely visible, but needed for completeness */}
        <div className={`absolute ${boxSize} bg-red-900 origin-center transform rotate-x-90 translate-z-[5rem] shadow-2xl`}></div>

        {/* Front - Medium lighting */}
        <div className={`absolute ${boxSize} bg-gradient-to-br from-red-500 via-red-600 to-red-700 origin-center transform ${translateZ} flex items-center justify-center ${faceShadow}`}>
           {/* Ribbon V */}
          <div className="w-10 h-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-md flex justify-center border-x border-yellow-600/20">
             <div className="w-px h-full bg-yellow-100/30"></div>
          </div>
        </div>

        {/* Back - Darker due to lighting angle */}
        <div className={`absolute ${boxSize} bg-gradient-to-bl from-red-700 to-red-800 origin-center transform rotate-y-180 ${translateZ} flex items-center justify-center ${faceShadow}`}>
          <div className="w-10 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-sm border-x border-yellow-700/30"></div>
        </div>

        {/* Left - Side lighting (Dim) */}
        <div className={`absolute ${boxSize} bg-gradient-to-br from-red-600 to-red-800 origin-center transform -rotate-y-90 ${translateZ} flex items-center justify-center ${faceShadow}`}>
          <div className="w-10 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-sm border-x border-yellow-700/30"></div>
        </div>

        {/* Right - Side lighting (Brighter) */}
        <div className={`absolute ${boxSize} bg-gradient-to-bl from-red-500 to-red-600 origin-center transform rotate-y-90 ${translateZ} flex items-center justify-center ${faceShadow}`}>
          <div className="w-10 h-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-md border-x border-yellow-600/20">
             <div className="w-px h-full bg-yellow-100/30"></div>
          </div>
        </div>

        {/* --- LID GROUP --- */}
        <div 
            className="absolute top-0 left-0 w-40 h-40 preserve-3d transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-[50%_0%_-5rem]"
            style={{ 
                transform: lidTransform,
                transformOrigin: '50% 0 -2.5rem' // Pivot at the back edge hinge
            }}
        >
            {/* Top Face (Lid Top) - Brightest Face */}
            <div className={`absolute ${boxSize} bg-gradient-to-br from-red-400 to-red-600 origin-center transform rotate-x-90 -translate-y-20 flex items-center justify-center shadow-lg ${faceShadow}`}>
               {/* Ribbon Cross */}
               <div className="absolute w-10 h-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-sm border-x border-yellow-600/20"></div>
               <div className="absolute h-10 w-full bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-sm border-y border-yellow-600/20"></div>
               
               {/* Realistic Bow */}
               <div className="absolute transform -translate-z-6 -translate-y-2 preserve-3d">
                  {/* Left Loop */}
                  <div className="absolute -top-6 -left-8 w-14 h-14 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-tl-full rounded-bl-full border-4 border-yellow-500 shadow-lg transform rotate-45 skew-x-12 origin-bottom-right"></div>
                  {/* Right Loop */}
                  <div className="absolute -top-6 -right-8 w-14 h-14 bg-gradient-to-tl from-yellow-400 to-yellow-200 rounded-tr-full rounded-br-full border-4 border-yellow-500 shadow-lg transform -rotate-45 -skew-x-12 origin-bottom-left"></div>
                  {/* Center Knot */}
                  <div className="absolute w-8 h-8 -top-4 -left-4 bg-yellow-300 rounded-full shadow-inner border border-yellow-500 z-10"></div>
               </div>
            </div>
            
            {/* Lid Sides (Flaps) - Thickness of the lid */}
            <div className="absolute w-40 h-6 bg-red-700 transform rotate-x-90 translate-z-[2rem] -translate-y-[5rem] brightness-75"></div>
            <div className="absolute w-40 h-6 bg-red-800 transform rotate-x-90 translate-z-[-8rem] -translate-y-[5rem] brightness-50"></div>
            <div className="absolute h-40 w-6 bg-red-600 transform rotate-y-90 translate-x-[5rem] -translate-y-[0rem] -translate-z-[5rem] rotate-x-90 brightness-90"></div>
            <div className="absolute h-40 w-6 bg-red-600 transform rotate-y-90 translate-x-[-5rem] -translate-y-[0rem] -translate-z-[5rem] rotate-x-90 brightness-90"></div>
        </div>
        
        {/* Internal Glow (visible when open) */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400/50 blur-[50px] rounded-full transition-all duration-1000 ${isOpen ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`} style={{ transform: 'rotateX(90deg) translateZ(0px)' }}></div>

      </div>

        {/* Dynamic Shadow on the "Floor" */}
       <div 
         className={`absolute -bottom-32 left-1/2 -translate-x-1/2 bg-black/40 blur-xl rounded-[100%] transition-all duration-1000 ease-in-out`}
         style={{
            width: isOpen ? '12rem' : '10rem',
            height: isOpen ? '3rem' : '2.5rem',
            opacity: isOpen ? 0.2 : 0.6,
            transform: isOpen ? 'scale(1.5)' : 'scale(1)' 
         }}
       ></div>

        {/* Text prompt */}
       <div className={`absolute -bottom-24 w-full text-center transition-opacity duration-500 ${isOpen ? 'opacity-0 delay-0' : 'opacity-100 delay-500'}`}>
          <p className="text-white/80 font-light tracking-widest text-sm uppercase animate-pulse drop-shadow-md cursor-pointer hover:text-white">Click to Open</p>
       </div>
    </div>
  );
};

export default GiftBox;