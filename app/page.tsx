// app/page.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Sparkles, Zap, Globe, ChevronDown, Film, ArrowRight } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import LoadingAnimation from '../components/LoadingAnimation';
import ResultsDisplay from '../components/ResultsDisplay';
import { convertImageToBase64 } from '../utils';
import type { VibeValidationResponse, APIError } from '../types';

type AppState = 'idle' | 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error';

export default function HomePage() {
  const [state, setState] = useState<AppState>('idle');
  const [results, setResults] = useState<VibeValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageSelect = async (file: File, preview: string) => {
    try {
      setState('uploading');
      setError(null);
      setImagePreview(preview);

      // Convert image to base64
      const imageBase64 = await convertImageToBase64(file);

      setState('analyzing');
      
      // Send to API
      const response = await axios.post<VibeValidationResponse>('/api/analyze', {
        imageBase64
      });

      setState('generating');
      
      // Simulate some processing time for better UX
      setTimeout(() => {
        setResults(response.data);
        setState('complete');
      }, 1500);

    } catch (err) {
      console.error('Analysis error:', err);
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
    setImagePreview('');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Vibe Validator
            </h1>
          </div>
          
          <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto">
            Upload any image and discover its cultural essence with AI-powered recommendations 
            for music, dining, activities, and experiences that match its vibe.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>AI Vision Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>Cultural Intelligence</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Cross-Domain Recommendations</span>
            </div>
          </div>

          {/* New Movie Vibe Feature */}
          <div className="mb-8">
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">New: Movie Vibe Finder</h3>
                    <p className="text-sm text-white/70">Find movies with similar vibes and themes</p>
                  </div>
                </div>
                <Link
                  href="/movie-vibe"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2"
                >
                  Try Movie Vibe
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {state === 'idle' && (
            <>
              <ImageUpload onImageSelect={handleImageSelect} />
              
              {/* How it works section */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <ChevronDown className="w-5 h-5" />
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center mx-auto">
                      <span className="text-purple-200 font-bold">1</span>
                    </div>
                    <h3 className="font-medium text-white">Upload Image</h3>
                    <p className="text-sm text-white/70">Share a photo of any space, outfit, or scene</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-pink-500/30 flex items-center justify-center mx-auto">
                      <span className="text-pink-200 font-bold">2</span>
                    </div>
                    <h3 className="font-medium text-white">AI Analysis</h3>
                    <p className="text-sm text-white/70">Our AI identifies the cultural vibe and aesthetic</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center mx-auto">
                      <span className="text-indigo-200 font-bold">3</span>
                    </div>
                    <h3 className="font-medium text-white">Get Recommendations</h3>
                    <p className="text-sm text-white/70">Discover matching music, dining, and experiences</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {(state === 'uploading' || state === 'analyzing' || state === 'generating') && (
            <LoadingAnimation stage={state} />
          )}

          {state === 'complete' && results && (
            <ResultsDisplay results={results} imagePreview={imagePreview} />
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
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
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
              Powered by Hugging Face BLIP-2, Claude AI, and Qloo Taste Intelligence
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