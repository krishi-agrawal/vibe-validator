// components/MovieInput.tsx
'use client';

import React, { useState } from 'react';
import { Search, Film, Sparkles } from 'lucide-react';

interface MovieInputProps {
  onMovieSubmit: (movie: string) => void;
  isLoading?: boolean;
}

export default function MovieInput({ onMovieSubmit, isLoading = false }: MovieInputProps) {
  const [movieName, setMovieName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMovie = movieName.trim();
    if (!trimmedMovie) {
      setError('Please enter a movie name');
      return;
    }

    if (trimmedMovie.length < 2) {
      setError('Movie name must be at least 2 characters');
      return;
    }

    setError(null);
    onMovieSubmit(trimmedMovie);
  };

  const popularMovies = [
    'The Matrix',
    'Inception',
    'Pulp Fiction',
    'The Godfather',
    'Casablanca',
    'Citizen Kane',
    'Interstellar',
    'La La Land'
  ];

  return (
    <div className="w-full">
      <div className="glass-card p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="p-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Film className="w-8 h-8 text-white" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="relative">
              <input
                type="text"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                placeholder="Enter a movie name..."
                className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                disabled={isLoading}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !movieName.trim()}
              className={`
                w-full px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2
                ${isLoading || !movieName.trim()
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover-lift'
                }
              `}
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Analyzing...' : 'Find Similar Movies'}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Popular suggestions */}
          <div className="w-full max-w-2xl">
            <h3 className="text-sm font-medium text-white/80 mb-3 text-center">
              Or try one of these classics:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {popularMovies.map((movie) => (
                <button
                  key={movie}
                  onClick={() => {
                    setMovieName(movie);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="p-2 text-xs bg-white/10 hover:bg-white/20 text-white/80 rounded border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {movie}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}