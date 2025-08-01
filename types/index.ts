// types/index.ts
export interface ImageAnalysisResult {
  description: string;
  confidence: number;
}

export interface VibeAnalysis {
  primaryVibe: string;
  secondaryVibes: string[];
  culturalContext: string;
  aestheticKeywords: string[];
  moodDescriptors: string[];
}

export interface Recommendation {
  category: 'music' | 'activities' | 'restaurants' | 'experiences';
  items: RecommendationItem[];
}

export interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  reason: string;
  confidence: number;
  tags: string[];
}

export interface VibeValidationResponse {
  imageDescription: string;
  vibeAnalysis: VibeAnalysis;
  recommendations: Recommendation[];
  processingTime: number;
}

// New Movie-related interfaces
export interface MovieAnalysis {
  summary: string;
  themes: string[];
  genres: string[];
  culturalKeywords: string[];
}

export interface MovieVibeParameters {
  audiences: string[];
  tags: string[];
  entityType: string;
}

export interface SimilarMovie {
  title: string;
  description: string;
  year?: number;
  rating?: number;
  matchScore: number;
  reason: string;
  sharedElements: string[];
  qloo_data?: {
    entity_id: string;
    type: string;
  };
}

export interface MovieVibeResponse {
  movieAnalysis: MovieAnalysis;
  vibeParameters: MovieVibeParameters;
  similarMovies: SimilarMovie[];
  processingTime: number;
}

export interface APIError {
  error: string;
  details?: string;
  code?: string;
}