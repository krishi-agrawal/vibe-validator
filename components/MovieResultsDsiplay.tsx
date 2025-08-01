// components/MovieResultsDisplay.tsx
'use client';

import React from 'react';
import { Clock, Target, Tag, Film, Star, Calendar } from 'lucide-react';
import type { MovieVibeResponse } from '../types';
import { formatConfidence } from '../utils';

interface MovieResultsDisplayProps {
  results: MovieVibeResponse;
  movieName: string;
}

export default function MovieResultsDisplay({ results, movieName }: MovieResultsDisplayProps) {
  const { movieAnalysis, vibeParameters, similarMovies, processingTime } = results;

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'action': 'bg-red-500/30 text-red-200',
      'comedy': 'bg-yellow-500/30 text-yellow-200',
      'drama': 'bg-blue-500/30 text-blue-200',
      'horror': 'bg-purple-500/30 text-purple-200',
      'romance': 'bg-pink-500/30 text-pink-200',
      'sci-fi': 'bg-cyan-500/30 text-cyan-200',
      'thriller': 'bg-orange-500/30 text-orange-200',
      'fantasy': 'bg-indigo-500/30 text-indigo-200',
      'mystery': 'bg-gray-500/30 text-gray-200',
      'adventure': 'bg-green-500/30 text-green-200'
    };
    
    const lowerGenre = genre.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (lowerGenre.includes(key)) {
        return color;
      }
    }
    return 'bg-white/20 text-white/80';
  };

  return (
    <div className="space-y-6">
      {/* Header with movie info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">{movieName}</h2>
            <p className="text-white/70">Vibe Analysis Complete</p>
          </div>
        </div>

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

      {/* Movie Analysis */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Movie Analysis
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">AI Summary</h4>
            <p className="text-white/70 italic">"{movieAnalysis.summary}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2">Primary Themes</h4>
              <div className="flex flex-wrap gap-2">
                {movieAnalysis.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {movieAnalysis.genres.map((genre, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${getGenreColor(genre)}`}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Cultural Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {movieAnalysis.culturalKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vibe Parameters */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detected Vibe Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Target Audiences</h4>
            <div className="space-y-1">
              {vibeParameters.audiences.map((audience, index) => (
                <div key={index} className="text-sm text-white/70">
                  • {audience}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-white/80 mb-2">Content Tags</h4>
            <div className="flex flex-wrap gap-1">
              {vibeParameters.tags.slice(0, 8).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Film className="w-6 h-6 text-blue-400" />
          Movies with Similar Vibes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarMovies.map((movie, index) => (
            <div
              key={index}
              className="glass-card p-4 hover-lift border border-white/10"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-white text-lg">{movie.title}</h4>
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                    {formatConfidence(movie.matchScore)}
                  </span>
                </div>
                
                {movie.year && (
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.year}</span>
                  </div>
                )}

                {movie.rating && (
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Star className="w-3 h-3" />
                    <span>{movie.rating}/10</span>
                  </div>
                )}
                
                <p className="text-sm text-white/70">{movie.description}</p>
                
                <div className="space-y-2">
                  <p className="text-xs text-white/60 italic">
                    Why it matches: {movie.reason}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {movie.sharedElements.slice(0, 4).map((element, elementIndex) => (
                      <span
                        key={elementIndex}
                        className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover-lift"
          >
            Analyze Another Movie
          </button>
          
          <button
            onClick={() => {
              const data = JSON.stringify(results, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'movie-vibe-analysis.json';
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