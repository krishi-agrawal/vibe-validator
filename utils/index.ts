export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = (error) => reject(error);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { valid: true };
};

export const formatConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

export const getVibeEmoji = (vibe: string): string => {
  const vibeEmojis: Record<string, string> = {
    'modern': '🏢',
    'vintage': '🕰️',
    'cozy': '🏠',
    'elegant': '✨',
    'rustic': '🌾',
    'minimalist': '⚪',
    'bohemian': '🌸',
    'industrial': '🏭',
    'luxurious': '💎',
    'casual': '👕',
    'artistic': '🎨',
    'natural': '🌿',
    'urban': '🏙️',
    'traditional': '🏛️',
    'contemporary': '🔲'
  };

  const lowerVibe = vibe.toLowerCase();
  for (const [key, emoji] of Object.entries(vibeEmojis)) {
    if (lowerVibe.includes(key)) {
      return emoji;
    }
  }
  return '🎯'; // Default emoji
};

export const getCategoryIcon = (category: string): string => {
  const categoryIcons: Record<string, string> = {
    'music': '🎵',
    'activities': '🎮',
    'restaurants': '🍽️',
    'experiences': '🎪'
  };
  return categoryIcons[category] || '📋';
};