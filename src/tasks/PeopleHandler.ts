import {fileURLToPath} from 'url';
import {v4 as uuidv4} from 'uuid';
import stringHash from 'string-hash';
import fs from 'fs';
import path, {dirname} from 'path';
import {TaskHandler} from './TaskHandler.ts';
import {useChatOpenAI, useEmbeddingsOpenAI} from '../clients/langchainClient.ts';
import {QuadrantClient} from '../clients/qdrantClient.ts';
import {Document} from 'langchain/document';
import {OpenAIEmbeddings} from '@langchain/openai';
import {ChatPromptTemplate} from 'langchain/prompts';
import {ChatOpenAI} from '@langchain/openai';
import {PeopleTask} from '../model/taskModel.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Human = {
  imie: string;
  nazwisko: string;
  ulubiony_kolor: string;
  o_mnie: string;
  ulubiona_postac_z_kapitana_bomby: string;
  ulubiony_film: string;
  ulubiony_serial: string;
  wiek: number;
};

type EmbeddingCache = {
  [key: string]: number[];
};

const systemTemplate = `
Odpowiedź na pytanie o ulubiony kolor, ulubione jedzenie i miejsce zamieszkania znajdziesz w danych uytkowników poniżej.
Bądź precyzyjny, nie odpowiadaj na pytania, które nie zostały zadane.

Użytkownicy:
###
{context}
###

Pytanie:
`;

const humanTemplate = `
{question} 
`;

// noinspection JSUnusedGlobalSymbols
export class PeopleHandler extends TaskHandler {
  private readonly qdrantClient: QuadrantClient;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly chatOpenAI: ChatOpenAI;

  constructor() {
    super();
    this.qdrantClient = new QuadrantClient('http://localhost:6333');
    this.embeddings = useEmbeddingsOpenAI();
    this.chatOpenAI = useChatOpenAI();
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private async getJsonData(): Promise<Partial<Human>[]> {
    const response = await fetch('https://tasks.aidevs.pl/data/people.json');
    const people = (await response.json()) as Human[];
    return people.map(human => {
      return {
        imie: human.imie,
        nazwisko: human.nazwisko,
        ulubiony_kolor: human.ulubiony_kolor,
        o_mnie: human.o_mnie,
      };
    });
  }

  private buildPageContent(human: Partial<Human>): string {
    return `Nazwisko: ${human.imie} ${human.nazwisko}, O mnie: ${human.o_mnie}, Ulubiony kolor ${human.ulubiony_kolor}`;
  }

  private buildHash(humanInfo: Partial<Human>): string {
    return `${stringHash(JSON.stringify(humanInfo))}`;
  }

  private enrichPeopleData(people: Partial<Human>[], sourceName: string): Document[] {
    const documents = people.map(
      human =>
        new Document({
          pageContent: this.buildPageContent(human) ?? '',
          metadata: {
            uuid: uuidv4(),
            source: sourceName,
            hash: this.buildHash(human),
          },
        }),
    );

    people.forEach(human => {
      documents.push(
        new Document({
          pageContent: this.buildPageContent(human) ?? '',
          metadata: {
            uuid: uuidv4(),
            source: sourceName,
            hash: this.buildHash(human),
          },
        }),
      );
    });

    return documents;
  }

  private async embedDocuments(documents: Document[]): Promise<any[]> {
    const embeddingsCache: EmbeddingCache = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'cache.json'), 'utf-8'));

    const points = [];
    for (const doc of documents) {
      if (embeddingsCache[doc.metadata.hash]) {
        const point = {
          id: doc.metadata.uuid,
          payload: doc.metadata,
          vector: embeddingsCache[doc.metadata.hash],
        };
        points.push(point);
      } else {
        const [embedding] = await this.embeddings.embedDocuments([doc.pageContent]);
        points.push({
          id: doc.metadata.uuid,
          payload: doc.metadata,
          vector: embedding,
        });
        embeddingsCache[doc.metadata.hash] = embedding;
      }
    }

    fs.writeFileSync(path.resolve(__dirname, 'cache.json'), JSON.stringify(embeddingsCache, null, 2));
    return points;
  }

  private async embedQuestion(question: string): Promise<number[]> {
    return this.embeddings.embedQuery(question);
  }

  private async searchHashes(queryEmbedding: number[]): Promise<string[]> {
    const searchResult = await this.qdrantClient.searchCollection('people', queryEmbedding, 50);
    return searchResult.map(result => result.payload?.hash as string);
  }

  private buildContext = (people: Document[], hashes: string[]): string => {
    return people
      .filter(human => hashes.includes(human.metadata.hash))
      .map(human => human.pageContent)
      .join('\n###\n');
  };

  async handleTask() {
    const jsonData = (await this.getJsonData()) as Partial<Human>[];
    const enrichedData = this.enrichPeopleData(jsonData, 'people');
    const embedded = await this.embedDocuments(enrichedData);
    await this.qdrantClient.tryCreateCollection('people');
    await this.qdrantClient.upsertBatch('people', embedded);

    const task = (await this.getTask('people')) as PeopleTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain people task: ${task.msg}`);
    }

    console.info('Received people task', task.question);
    const queryEmbedding = await this.embedQuestion(task.question);
    const hashes = await this.searchHashes(queryEmbedding);
    const context = this.buildContext(enrichedData, hashes);

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['human', humanTemplate],
    ]);

    const formattedChatPrompt = await chatPrompt.formatMessages({
      context,
      question: task.question,
    });

    const {content} = await this.chatOpenAI.invoke(formattedChatPrompt);
    console.log('Answer:', content);
    const response = await this.submitAnswer(this.asAnswer(content as string));
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
