'use client';

import React from 'react';
import { Eye, Brain, Sparkles } from 'lucide-react';

interface LoadingAnimationProps {
  stage: 'uploading' | 'analyzing' | 'generating' | 'complete';
}

export default function LoadingAnimation({ stage }: LoadingAnimationProps) {
  const stages = [
    {
      key: 'uploading',
      icon: Eye,
      title: 'Reading Your Image',
      description: 'AI is examining the visual elements...'
    },
    {
      key: 'analyzing',
      icon: Brain,
      title: 'Analyzing Cultural Vibes',
      description: 'Identifying aesthetic patterns and cultural context...'
    },
    {
      key: 'generating',
      icon: Sparkles,
      title: 'Curating Recommendations',
      description: 'Finding perfect matches across music, dining, and experiences...'
    }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);

  return (
    <div className="glass-card p-8">
      <div className="flex flex-col items-center space-y-6">
        {/* Main animation */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse-slow flex items-center justify-center">
            {stages[currentStageIndex] && (() => {
              const CurrentIcon = stages[currentStageIndex].icon;
              return <CurrentIcon className="w-8 h-8 text-white animate-bounce-subtle" />;
            })()}
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin"></div>
        </div>

        {/* Stage information */}
        {stages[currentStageIndex] && (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              {stages[currentStageIndex].title}
            </h3>
            <p className="text-white/70">
              {stages[currentStageIndex].description}
            </p>
          </div>
        )}

        {/* Progress indicators */}
        <div className="flex space-x-4">
          {stages.map((stageItem, index) => {
            const StageIcon = stageItem.icon;
            const isActive = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <div key={stageItem.key} className="flex flex-col items-center space-y-2">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white/10 text-white/40'
                    }
                    ${isCurrent ? 'scale-110 shadow-lg' : ''}
                  `}
                >
                  <StageIcon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                </div>
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isActive ? 'bg-purple-400' : 'bg-white/20'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Processing time indicator */}
        <div className="text-center">
          <p className="text-xs text-white/50">
            This usually takes 10-15 seconds
          </p>
        </div>
      </div>
    </div>
  );
}