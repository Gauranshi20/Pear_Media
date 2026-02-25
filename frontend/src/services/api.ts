import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${baseURL}/api/ai`,
});

export const enhancePromptApi = async (prompt: string) => {
  const res = await apiClient.post('/enhance-prompt', { prompt });
  return res.data as {
    tone: string;
    intent: string;
    enhancedPrompt: string;
  };
};

export const generateImageApi = async (prompt: string, style?: string) => {
  const res = await apiClient.post('/generate-image', { prompt, style });
  return res.data as {
    promptUsed: string;
    imageBase64: string;
  };
};

export const imageVariationsApi = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiClient.post('/image-variations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data as {
    analysis: {
      objects?: string[];
      theme?: string;
      style?: string;
      caption?: string;
    };
    variations: string[];
    originalImageBase64: string;
    promptForVariations: string;
  };
};


