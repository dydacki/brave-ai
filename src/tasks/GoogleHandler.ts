import {TaskHandler} from './TaskHandler.ts';

// noinspection JSUnusedGlobalSymbols
export class GoogleHandler extends TaskHandler {
  constructor() {
    super();
  }

  async handleTask() {
    const task = await this.getTask('google');
    if (task.code !== 0) {
      throw new Error(`Could not obtain google task: ${task}`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const answer = {
      answer: 'https://brave-api.azurewebsites.net/google',
    };

    const response = await this.submitAnswer(answer);
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
