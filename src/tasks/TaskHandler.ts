import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import {TaskDevClient} from '../clients/taskDevClient.ts';
import {AnswerResponse, Task} from '../model/model.ts';

export abstract class TaskHandler {
  private devClient: TaskDevClient;
  private devToken: string;

  protected constructor() {
    const __dirname = fileURLToPath(import.meta.url);
    dotenv.config({
      path: path.resolve(__dirname, '../../.env'),
    });

    this.devClient = new TaskDevClient({
      baseUrl: process.env.BASE_URL as string,
      apiKey: process.env.AI_DEVS_API_KEY as string,
      debug: process.env.DEBUG === 'true',
    });

    this.devToken = '';
  }

  protected async getTask(taskName: string): Promise<Task> {
    const tokenResponse = await this.devClient.getToken(taskName);
    if (tokenResponse.code !== 0) {
      throw new Error(`Could not obtain token: ${tokenResponse.msg}/`);
    }

    this.devToken = tokenResponse.token as string;
    return await this.devClient.getTask(this.devToken);
  }

  protected async submitAnswer(response: any): Promise<AnswerResponse> {
    return await this.devClient.submitAnswer(response, this.devToken);
  }

  abstract handleTask(): Promise<void>;
}
