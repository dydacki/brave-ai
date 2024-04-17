import {v4 as uuidv4} from 'uuid';
import {TaskHandler} from './TaskHandler.ts';
import {useEmbeddingsOpenAI} from '../clients/langchainClient.ts';
import {QuadrantClient} from '../clients/qdrantClient.ts';
import {Document} from 'langchain/document';
import {OpenAIEmbeddings} from '@langchain/openai';
import {SearchTask} from '../model/taskModel.ts';

type NewsFeed = {
  title: string;
  url: string;
  info: string;
  date: string;
};

// noinspection JSUnusedGlobalSymbols
export class SearchHandler extends TaskHandler {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly qdrantClient: QuadrantClient;

  constructor() {
    super();
    this.embeddings = useEmbeddingsOpenAI();
    this.qdrantClient = new QuadrantClient('http://localhost:6333');
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private enrichDocuments(newsFeeds: NewsFeed[], documentSource: string): Document[] {
    const documents = newsFeeds.map(
      news => new Document({pageContent: news.info, metadata: {uuid: uuidv4(), url: news.url, source: documentSource}}),
    );

    newsFeeds.forEach(news => {
      documents.push(
        new Document({pageContent: news.info, metadata: {uuid: uuidv4(), url: news.url, source: documentSource}}),
      );
    });

    return documents;
  }

  private async embedDocuments(documents: Document[]): Promise<any[]> {
    const points = [];
    for (const doc of documents) {
      const [embedding] = await this.embeddings.embedDocuments([doc.pageContent]);
      console.log('Embedded document no:', points.length + 1);
      points.push({
        id: doc.metadata.uuid,
        payload: doc.metadata,
        vector: embedding,
      });
    }

    return points;
  }

  private async embedQuestion(question: string): Promise<number[]> {
    return this.embeddings.embedQuery(question);
  }

  private async searchUrl(queryEmbedding: number[]): Promise<string | undefined> {
    const searchResult = await this.qdrantClient.searchCollection('ai_devs', queryEmbedding, 1);
    return searchResult[0]?.payload?.url as string;
  }

  async handleTask() {
    const newsContents = await fetch('https://unknow.news/archiwum_aidevs.json');
    const news = (await newsContents.json()) as NewsFeed[];
    const documents = this.enrichDocuments(news, 'ai_devs');
    const embedded = await this.embedDocuments(documents);
    await this.qdrantClient.tryCreateCollection('ai_devs');
    await this.qdrantClient.upsertBatch('ai_devs', embedded);

    const task = (await this.getTask('search')) as SearchTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain search task: ${task.msg}`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const embeddedQuestion = await this.embedQuestion(task.question);

    const url = await this.searchUrl(embeddedQuestion);
    if (url) {
      const answer = this.asAnswer(url);
      const result = await this.submitAnswer(answer);
      console.log(`Submitted answer: ${JSON.stringify(result, null, 2)}`);
    }
  }
}
