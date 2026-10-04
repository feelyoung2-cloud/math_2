import React from 'react';

export type AnimalEmotion = 'idle' | 'happy' | 'cheering' | 'thinking' | 'sad';

interface AnimalMascotProps {
  animal?: 'rabbit' | 'bear' | 'squirrel' | 'puppy' | 'cat';
  emotion?: AnimalEmotion;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}

const ANIMALS = {
  rabbit: {
    name: '토순이',
    emoji: '🐰',
    bgColor: 'bg-pink-100 border-pink-300 text-pink-700',
    bubbleColor: 'bg-pink-50 border-pink-200 text-pink-900',
  },
  bear: {
    name: '곰돌이',
    emoji: '🐻',
    bgColor: 'bg-amber-100 border-amber-300 text-amber-800',
    bubbleColor: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  squirrel: {
    name: '다람이',
    emoji: '🐿️',
    bgColor: 'bg-orange-100 border-orange-300 text-orange-800',
    bubbleColor: 'bg-orange-50 border-orange-200 text-orange-900',
  },
  puppy: {
    name: '멍뭉이',
    emoji: '🐶',
    bgColor: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    bubbleColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  cat: {
    name: '야옹이',
    emoji: '🐱',
    bgColor: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    bubbleColor: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
};

export const AnimalMascot: React.FC<AnimalMascotProps> = ({
  animal = 'rabbit',
  emotion = 'idle',
  size = 'md',
  message,
}) => {
  const config = ANIMALS[animal] || ANIMALS.rabbit;

  const sizeClasses = {
    sm: 'text-3xl w-14 h-14',
    md: 'text-5xl w-20 h-20',
    lg: 'text-7xl w-28 h-28',
    xl: 'text-8xl w-36 h-36',
  }[size];

  // Dynamic animation classes based on emotion
  let motionClass = 'animate-pulse';
  if (emotion === 'cheering') {
    motionClass = 'animate-bounce';
  } else if (emotion === 'happy') {
    motionClass = 'transition-transform duration-300 transform scale-110 -rotate-3';
  } else if (emotion === 'sad') {
    motionClass = 'transition-transform duration-300 transform scale-95 opacity-80';
  } else if (emotion === 'thinking') {
    motionClass = 'transition-transform duration-500 transform rotate-6';
  }

  return (
    <div className="flex flex-col items-center select-none">
      {message && (
        <div
          className={`relative mb-3 px-4 py-2.5 rounded-2xl border-2 font-bold text-base md:text-lg shadow-md max-w-xs md:max-w-md text-center ${config.bubbleColor} animate-fade-in`}
        >
          {message}
          {/* Speech bubble arrow */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-200" />
        </div>
      )}

      <div
        className={`flex items-center justify-center rounded-full border-4 shadow-lg transition-all duration-300 ${config.bgColor} ${sizeClasses} ${motionClass}`}
      >
        <span>{config.emoji}</span>
      </div>

      <div className="mt-1 font-bold text-emerald-900 text-sm md:text-base tracking-wide bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
        {config.name}
      </div>
    </div>
  );
};
