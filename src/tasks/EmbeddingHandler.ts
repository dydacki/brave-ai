import {OpenAIEmbeddings as Embeddings} from '@langchain/openai';
import {TaskHandler} from './TaskHandler.ts';
import {useEmbeddingsOpenAI} from '../clients/langchainClient.js';

// noinspection JSUnusedGlobalSymbols
export class EmbeddingHandler extends TaskHandler {
  private readonly embeddings: Embeddings | undefined;

  constructor() {
    super();
    this.embeddings = useEmbeddingsOpenAI();
  }

  private buildAnswer(embedding: number[]) {
    return {
      answer: embedding,
    };
  }

  private async getEmbeddingForPizza(): Promise<number[]> {
    if (!this.embeddings) {
      throw new Error('Embeddings client is not initialized');
    }

    return this.embeddings.embedQuery('Hawaiian pizza');
  }

  async handleTask() {
    const task = await this.getTask('embedding');
    if (task.code !== 0) {
      throw new Error(`Could not obtain moderation task: ${task.msg}`);
    }

    console.info('Received embedding task', JSON.stringify(JSON.stringify(task, null, 2)));
    const embeddings = await this.getEmbeddingForPizza();
    const response = await this.submitAnswer(this.buildAnswer(embeddings));
    console.info(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
