import dotenv from 'dotenv';
import OpenAI from 'openai';


dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemPrompt = `
You are an assistant that optimizes user prompts for AI image generation.
Given a raw user prompt:
- Detect and summarize tone
- Detect and summarize intent
- Rewrite the prompt to be clear, detailed, and optimized for image generation
- Keep it under 120 words.

Respond as JSON with keys: tone, intent, enhancedPrompt.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const data = JSON.parse(completion.choices[0].message.content || '{}');

    return res.json({
      tone: data.tone,
      intent: data.intent,
      enhancedPrompt: data.enhancedPrompt,
    });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return res.status(500).json({ error: 'Failed to enhance prompt' });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { prompt, style } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const styledPrompt = style ? `${prompt}\n\nImage style: ${style}.` : prompt;

    const image = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: styledPrompt,
      n: 1,
      size: '1024x1024',
    });

    const imageBase64 = image.data[0].b64_json;

    return res.json({
      promptUsed: styledPrompt,
      imageBase64,
    });
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
};

export const analyzeImageAndVariations = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const buffer = req.file.buffer;
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that analyzes images. Extract a JSON summary with keys: objects (array of strings), theme, style, caption.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image.' },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(analysisCompletion.choices[0].message.content || '{}');

    const promptForVariations = `
Generate a similar image based on this description:
Caption: ${analysis.caption || 'N/A'}
Theme: ${analysis.theme || 'N/A'}
Style: ${analysis.style || 'N/A'}
Key objects: ${(analysis.objects || []).join(', ')}
`;

    const variations = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: promptForVariations,
      n: 2,
      size: '512x512',
    });

    const variationImages = variations.data.map((img) => img.b64_json);

    return res.json({
      analysis,
      variations: variationImages,
      originalImageBase64: base64,
      promptForVariations,
    });
  } catch (error) {
    console.error('Error analyzing image/creating variations:', error.response?.data || error.message || error);
    return res.status(500).json({
      error: 'Failed to analyze image or generate variations',
      message: error.message || 'Unknown error from OpenAI',
    });
  }
};


