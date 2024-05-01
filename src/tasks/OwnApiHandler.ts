import {TaskHandler} from './TaskHandler.ts';

// noinspection JSUnusedGlobalSymbols
export class OwnApiHandler extends TaskHandler {
  constructor() {
    super();
  }

  async handleTask() {
    const task = await this.getTask('ownapi');
    if (task.code !== 0) {
      throw new Error(`Could not obtain own API task: ${task}`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const answer = {
      answer: 'https://brave-api.azurewebsites.net/answer',
    };

    const response = await this.submitAnswer(answer);
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
