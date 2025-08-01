// app/movie-vibe/page.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Film, Search, Zap, Globe, ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MovieInput from '../../components/MovieInput';
import LoadingAnimation from '../../components/LoadingAnimation';
import MovieResultsDisplay from "../../components/MovieResultsDsiplay";
import type { MovieVibeResponse, APIError } from '../../types';

type AppState = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';

export default function MovieVibePage() {
  const [state, setState] = useState<AppState>('idle');
  const [results, setResults] = useState<MovieVibeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [movieName, setMovieName] = useState<string>('');

  const handleMovieSubmit = async (movie: string) => {
    try {
      setState('analyzing');
      setError(null);
      setMovieName(movie);

      // Send to API
      const response = await axios.post<MovieVibeResponse>('/api/analyze-movie', {
        movieName: movie
      });

      setState('generating');
      
      // Simulate some processing time for better UX
      setTimeout(() => {
        setResults(response.data);
        setState('complete');
      }, 1500);

    } catch (err) {
      console.error('Movie analysis error:', err);
      setState('error');
      
      if (axios.isAxiosError(err) && err.response?.data) {
        const apiError = err.response.data as APIError;
        setError(apiError.error || 'Analysis failed');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const resetApp = () => {
    setState('idle');
    setResults(null);
    setError(null);
    setMovieName('');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Back button */}
            <Link 
              href="/"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Film className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Movie Vibe Finder
            </h1>
          </div>
          
          <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto">
            Enter a movie name and discover films with similar vibes, themes, and cultural elements 
            using AI-powered taste analysis.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-white/70">
              <Search className="w-5 h-5 text-blue-400" />
              <span>Movie Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>AI Vibe Detection</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Globe className="w-5 h-5 text-green-400" />
              <span>Cultural Matching</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {state === 'idle' && (
            <>
              <MovieInput onMovieSubmit={handleMovieSubmit} />
              
              {/* How it works section */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <ChevronDown className="w-5 h-5" />
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center mx-auto">
                      <span className="text-blue-200 font-bold">1</span>
                    </div>
                    <h3 className="font-medium text-white">Enter Movie</h3>
                    <p className="text-sm text-white/70">Type in any movie title you love</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center mx-auto">
                      <span className="text-purple-200 font-bold">2</span>
                    </div>
                    <h3 className="font-medium text-white">AI Analysis</h3>
                    <p className="text-sm text-white/70">Our AI identifies themes, genres, and cultural elements</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-pink-500/30 flex items-center justify-center mx-auto">
                      <span className="text-pink-200 font-bold">3</span>
                    </div>
                    <h3 className="font-medium text-white">Find Similar</h3>
                    <p className="text-sm text-white/70">Discover movies with matching vibes and themes</p>
                  </div>
                </div>
              </div>

              {/* Popular examples */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Try These Popular Movies</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Blade Runner 2049', 'The Grand Budapest Hotel', 'Spirited Away', 'Parasite'].map((movie) => (
                    <button
                      key={movie}
                      onClick={() => handleMovieSubmit(movie)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors border border-white/20"
                    >
                      {movie}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {(state === 'analyzing' || state === 'generating') && (
            <LoadingAnimation stage={state} />
          )}

          {state === 'complete' && results && (
            <MovieResultsDisplay results={results} movieName={movieName} />
          )}

          {state === 'error' && (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-red-200 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
              <p className="text-white/70 mb-6">{error}</p>
              <button
                onClick={resetApp}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="glass-card p-6">
            <p className="text-white/60 text-sm mb-2">
              Powered by Hugging Face AI Models and Qloo Taste Intelligence
            </p>
            <p className="text-white/40 text-xs">
              Built for the Qloo Global Hackathon 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}