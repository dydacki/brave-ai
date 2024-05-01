import {TaskHandler} from './TaskHandler.ts';
import {RenderFormPayload, RenderFormResponse} from '../model/renderFormModel.ts';
import {MemeTask} from '../model/taskModel.ts';
import {RenderFormClient} from '../clients/renderFormClient.js';

// noinspection JSUnusedGlobalSymbols
export class MemeHandler extends TaskHandler {
  private memeClient: RenderFormClient;
  constructor() {
    super();
    this.memeClient = new RenderFormClient();
  }

  createPayload = (imageUrl: string, imageDescription: string): RenderFormPayload => {
    return {
      template: 'lean-guinea pigs-dive-rudely-1909',
      data: {
        'meme-text.text': imageDescription,
        'meme-image.src': imageUrl,
      },
    };
  };

  async handleTask() {
    const task = (await this.getTask('meme')) as MemeTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain meme pro task`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const payload = this.createPayload(task.image, task.text);

    let response: RenderFormResponse;
    try {
      response = await this.memeClient.renderMeme(payload);
    } catch (error) {
      console.error('Error rendering meme:', error);
      throw error;
    }

    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
    const answer = {
      answer: response.href,
    };

    const submitResponse = await this.submitAnswer(answer);
    console.log(`Received submit response: ${JSON.stringify(submitResponse, null, 2)}`);
  }
}
