import { NextRequest, NextResponse } from 'next/server';
import type { VibeValidationResponse, APIError } from '../../../types';

// Hugging Face models
const HF_IMAGE_MODEL = 'https://api-inference.huggingface.co/models/Salesforce/blip2-opt-2.7b';
const HF_TEXT_MODEL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
const HF_CULTURAL_MODEL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf';

async function analyzeImageWithHF(imageBase64: string) {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('Missing Hugging Face API key');
  }

  console.log('🔍 Calling Hugging Face BLIP-2...');
  
  const response = await fetch(HF_IMAGE_MODEL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: imageBase64,
      parameters: {
        max_new_tokens: 150,
        do_sample: true,
        temperature: 0.7,
        top_p: 0.9
      }
    }),
  });

  console.log('📡 HF Image API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ HF Image API error response:', errorText);
    throw new Error(`Hugging Face Image API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('📦 HF Image API raw result:', JSON.stringify(result, null, 2));
  
  // Handle different response formats from HF
  if (Array.isArray(result) && result.length > 0) {
    const description = result[0].generated_text || result[0].caption || result[0].text || 'Unable to analyze image';
    console.log('✅ Extracted description:', description);
    return description;
  }
  
  if (typeof result === 'object' && result.generated_text) {
    console.log('✅ Extracted description:', result.generated_text);
    return result.generated_text;
  }
  
  if (typeof result === 'object' && result.error) {
    throw new Error(`Hugging Face error: ${result.error}`);
  }
  
  console.log('⚠️ Unexpected HF response format, using fallback');
  return 'A space requiring cultural analysis';
}

async function analyzeVibeWithHF(imageDescription: string) {
  const prompt = `Analyze this space description for cultural vibes and aesthetics: "${imageDescription}"

Task: Extract cultural and aesthetic information from this description and format as JSON.

Please identify:
- Primary aesthetic style (e.g., "modern minimalist", "vintage bohemian", "industrial chic")
- Secondary style elements
- Cultural context and meaning
- Aesthetic keywords
- Mood descriptors

Respond with only a JSON object in this exact format:
{
  "primaryVibe": "main aesthetic style",
  "secondaryVibes": ["secondary", "style", "elements"],
  "culturalContext": "brief cultural meaning explanation",
  "aestheticKeywords": ["style", "design", "keywords"],
  "moodDescriptors": ["emotional", "mood", "words"]
}`;

  try {
    // Try Llama-2 first (better for structured tasks)
    const response = await fetch(HF_CULTURAL_MODEL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.3,
          do_sample: true,
          top_p: 0.7,
          return_full_text: false
        }
      }),
    });

    if (response.ok) {
      const result = await response.json();
      let generatedText = '';
      
      if (Array.isArray(result) && result.length > 0) {
        generatedText = result[0].generated_text || '';
      } else if (typeof result === 'object' && result.generated_text) {
        generatedText = result.generated_text;
      }

      // Try to extract JSON from response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('JSON parse failed, using fallback analysis');
        }
      }
    }
  } catch (error) {
    console.log('Llama model failed, using fallback analysis');
  }

  // Fallback: Intelligent parsing based on keywords in description
  return intelligentVibeAnalysis(imageDescription);
}

function intelligentVibeAnalysis(description: string): any {
  const lowerDesc = description.toLowerCase();
  
  // Define vibe patterns
  const vibePatterns = {
    'modern minimalist': ['clean', 'simple', 'white', 'minimal', 'contemporary', 'sleek'],
    'vintage rustic': ['wood', 'rustic', 'vintage', 'old', 'traditional', 'antique'],
    'industrial chic': ['metal', 'industrial', 'concrete', 'steel', 'urban', 'loft'],
    'bohemian eclectic': ['colorful', 'artistic', 'eclectic', 'plants', 'textiles', 'boho'],
    'luxury elegant': ['elegant', 'luxury', 'gold', 'marble', 'expensive', 'refined'],
    'cozy casual': ['cozy', 'comfortable', 'warm', 'casual', 'soft', 'relaxed'],
    'contemporary sophisticated': ['modern', 'sophisticated', 'stylish', 'designed', 'curated']
  };

  // Find best matching vibe
  let bestVibe = 'contemporary';
  let bestScore = 0;

  for (const [vibe, keywords] of Object.entries(vibePatterns)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (lowerDesc.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestVibe = vibe;
    }
  }

  // Extract aesthetic keywords from description
  const aestheticWords = [
    'modern', 'vintage', 'rustic', 'elegant', 'minimal', 'colorful', 'dark', 'bright',
    'wooden', 'metal', 'glass', 'fabric', 'leather', 'stone', 'ceramic', 'plastic',
    'clean', 'messy', 'organized', 'artistic', 'functional', 'decorative'
  ];
  
  const foundKeywords = aestheticWords.filter(word => lowerDesc.includes(word));
  
  // Generate mood descriptors
  const moodMappings = {
    'modern minimalist': ['calm', 'focused', 'serene'],
    'vintage rustic': ['nostalgic', 'warm', 'homey'],
    'industrial chic': ['edgy', 'urban', 'creative'],
    'bohemian eclectic': ['free-spirited', 'artistic', 'vibrant'],
    'luxury elegant': ['sophisticated', 'refined', 'exclusive'],
    'cozy casual': ['comfortable', 'relaxed', 'intimate'],
    'contemporary sophisticated': ['polished', 'trendy', 'confident']
  };

  const secondaryVibes = vibePatterns[bestVibe as keyof typeof vibePatterns] || ['contemporary', 'stylish'];
  const moodDescriptors = moodMappings[bestVibe as keyof typeof moodMappings] || ['modern', 'appealing'];

  return {
    primaryVibe: bestVibe,
    secondaryVibes: secondaryVibes.slice(0, 3),
    culturalContext: `This space embodies a ${bestVibe} aesthetic, reflecting contemporary design sensibilities and cultural preferences for ${moodDescriptors.join(', ')} environments.`,
    aestheticKeywords: foundKeywords.length > 0 ? foundKeywords.slice(0, 5) : ['contemporary', 'designed'],
    moodDescriptors: moodDescriptors
  };
}

async function getRecommendationsFromQloo(vibeAnalysis: any, location: string = 'New York') {
  if (!process.env.QLOO_API_KEY) {
    console.log('⚠️ No Qloo API key provided, using fallback');
    return getFallbackRecommendations(vibeAnalysis);
  }

  console.log('🔍 Starting Qloo API integration...');
  const { aestheticKeywords, primaryVibe, moodDescriptors } = vibeAnalysis;
  const recommendations = [];

  // Simplified categories for better success rate
  const categories = [
    { 
      type: 'urn:entity:place', 
      category: 'restaurants', 
      queryTerms: ['restaurant', 'dining'] 
    },
    { 
      type: 'urn:entity:place', 
      category: 'experiences', 
      queryTerms: ['venue', 'attraction'] 
    }
  ];

  for (const categoryConfig of categories) {
    try {
      console.log(`🔍 Fetching ${categoryConfig.category} from Qloo...`);
      const items = await fetchQlooRecommendations(
        categoryConfig.type,
        categoryConfig.queryTerms,
        aestheticKeywords.slice(0, 2), // Limit keywords to avoid long URLs
        location
      );
      
      recommendations.push({
        category: categoryConfig.category,
        items: items.map(item => transformQlooResponse(item, vibeAnalysis)).slice(0, 2)
      });
      
      console.log(`✅ Got ${items.length} ${categoryConfig.category} recommendations`);
    } catch (error) {
      console.error(`❌ Error fetching ${categoryConfig.category}:`, error);
      // Add fallback category data
      recommendations.push({
        category: categoryConfig.category,
        items: getFallbackCategoryItems(categoryConfig.category, vibeAnalysis)
      });
    }
  }

  // Add music and activities as fallback (since Qloo music API might be different)
  recommendations.push({
    category: 'music',
    items: getFallbackCategoryItems('music', vibeAnalysis)
  });
  
  recommendations.push({
    category: 'activities',
    items: getFallbackCategoryItems('activities', vibeAnalysis)
  });

  return recommendations;
}

// Fallback recommendation functions
function getFallbackRecommendations(vibeAnalysis: any) {
  console.log('📝 Generating fallback recommendations');
  const categories = ['restaurants', 'activities', 'music', 'experiences'];
  return categories.map(category => ({
    category,
    items: getFallbackCategoryItems(category, vibeAnalysis)
  }));
}

function getFallbackCategoryItems(category: string, vibeAnalysis: any) {
  const { primaryVibe, aestheticKeywords, moodDescriptors } = vibeAnalysis;
  
  const fallbackData: Record<string, any[]> = {
    restaurants: [
      {
        id: '1',
        name: `${primaryVibe.charAt(0).toUpperCase() + primaryVibe.slice(1)} Bistro`,
        description: `A restaurant that embodies ${primaryVibe} dining with ${aestheticKeywords.join(', ')} elements`,
        reason: `Matches your ${primaryVibe} aesthetic with sophisticated ambiance`,
        confidence: 0.75,
        tags: Array.from(new Set([...aestheticKeywords.slice(0, 3), 'dining', 'restaurant'])),
        rating: 4.2
      },
      {
        id: '2',
        name: `The ${moodDescriptors[0] || 'Contemporary'} Table`,
        description: `Contemporary dining space reflecting ${moodDescriptors.join(', ')} atmosphere`,
        reason: `Complements the ${primaryVibe} vibe with curated dining experience`,
        confidence: 0.72,
        tags: Array.from(new Set([...moodDescriptors.slice(0, 2), 'contemporary', 'dining'])),
        rating: 4.0
      }
    ],
    music: [
      {
        id: '1',
        name: `${primaryVibe.charAt(0).toUpperCase() + primaryVibe.slice(1)} Playlist`,
        description: `Curated music selection perfect for ${primaryVibe} spaces`,
        reason: `Sound design that complements ${primaryVibe} aesthetics`,
        confidence: 0.80,
        tags: Array.from(new Set([...aestheticKeywords.slice(0, 2), 'playlist', 'ambient'])),
        rating: 4.5
      },
      {
        id: '2',
        name: `${moodDescriptors[0] || 'Contemporary'} Soundscape`,
        description: `Audio experiences that match ${moodDescriptors.join(', ')} moods`,
        reason: `Musical elements that enhance the ${primaryVibe} atmosphere`,
        confidence: 0.76,
        tags: Array.from(new Set([...moodDescriptors.slice(0, 2), 'soundscape', 'ambient'])),
        rating: 4.3
      }
    ],
    activities: [
      {
        id: '1',
        name: `${primaryVibe.charAt(0).toUpperCase() + primaryVibe.slice(1)} Gallery Experience`,
        description: `Cultural activities that celebrate ${primaryVibe} aesthetics`,
        reason: `Activities aligned with ${primaryVibe} cultural sensibilities`,
        confidence: 0.78,
        tags: Array.from(new Set([...aestheticKeywords.slice(0, 3), 'culture', 'gallery'])),
        rating: 4.4
      },
      {
        id: '2',
        name: `${moodDescriptors[0] || 'Contemporary'} Workshop`,
        description: `Hands-on experiences in ${moodDescriptors.join(', ')} environments`,
        reason: `Interactive activities that match your ${primaryVibe} preferences`,
        confidence: 0.74,
        tags: Array.from(new Set([...moodDescriptors.slice(0, 2), 'workshop', 'creative'])),
        rating: 4.1
      }
    ],
    experiences: [
      {
        id: '1',
        name: `${primaryVibe.charAt(0).toUpperCase() + primaryVibe.slice(1)} Space Tour`,
        description: `Curated experiences showcasing ${primaryVibe} design and culture`,
        reason: `Experiences that celebrate ${primaryVibe} aesthetic principles`,
        confidence: 0.77,
        tags: Array.from(new Set([...aestheticKeywords.slice(0, 3), 'tour', 'experience'])),
        rating: 4.3
      },
      {
        id: '2',
        name: `The ${moodDescriptors[0] || 'Contemporary'} Experience`,
        description: `Immersive experiences designed for ${moodDescriptors.join(', ')} appreciation`,
        reason: `Tailored experiences that resonate with ${primaryVibe} values`,
        confidence: 0.73,
        tags: Array.from(new Set([...moodDescriptors.slice(0, 2), 'immersive', 'curated'])),
        rating: 4.2
      }
    ]
  };

  return fallbackData[category] || [];
}

async function fetchQlooRecommendations(entityType: string, categoryTerms: string[], vibeKeywords: string[], location: string) {
  // Construct search query combining category and vibe (simplified)
  const searchTerms = categoryTerms.concat(vibeKeywords.slice(0, 2)).join(' ');
  const encodedLocation = encodeURIComponent(location);
  const encodedQuery = encodeURIComponent(searchTerms);

  // Simplified URL construction
  const url = `https://api.qloo.com/v2/insights/?filter.type=${entityType}&filter.location.query=${encodedLocation}&query=${encodedQuery}&limit=3`;
  
  console.log('🌐 Qloo API URL:', url);
  console.log('🔑 Using API key:', process.env.QLOO_API_KEY ? 'Present' : 'Missing');

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
    console.error('❌ Qloo API error response:', errorText);
    throw new Error(`Qloo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('📦 Qloo API response:', JSON.stringify(data, null, 2));
  
  return data.results?.entities || [];
}

function transformQlooResponse(qlooEntity: any, vibeAnalysis: any): any {
  const { primaryVibe } = vibeAnalysis;
  
  // Extract relevant information from Qloo response
  const name = qlooEntity.name || 'Recommended Item';
  const description = qlooEntity.properties?.description || 'A recommendation that matches your vibe';
  const address = qlooEntity.properties?.address || '';
  const website = qlooEntity.properties?.website || '';
  const rating = qlooEntity.properties?.business_rating || 0;
  const keywords = qlooEntity.properties?.keywords?.slice(0, 3).map((k: any) => k.name) || [];
  
  // Generate confidence based on keyword matches
  const keywordMatches = keywords.filter((keyword: string) => 
    vibeAnalysis.aestheticKeywords.some((vibeKeyword: string) => 
      keyword.toLowerCase().includes(vibeKeyword.toLowerCase()) ||
      vibeKeyword.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  const confidence = Math.min(0.95, 0.6 + (keywordMatches.length * 0.1) + (rating * 0.05));

  // Generate reason based on vibe match
  const reason = generateMatchReason(qlooEntity, primaryVibe, keywordMatches);

  return {
    id: qlooEntity.entity_id || Math.random().toString(36),
    name,
    description: address ? `${description} Located at ${address}` : description,
    reason,
    confidence,
    tags: keywords,
    website,
    rating,
    qloo_data: {
      entity_id: qlooEntity.entity_id,
      type: qlooEntity.type,
      subtype: qlooEntity.subtype
    }
  };
}

function generateMatchReason(entity: any, primaryVibe: string, keywordMatches: string[]): string {
  const name = entity.name || 'This recommendation';
  const hasKeywordMatch = keywordMatches.length > 0;
  const rating = entity.properties?.business_rating || 0;

  if (hasKeywordMatch && rating >= 4) {
    return `${name} perfectly captures the ${primaryVibe} aesthetic with highly-rated ${keywordMatches.join(', ')} elements`;
  } else if (hasKeywordMatch) {
    return `${name} aligns with your ${primaryVibe} vibe through its ${keywordMatches.join(', ')} characteristics`;
  } else if (rating >= 4) {
    return `${name} is a highly-rated venue that complements the ${primaryVibe} cultural sensibility`;
  } else {
    return `${name} matches the ${primaryVibe} aesthetic and cultural context`;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== Starting analysis ===');
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      console.error('No image provided');
      return NextResponse.json(
        { error: 'No image provided' } as APIError,
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

    // Step 1: Analyze image with Hugging Face
    console.log('Step 1: Analyzing image with Hugging Face...');
    let imageDescription;
    try {
      imageDescription = await analyzeImageWithHF(imageBase64);
      console.log('✅ Image description:', imageDescription);
    } catch (error) {
      console.error('❌ Hugging Face image analysis failed:', error);
      imageDescription = 'A space with modern aesthetic elements and contemporary design features';
      console.log('📝 Using fallback description');
    }

    // Step 2: Analyze vibe with Hugging Face
    console.log('Step 2: Analyzing vibe with Hugging Face...');
    let vibeAnalysis;
    try {
      vibeAnalysis = await analyzeVibeWithHF(imageDescription);
      console.log('✅ Vibe analysis:', vibeAnalysis);
    } catch (error) {
      console.error('❌ Vibe analysis failed:', error);
      vibeAnalysis = {
        primaryVibe: "contemporary",
        secondaryVibes: ["modern", "stylish"],
        culturalContext: "A space with contemporary appeal and modern sensibilities",
        aestheticKeywords: ["modern", "contemporary", "stylish"],
        moodDescriptors: ["sophisticated", "clean", "appealing"]
      };
      console.log('📝 Using fallback vibe analysis');
    }

    // Step 3: Get recommendations from Qloo
    console.log('Step 3: Getting recommendations...');
    let recommendations;
    try {
      if (process.env.QLOO_API_KEY) {
        console.log('🔍 Attempting Qloo API integration...');
        recommendations = await getRecommendationsFromQloo(vibeAnalysis);
        console.log('✅ Qloo recommendations received');
      } else {
        console.log('⚠️ No Qloo API key, using fallback recommendations');
        recommendations = getFallbackRecommendations(vibeAnalysis);
      }
    } catch (error) {
      console.error('❌ Qloo API failed:', error);
      console.log('📝 Using fallback recommendations');
      recommendations = getFallbackRecommendations(vibeAnalysis);
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Total processing time: ${processingTime}ms`);

    const response: VibeValidationResponse = {
      imageDescription,
      vibeAnalysis,
      recommendations,
      processingTime
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Critical error in analysis:', error);
    
    const errorResponse: APIError = {
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'ANALYSIS_ERROR'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}