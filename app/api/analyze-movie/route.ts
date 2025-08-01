// app/api/analyze-movie/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { MovieVibeResponse, APIError, MovieAnalysis, MovieVibeParameters, SimilarMovie } from '../../../types';

// Hugging Face models for movie analysis - using more powerful models
const HF_MOVIE_ANALYSIS_MODEL = 'https://api-inference.huggingface.co/models/moonshotai/Kimi-K2-Instruct';
const HF_BACKUP_MODEL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
const HF_ALTERNATIVE_MODEL = 'https://api-inference.huggingface.co/models/google/flan-t5-large';

async function analyzeMovieWithHF(movieName: string) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('Missing Hugging Face API key');
  }

  console.log('🎬 Analyzing movie with Hugging Face:', movieName);

  // Try multiple models in order of preference
  const models = [HF_MOVIE_ANALYSIS_MODEL, HF_BACKUP_MODEL, HF_ALTERNATIVE_MODEL];
  
  for (const model of models) {
    try {
      const result = await tryMovieAnalysisWithModel(movieName, model);
      if (result && result.summary && result.summary.length > 20) {
        console.log(`✅ Successfully analyzed with model: ${model}`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Model ${model} failed, trying next...`);
      continue;
    }
  }

  // If all HF models fail, use intelligent analysis
  console.log('📝 All HF models failed, using intelligent analysis');
  return intelligentMovieAnalysis(movieName);
}

async function tryMovieAnalysisWithModel(movieName: string, modelUrl: string) {
  const isLlamaModel = modelUrl.includes('llama') || modelUrl.includes('mistral');
  
  let prompt;
  if (isLlamaModel) {
    // Format for Llama/Mistral models
    prompt = `<s>[INST] You are a movie expert. Analyze the movie "${movieName}" and provide a comprehensive analysis.

Please provide detailed information about:
1. A brief plot summary (2-3 sentences)
2. Main themes (3-5 key themes)
3. Primary genres (2-4 genres)
4. Cultural keywords and elements (3-5 keywords)
5. Target audience and demographics

Respond in this exact JSON format:
{
  "summary": "brief plot summary here",
  "themes": ["theme1", "theme2", "theme3"],
  "genres": ["genre1", "genre2"],
  "culturalKeywords": ["keyword1", "keyword2", "keyword3"]
}

Only respond with valid JSON, no additional text. [/INST]`;
  } else {
    // Format for T5 and other models
    prompt = `Analyze the movie "${movieName}". Provide a JSON response with summary, themes array, genres array, and culturalKeywords array. Movie analysis:`;
  }

  const response = await fetch(modelUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: isLlamaModel ? 400 : 250,
        temperature: 0.3,
        do_sample: true,
        top_p: 0.9,
        return_full_text: false,
        stop: isLlamaModel ? ["</s>", "[INST]"] : undefined
      }
    }),
  });

  console.log(`📡 ${modelUrl} response status:`, response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ ${modelUrl} error:`, errorText);
    throw new Error(`Model API error: ${response.status}`);
  }

  const result = await response.json();
  console.log(`📦 ${modelUrl} result:`, JSON.stringify(result, null, 2));

  let generatedText = '';
  if (Array.isArray(result) && result.length > 0) {
    generatedText = result[0].generated_text || '';
  } else if (typeof result === 'object' && result.generated_text) {
    generatedText = result.generated_text;
  }

  // Try to parse JSON from the response
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.summary && parsed.themes && parsed.genres && parsed.culturalKeywords) {
        return parsed;
      }
    } catch (parseError) {
      console.log('JSON parse failed, trying text parsing...');
    }
  }

  // Fallback: parse the text response manually
  return parseMovieAnalysisFromText(generatedText, movieName);
}

