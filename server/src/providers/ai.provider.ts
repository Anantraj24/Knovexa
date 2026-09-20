import { GenerateAnswerInput, GenerateAnswerOutput } from '../types/index.js';

export interface AIProvider {
  name: string;
  generateEmbedding(text: string): Promise<number[]>;
  generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput>;
}
