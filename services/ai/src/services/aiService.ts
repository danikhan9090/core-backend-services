import OpenAI from 'openai';
import { BadRequestError } from '@backend-services/shared';
import config from '../config';

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestError('No completion generated');
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new BadRequestError('Invalid OpenAI API key');
        }
        if (error.message.includes('rate limit')) {
          throw new BadRequestError('OpenAI rate limit exceeded');
        }
        throw new BadRequestError(`AI generation failed: ${error.message}`);
      }
      throw new BadRequestError('AI generation failed');
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });

      const data = response.data as Array<{ url: string }>;
      if (!data || data.length === 0) {
        throw new BadRequestError('No image generated');
      }

      const imageUrl = data[0]?.url;
      if (!imageUrl) {
        throw new BadRequestError('No image URL in response');
      }

      return imageUrl;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new BadRequestError('Invalid OpenAI API key');
        }
        if (error.message.includes('rate limit')) {
          throw new BadRequestError('OpenAI rate limit exceeded');
        }
        if (error.message.includes('content policy')) {
          throw new BadRequestError('Image generation violates content policy');
        }
        throw new BadRequestError(`Image generation failed: ${error.message}`);
      }
      throw new BadRequestError('Image generation failed');
    }
  }
}

export const aiService = new AIService(); 