function intelligentMovieAnalysis(movieName: string): any {
  console.log('📝 Using intelligent movie analysis for:', movieName);
  
  // Basic movie database - in a real app, you'd use TMDB API or similar
  const movieDatabase: Record<string, any> = {
    'blade runner 2049': {
      summary: 'A visually stunning sci-fi masterpiece exploring themes of identity, humanity, and what it means to be alive in a dystopian future.',
      themes: ['identity', 'humanity', 'artificial intelligence', 'dystopia', 'existentialism'],
      genres: ['sci-fi', 'drama', 'thriller'],
      culturalKeywords: ['cyberpunk', 'neo-noir', 'philosophical', 'visual spectacle', 'Denis Villeneuve']
    },
    'the grand budapest hotel': {
      summary: 'A whimsical and meticulously crafted comedy-drama about friendship, loyalty, and the end of an era, told through Wes Anderson\'s distinctive visual style.',
      themes: ['friendship', 'nostalgia', 'European culture', 'class', 'loyalty'],
      genres: ['comedy', 'drama', 'adventure'],
      culturalKeywords: ['Wes Anderson', 'symmetrical', 'pastel colors', 'European', 'whimsical']
    },
    'spirited away': {
      summary: 'A magical coming-of-age story about a young girl navigating a spirit world, exploring themes of environmentalism, family, and growing up.',
      themes: ['coming of age', 'environmentalism', 'family', 'courage', 'tradition vs modernity'],
      genres: ['animation', 'fantasy', 'family'],
      culturalKeywords: ['Studio Ghibli', 'Japanese folklore', 'hand-drawn animation', 'Miyazaki', 'magical realism']
    },
    'parasite': {
      summary: 'A darkly comic thriller examining class inequality and social stratification through the story of two families from different economic backgrounds.',
      themes: ['class struggle', 'inequality', 'social commentary', 'family dynamics', 'survival'],
      genres: ['thriller', 'drama', 'dark comedy'],
      culturalKeywords: ['Korean cinema', 'Bong Joon-ho', 'social inequality', 'dark humor', 'architectural symbolism']
    }
  };

  const lowerMovieName = movieName.toLowerCase();
  
  // Check if we have specific data for this movie
  if (movieDatabase[lowerMovieName]) {
    return movieDatabase[lowerMovieName];
  }

  // Generate intelligent fallback based on movie name patterns
  return generateFallbackAnalysis(movieName);
}

function generateFallbackAnalysis(movieName: string): any {
  // Basic pattern matching for common movie types
  const lowerName = movieName.toLowerCase();
  
  let themes = ['drama', 'character development'];
  let genres = ['drama'];
  let culturalKeywords = ['cinematic', 'storytelling'];
  
  // Pattern-based analysis
  if (lowerName.includes('star') || lowerName.includes('space') || lowerName.includes('galaxy')) {
    themes.push('adventure', 'heroism', 'good vs evil');
    genres.push('sci-fi', 'adventure');
    culturalKeywords.push('space opera', 'special effects');
  } else if (lowerName.includes('love') || lowerName.includes('heart')) {
    themes.push('romance', 'relationships', 'love');
    genres.push('romance', 'drama');
    culturalKeywords.push('romantic', 'emotional');
  } else if (lowerName.includes('dark') || lowerName.includes('night')) {
    themes.push('mystery', 'suspense', 'psychological');
    genres.push('thriller', 'mystery');
    culturalKeywords.push('atmospheric', 'noir');
  }
  
  return {
    summary: `A compelling ${genres[0]} that explores themes of ${themes.slice(0, 3).join(', ')}, offering audiences a thoughtful cinematic experience.`,
    themes: themes.slice(0, 5),
    genres: genres.slice(0, 3),
    culturalKeywords: culturalKeywords.slice(0, 5)
  };
}

function parseMovieAnalysis(analysisText: string, movieName: string): any {
  // Extract themes, genres, and keywords from the generated text
  const themes = extractListFromText(analysisText, ['theme', 'explores', 'about', 'deals with']);
  const genres = extractGenres(analysisText);
  const culturalKeywords = extractCulturalKeywords(analysisText);
  
  return {
    summary: analysisText.substring(0, 200) + '...',
    themes: themes.length > 0 ? themes : ['drama', 'human nature'],
    genres: genres.length > 0 ? genres : ['drama'],
    culturalKeywords: culturalKeywords.length > 0 ? culturalKeywords : ['cinematic', 'artistic']
  };
}

