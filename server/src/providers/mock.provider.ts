import { AIProvider } from './ai.provider.js';
import { GenerateAnswerInput, GenerateAnswerOutput } from '../types/index.js';
import { config } from '../config/index.js';

interface ParsedChunk {
  index: number;
  source: string;
  page?: string;
  content: string;
}

export class MockAIProvider implements AIProvider {
  name = 'mock';

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array(1536).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < 1536; i++) {
      const val = Math.sin(hash + i);
      vector[i] = parseFloat(val.toFixed(6));
    }

    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => parseFloat((v / norm).toFixed(6)));
  }

  async generateAnswer(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    const { question, context } = input;

    if (!context || context.trim().length === 0) {
      return { answer: config.rag.insufficientContextMessage };
    }

    // 1. Parse chunks from context
    const parsedChunks: ParsedChunk[] = [];
    const chunkBlocks = context.split(/\n\n---\n\n/);

    for (const block of chunkBlocks) {
      const lines = block.trim().split('\n');
      const headerLine = lines[0] || '';
      const contentLines = lines.slice(1).join('\n').trim();

      const chunkMatch = headerLine.match(/\[Chunk (\d+)\]/);
      const sourceMatch = headerLine.match(/Source: "([^"]+)"/);
      const pageMatch = headerLine.match(/\(Page (\d+)\)/);

      if (chunkMatch && contentLines.length > 0) {
        parsedChunks.push({
          index: parseInt(chunkMatch[1], 10),
          source: sourceMatch ? sourceMatch[1] : 'Document',
          page: pageMatch ? pageMatch[1] : undefined,
          content: contentLines,
        });
      }
    }

    // If context did not contain [Chunk X] headers (e.g. raw text in unit tests), treat as single chunk
    if (parsedChunks.length === 0 && context.trim().length > 0) {
      parsedChunks.push({
        index: 1,
        source: 'Document',
        content: context.trim(),
      });
    }

    if (parsedChunks.length === 0) {
      return { answer: config.rag.insufficientContextMessage };
    }

    const cleanQuestion = question.toLowerCase().trim();

    // Check for general summary requests
    const isSummaryRequest =
      cleanQuestion.includes('summar') ||
      cleanQuestion.includes('overview') ||
      cleanQuestion.includes('what is this document') ||
      cleanQuestion.includes('explain this document') ||
      cleanQuestion.includes('what does this contain') ||
      cleanQuestion.includes('tell me about');

    if (isSummaryRequest) {
      const bulletPoints: string[] = [];
      parsedChunks.slice(0, 3).forEach((chunk) => {
        const sentences = chunk.content.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 15);
        if (sentences.length > 0) {
          bulletPoints.push(`- ${sentences[0].trim()} [${chunk.index}]`);
        }
      });

      if (bulletPoints.length > 0) {
        return {
          answer: `Here is a summary based on the available documents:\n\n${bulletPoints.join('\n')}`,
        };
      }
    }

    // Extract significant query terms
    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'does', 'with', 'about', 'have',
      'this', 'that', 'they', 'from', 'tell', 'show', 'give', 'more', 'some',
      'into', 'been', 'were', 'will', 'would', 'could', 'should', 'the', 'and', 'for', 'are', 'is'
    ]);

    const queryTerms = cleanQuestion
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Score sentences in all chunks
    interface ScoredSentence {
      sentence: string;
      chunkIndex: number;
      score: number;
    }

    const scoredSentences: ScoredSentence[] = [];

    for (const chunk of parsedChunks) {
      const sentences = chunk.content.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 5);

      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        let matchCount = 0;
        let exactPhraseBonus = 0;

        for (const term of queryTerms) {
          if (lowerSentence.includes(term)) {
            matchCount++;
          }
        }

        // Check for 2-word phrase matches from the query
        for (let i = 0; i < queryTerms.length - 1; i++) {
          const phrase = `${queryTerms[i]} ${queryTerms[i + 1]}`;
          if (lowerSentence.includes(phrase)) {
            exactPhraseBonus += 2;
          }
        }

        const score = matchCount + exactPhraseBonus;
        if (score > 0) {
          scoredSentences.push({
            sentence: sentence.trim(),
            chunkIndex: chunk.index,
            score,
          });
        }
      }
    }

    // If query terms had zero matches anywhere, reject hallucination
    if (queryTerms.length > 0 && scoredSentences.length === 0) {
      return { answer: config.rag.insufficientContextMessage };
    }

    // Sort by relevance score
    scoredSentences.sort((a, b) => b.score - a.score);

    // Pick top 1-2 distinct sentences
    const selected = scoredSentences.slice(0, 2);
    if (selected.length === 0) {
      const firstChunk = parsedChunks[0];
      const firstSentence = firstChunk.content.split(/(?<=[.?!])\s+/)[0] || firstChunk.content;
      return {
        answer: `${firstSentence} [${firstChunk.index}]`,
      };
    }

    const primary = selected[0];
    let answerText = `${primary.sentence} [${primary.chunkIndex}]`;

    if (selected.length > 1 && selected[1].sentence !== primary.sentence) {
      const secondary = selected[1];
      if (secondary.chunkIndex === primary.chunkIndex) {
        answerText = `${primary.sentence} ${secondary.sentence} [${primary.chunkIndex}]`;
      } else {
        answerText = `${primary.sentence} [${primary.chunkIndex}] Additionally, ${secondary.sentence.toLowerCase()} [${secondary.chunkIndex}]`;
      }
    }

    return {
      answer: answerText,
    };
  }
}
