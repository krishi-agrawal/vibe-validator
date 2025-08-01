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

export interface APIError {
  error: string;
  details?: string;
  code?: string;
}