function extractListFromText(text: string, keywords: string[]): string[] {
  const items: string[] = [];
  const sentences = text.toLowerCase().split(/[.!?]/);
  
  sentences.forEach(sentence => {
    keywords.forEach(keyword => {
      if (sentence.includes(keyword)) {
        // Simple extraction of potential themes
        const words = sentence.split(' ');
        words.forEach(word => {
          if (word.length > 3 && !['the', 'and', 'that', 'with', 'this'].includes(word)) {
            items.push(word.replace(/[^a-zA-Z]/g, ''));
          }
        });
      }
    });
  });
  
  return [...new Set(items)].slice(0, 5);
}

function extractGenres(text: string): string[] {
  const commonGenres = [
    'action', 'adventure', 'comedy', 'drama', 'horror', 'mystery', 'romance', 
    'sci-fi', 'thriller', 'fantasy', 'animation', 'documentary', 'musical'
  ];
  
  const foundGenres = commonGenres.filter(genre => 
    text.toLowerCase().includes(genre) || text.toLowerCase().includes(genre.replace('-', ' '))
  );
  
  return foundGenres.length > 0 ? foundGenres : ['drama'];
}

function extractCulturalKeywords(text: string): string[] {
  const culturalTerms = [
    'visual', 'cinematic', 'artistic', 'cultural', 'social', 'emotional',
    'psychological', 'philosophical', 'symbolic', 'narrative', 'aesthetic'
  ];
  
  const foundTerms = culturalTerms.filter(term => text.toLowerCase().includes(term));
  return foundTerms.length > 0 ? foundTerms : ['cinematic', 'artistic'];
}

function generateVibeParameters(movieAnalysis: any): any {
  const { themes, genres, culturalKeywords } = movieAnalysis;
  
  // Map themes and genres to Qloo-style parameters
  const audienceMap: Record<string, string[]> = {
    'sci-fi': ['tech enthusiasts', 'sci-fi fans', 'young adults'],
    'romance': ['couples', 'young adults', 'date night'],
    'action': ['action fans', 'young males', 'thrill seekers'],
    'drama': ['general audience', 'film enthusiasts', 'mature viewers'],
    'comedy': ['general audience', 'young adults', 'family'],
    'horror': ['horror fans', 'young adults', 'thrill seekers'],
    'fantasy': ['fantasy fans', 'young adults', 'escapism seekers']
  };
  
  const audiences: string[] = [];
  genres.forEach((genre: string) => {
    if (audienceMap[genre]) {
      audiences.push(...audienceMap[genre]);
    }
  });
  
  // Generate tags from themes and cultural keywords
  const tags = [...themes, ...culturalKeywords, ...genres].map(tag => 
    tag.toLowerCase().replace(/\s+/g, '_')
  );
  
  return {
    audiences: [...new Set(audiences)].slice(0, 5),
    tags: [...new Set(tags)].slice(0, 10),
    entityType: 'urn:entity:movie'
  };
}



