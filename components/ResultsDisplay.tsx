'use client';

import React from 'react';
import { Clock, Target, Tag, Heart } from 'lucide-react';
import type { VibeValidationResponse } from '../types';
import { getVibeEmoji, getCategoryIcon, formatConfidence } from '../utils';

interface ResultsDisplayProps {
  results: VibeValidationResponse;
  imagePreview: string;
}

export default function ResultsDisplay({ results, imagePreview }: ResultsDisplayProps) {
  const { imageDescription, vibeAnalysis, recommendations, processingTime } = results;

  return (
    <div className="space-y-6">
      {/* Header with image and primary vibe */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img
              src={imagePreview}
              alt="Analyzed space"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div className="md:w-2/3 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getVibeEmoji(vibeAnalysis.primaryVibe)}</span>
              <h2 className="text-2xl font-bold gradient-text">
                {vibeAnalysis.primaryVibe}
              </h2>
            </div>
            
            <p className="text-white/80 leading-relaxed">
              {vibeAnalysis.culturalContext}
            </p>

            <div className="flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Analyzed in {(processingTime / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>AI Confidence: High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vibe breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Vibe Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Secondary Vibes</h4>
            <div className="flex flex-wrap gap-2">
              {vibeAnalysis.secondaryVibes.map((vibe, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm"
                >
                  {vibe}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Mood Descriptors</h4>
            <div className="flex flex-wrap gap-2">
              {vibeAnalysis.moodDescriptors.map((mood, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pink-500/30 text-pink-200 rounded-full text-sm"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-white/80 mb-2">Aesthetic Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {vibeAnalysis.aestheticKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Description */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Vision Analysis</h3>
        <p className="text-white/70 italic">"{imageDescription}"</p>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400" />
          Curated Recommendations
        </h3>
        
        {recommendations.map((category, categoryIndex) => (
          <div key={categoryIndex} className="glass-card p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 capitalize">
              <span className="text-xl">{getCategoryIcon(category.category)}</span>
              {category.category}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-white/5 rounded-lg p-4 hover-lift border border-white/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-white">{item.name}</h5>
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                      {formatConfidence(item.confidence)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/70 mb-3">{item.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 italic">
                      Why it matches: {item.reason}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover-lift"
          >
            Analyze Another Image
          </button>
          
          <button
            onClick={() => {
              const data = JSON.stringify(results, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'vibe-analysis.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Export Results
          </button>
        </div>
      </div>
    </div>
  );
}