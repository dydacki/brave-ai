import {TaskHandler} from './TaskHandler.ts';

// noinspection JSUnusedGlobalSymbols
export class OwnApiProHandler extends TaskHandler {
  constructor() {
    super();
  }

  async handleTask() {
    const task = await this.getTask('ownapipro');
    if (task.code !== 0) {
      throw new Error(`Could not obtain own API pro task`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const answer = {
      answer: 'https://brave-api.azurewebsites.net/conversation',
    };

    const response = await this.submitAnswer(answer);
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