async function getSimilarMoviesFromQloo(vibeParameters: any, originalMovie: string) {
  if (!process.env.QLOO_API_KEY) {
    console.log('⚠️ No Qloo API key provided, using fallback movies');
    return getFallbackSimilarMovies(vibeParameters, originalMovie);
  }

  console.log('🔍 Fetching similar movies from Qloo with vibe parameters:', vibeParameters);
  
  try {
    // Build the Qloo API request with proper vibe-based parameters
    const params = new URLSearchParams();
    params.append('filter.type', 'urn:entity:movie');
    
    // Use the strongest signal first - interests based on primary vibe
    const primaryVibe = vibeParameters.primaryMood || 'emotional';
    const vibeIntensity = vibeParameters.vibeIntensity || 'medium';
    
    // Map vibe characteristics to Qloo signals
    if (vibeParameters.audiences && vibeParameters.audiences.length > 0) {
      // Use the most relevant audience
      params.append('signal.demographics.audiences', vibeParameters.audiences[0]);
      console.log('🎯 Using audience signal:', vibeParameters.audiences[0]);
    }
    
    // Add tag-based interests
    if (vibeParameters.tags && vibeParameters.tags.length > 0) {
      const qlooTags = vibeParameters.tags.slice(0, 3).map((tag: string) => 
        `urn:tag:keyword:media:${tag.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
      );
      params.append('signal.interests.tags', qlooTags.join(','));
      console.log('🏷️ Using tag signals:', qlooTags);
    }
    
    // Add location for better results
    params.append('signal.location.query', 'United States');
    params.append('limit', '8');
    
    const url = `https://hackathon.api.qloo.com/v2/insights/?${params.toString()}`;
    console.log('🌐 Qloo API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.QLOO_API_KEY!,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Qloo API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Qloo API error:', errorText);
      
      // Try simpler approach with just location and primary genre
      return await trySimplifiedQlooQuery(vibeParameters, originalMovie);
    }

    const data = await response.json();
    console.log('📦 Qloo movies response entities count:', data.results?.entities?.length || 0);
    
    const movies = data.results?.entities || [];
    
    if (movies.length === 0) {
      console.log('⚠️ No movies returned from Qloo, trying simplified query');
      return await trySimplifiedQlooQuery(vibeParameters, originalMovie);
    }
    
    const filteredMovies = movies
      .filter((movie: any) => movie.name?.toLowerCase() !== originalMovie.toLowerCase())
      .map((movie: any) => transformQlooMovieResponse(movie, vibeParameters))
      .slice(0, 6);
      
    console.log('✅ Successfully processed', filteredMovies.length, 'movie recommendations');
    return filteredMovies;
      
  } catch (error) {
    console.error('❌ Qloo movie search failed:', error);
    return getFallbackSimilarMovies(vibeParameters, originalMovie);
  }
}

async function trySimplifiedQlooQuery(vibeParameters: any, originalMovie: string) {
  console.log('🔄 Trying simplified Qloo query...');
  
  try {
    const params = new URLSearchParams();
    params.append('filter.type', 'urn:entity:movie');
    params.append('signal.location.query', 'United States');
    
    // Use just the primary genre/theme as a simple query
    const primaryTag = vibeParameters.tags[0] || 'drama';
    params.append('query', primaryTag);
    params.append('limit', '8');
    
    const url = `https://hackathon.api.qloo.com/v2/insights/?${params.toString()}`;
    console.log('🌐 Simplified Qloo API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.QLOO_API_KEY!,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const movies = data.results?.entities || [];
      
      if (movies.length > 0) {
        console.log('✅ Simplified query successful with', movies.length, 'results');
        return movies
          .filter((movie: any) => movie.name?.toLowerCase() !== originalMovie.toLowerCase())
          .map((movie: any) => transformQlooMovieResponse(movie, vibeParameters))
          .slice(0, 6);
      }
    }
    
    throw new Error('Simplified query also failed');
    
  } catch (error) {
    console.log('❌ Simplified query failed, using vibe-based fallback movies');
    return getFallbackSimilarMovies(vibeParameters, originalMovie);
  }
}

function transformQlooMovieResponse(qlooMovie: any, vibeParameters: any): any {
  const title = qlooMovie.name || 'Unknown Movie';
  const description = qlooMovie.properties?.description || 'A compelling film experience';
  const year = qlooMovie.properties?.release_year || null;
  const rating = qlooMovie.properties?.rating || null;
  
  // Calculate match score based on shared elements
  const movieKeywords = qlooMovie.properties?.keywords?.map((k: any) => k.name.toLowerCase()) || [];
  const vibeKeywords = vibeParameters.tags.map((t: string) => t.toLowerCase());
  
  const sharedElements = movieKeywords.filter((keyword: string) =>
    vibeKeywords.some((vibeKeyword: string) => 
      keyword.includes(vibeKeyword) || vibeKeyword.includes(keyword)
    )
  );
  
  const matchScore = Math.min(0.95, 0.6 + (sharedElements.length * 0.08));
  
  const reason = generateMovieMatchReason(title, sharedElements, vibeParameters);
  
  return {
    title,
    description,
    year,
    rating,
    matchScore,
    reason,
    sharedElements: sharedElements.length > 0 ? sharedElements : vibeParameters.tags.slice(0, 3),
    qloo_data: {
      entity_id: qlooMovie.entity_id,
      type: qlooMovie.type
    }
  };
}

function generateMovieMatchReason(title: string, sharedElements: string[], vibeParameters: any): string {
  if (sharedElements.length > 2) {
    return `${title} shares key thematic elements including ${sharedElements.slice(0, 2).join(', ')}, making it a strong match for similar audiences`;
  } else if (sharedElements.length > 0) {
    return `${title} resonates with similar ${sharedElements[0]} themes and cultural sensibilities`;
  } else {
    return `${title} appeals to similar audiences interested in ${vibeParameters.audiences[0] || 'thoughtful cinema'}`;
  }
}

function getFallbackSimilarMovies(vibeParameters: any, originalMovie: string): any[] {
  console.log('📝 Generating vibe-based fallback recommendations for:', originalMovie);
  console.log('🎭 Using vibe parameters:', vibeParameters);
  
  const { primaryMood, vibeIntensity, tags } = vibeParameters;
  
  // Comprehensive movie database organized by vibes
  const moviesByVibe: Record<string, any[]> = {
    // Sci-Fi & Futuristic Vibes
    'sci-fi': [
      { title: 'Blade Runner 2049', year: 2017, description: 'Visually stunning cyberpunk sequel exploring identity and humanity', vibeMatch: ['futuristic', 'philosophical', 'visual'] },
      { title: 'Arrival', year: 2016, description: 'Thoughtful alien contact film about communication and time', vibeMatch: ['cerebral', 'emotional', 'sci-fi'] },
      { title: 'Ex Machina', year: 2014, description: 'Intimate AI thriller about consciousness and humanity', vibeMatch: ['psychological', 'sci-fi', 'philosophical'] },
      { title: 'Interstellar', year: 2014, description: 'Epic space odyssey about love transcending dimensions', vibeMatch: ['epic', 'emotional', 'sci-fi'] },
      { title: 'Her', year: 2013, description: 'Romantic drama about human-AI relationship', vibeMatch: ['romantic', 'futuristic', 'emotional'] }
    ],
    
    // Action & Intense Vibes
    'action': [
      { title: 'Mad Max: Fury Road', year: 2015, description: 'High-octane post-apocalyptic action masterpiece', vibeMatch: ['intense', 'visual', 'action'] },
      { title: 'John Wick', year: 2014, description: 'Stylish revenge thriller with incredible action choreography', vibeMatch: ['stylish', 'intense', 'action'] },
      { title: 'The Raid', year: 2011, description: 'Brutal martial arts action film in confined setting', vibeMatch: ['intense', 'martial_arts', 'action'] },
      { title: 'Baby Driver', year: 2017, description: 'Music-driven heist film with kinetic energy', vibeMatch: ['stylish', 'musical', 'action'] }
    ],
    
    // Romance & Emotional Vibes
    'romance': [
      { title: 'La La Land', year: 2016, description: 'Modern musical about love and dreams in Los Angeles', vibeMatch: ['romantic', 'musical', 'emotional'] },
      { title: 'Call Me By Your Name', year: 2017, description: 'Beautiful coming-of-age romance set in Italy', vibeMatch: ['romantic', 'coming_of_age', 'emotional'] },
      { title: 'The Shape of Water', year: 2017, description: 'Fantasy romance between woman and amphibian creature', vibeMatch: ['romantic', 'fantasy', 'unique'] },
      { title: 'Eternal Sunshine of the Spotless Mind', year: 2004, description: 'Unique romance about memory and love', vibeMatch: ['romantic', 'psychological', 'unique'] }
    ],
    
    // Dark & Psychological Vibes
    'thriller': [
      { title: 'Gone Girl', year: 2014, description: 'Psychological thriller about marriage and deception', vibeMatch: ['psychological', 'dark', 'thriller'] },
      { title: 'Zodiac', year: 2007, description: 'Meticulous procedural about the Zodiac killer investigation', vibeMatch: ['dark', 'investigative', 'psychological'] },
      { title: 'Prisoners', year: 2013, description: 'Intense thriller about desperate father searching for daughter', vibeMatch: ['intense', 'dark', 'thriller'] },
      { title: 'Shutter Island', year: 2010, description: 'Psychological thriller set in mysterious psychiatric facility', vibeMatch: ['psychological', 'mystery', 'dark'] }
    ],
    
    // Drama & Character-Driven Vibes
    'drama': [
      { title: 'Manchester by the Sea', year: 2016, description: 'Deeply emotional drama about grief and family', vibeMatch: ['emotional', 'family', 'drama'] },
      { title: 'Moonlight', year: 2016, description: 'Beautiful coming-of-age story told in three acts', vibeMatch: ['coming_of_age', 'emotional', 'character_study'] },
      { title: 'There Will Be Blood', year: 2007, description: 'Epic character study of greed and ambition', vibeMatch: ['character_study', 'epic', 'dark'] },
      { title: 'The Social Network', year: 2010, description: 'Sharp drama about Facebook\'s creation and betrayal', vibeMatch: ['character_study', 'modern', 'drama'] }
    ],
    
    // Comedy & Light Vibes
    'comedy': [
      { title: 'The Grand Budapest Hotel', year: 2014, description: 'Whimsical Wes Anderson comedy about European hotel', vibeMatch: ['whimsical', 'visual', 'comedy'] },
      { title: 'Knives Out', year: 2019, description: 'Clever whodunit with excellent ensemble cast', vibeMatch: ['clever', 'ensemble', 'mystery'] },
      { title: 'Hunt for the Wilderpeople', year: 2016, description: 'Heartwarming New Zealand adventure comedy', vibeMatch: ['heartwarming', 'adventure', 'comedy'] }
    ],
    
    // Horror & Suspense Vibes
    'horror': [
      { title: 'Hereditary', year: 2018, description: 'Deeply unsettling family horror about grief and trauma', vibeMatch: ['psychological', 'family', 'horror'] },
      { title: 'Get Out', year: 2017, description: 'Social thriller combining horror with racial commentary', vibeMatch: ['social', 'psychological', 'horror'] },
      { title: 'The Witch', year: 2015, description: 'Period horror about Puritan family and witchcraft', vibeMatch: ['atmospheric', 'period', 'horror'] }
    ],
    
    // Fantasy & Magical Vibes
    'fantasy': [
      { title: 'Pan\'s Labyrinth', year: 2006, description: 'Dark fairy tale blending reality and fantasy', vibeMatch: ['fantasy', 'dark', 'magical'] },
      { title: 'The Shape of Water', year: 2017, description: 'Romantic fantasy about love conquering difference', vibeMatch: ['romantic', 'fantasy', 'unique'] },
      { title: 'Amélie', year: 2001, description: 'Whimsical French film about joy and human connection', vibeMatch: ['whimsical', 'heartwarming', 'french'] }
    ]
  };
  
  // Find movies that match the detected vibe
  let selectedMovies: any[] = [];
  
  // First, try to match based on primary tags
  tags.forEach((tag: string) => {
    if (moviesByVibe[tag]) {
      selectedMovies.push(...moviesByVibe[tag]);
    }
  });
  
  // If no direct matches, try related vibes based on mood
  if (selectedMovies.length === 0) {
    const moodToVibes: Record<string, string[]> = {
      'dark': ['thriller', 'horror', 'drama'],
      'intense': ['action', 'thriller'],
      'emotional': ['drama', 'romance'],
      'light': ['comedy', 'fantasy'],
      'atmospheric': ['thriller', 'horror', 'sci-fi']
    };
    
    if (primaryMood && moodToVibes[primaryMood]) {
      moodToVibes[primaryMood].forEach(vibe => {
        if (moviesByVibe[vibe]) {
          selectedMovies.push(...moviesByVibe[vibe]);
        }
      });
    }
  }
  
  // Fallback to drama if still no matches
  if (selectedMovies.length === 0) {
    selectedMovies = moviesByVibe['drama'];
  }
  
  // Remove duplicates and the original movie
  const uniqueMovies = selectedMovies
    .filter((movie, index, self) => 
      movie.title.toLowerCase() !== originalMovie.toLowerCase() &&
      index === self.findIndex(m => m.title === movie.title)
    )
    .slice(0, 6);
  
  // Add match scores and reasons based on vibe alignment
  return uniqueMovies.map((movie, index) => {
    const sharedVibeElements = movie.vibeMatch.filter((vibe: string) => 
      tags.some((tag: string) => tag.includes(vibe) || vibe.includes(tag))
    );
    
    const matchScore = Math.max(0.6, 0.8 - (index * 0.03) + (sharedVibeElements.length * 0.05));
    
    const reason = sharedVibeElements.length > 0 
      ? `Shares ${sharedVibeElements.join(', ')} vibes with similar ${primaryMood || 'emotional'} tone`
      : `Matches the ${primaryMood || 'emotional'} and ${vibeIntensity || 'medium'} intensity vibe`;
    
    return {
      title: movie.title,
      description: movie.description,
      year: movie.year,
      rating: 7.0 + Math.random() * 2.5, // Simulated rating
      matchScore,
      reason,
      sharedElements: sharedVibeElements.length > 0 ? sharedVibeElements : tags.slice(0, 3)
    };
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== Starting movie analysis ===');
    const { movieName } = await request.json();

    if (!movieName) {
      console.error('No movie name provided');
      return NextResponse.json(
        { error: 'No movie name provided' } as APIError,
        { status: 400 }
      );
    }

    // Check API keys
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('Missing HUGGINGFACE_API_KEY');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Hugging Face API key' } as APIError,
        { status: 500 }
      );
    }

    // Step 1: Analyze movie with Hugging Face
    console.log('Step 1: Analyzing movie with Hugging Face...');
    let movieAnalysis;
    try {
      movieAnalysis = await analyzeMovieWithHF(movieName);
      console.log('✅ Movie analysis:', movieAnalysis);
    } catch (error) {
      console.error('❌ Hugging Face movie analysis failed:', error);
      movieAnalysis = intelligentMovieAnalysis(movieName);
      console.log('📝 Using fallback movie analysis');
    }

    // Step 2: Generate vibe parameters
    console.log('Step 2: Generating vibe parameters...');
    const vibeParameters = generateVibeParameters(movieAnalysis);
    console.log('✅ Vibe parameters:', vibeParameters);

    // Step 3: Get similar movies from Qloo
    console.log('Step 3: Getting similar movies...');
    let similarMovies;
    try {
      similarMovies = await getSimilarMoviesFromQloo(vibeParameters, movieName);
      console.log('✅ Similar movies received:', similarMovies.length);
    } catch (error) {
      console.error('❌ Movie recommendations failed:', error);
      similarMovies = getFallbackSimilarMovies(vibeParameters, movieName);
      console.log('📝 Using fallback movie recommendations');
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Total processing time: ${processingTime}ms`);

    const response: MovieVibeResponse = {
      movieAnalysis,
      vibeParameters,
      similarMovies,
      processingTime
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Critical error in movie analysis:', error);
    
    const errorResponse: APIError = {
      error: 'Movie analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'MOVIE_ANALYSIS_ERROR'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}