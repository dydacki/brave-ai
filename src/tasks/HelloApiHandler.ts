import {TaskHandler} from './TaskHandler.js';
import {Answer} from '../model/model.ts';
import {HelloApiTask} from '../model/taskModel.ts';

export class HelloApiHandler extends TaskHandler {
  constructor() {
    super();
  }

  private asAnswer(task: HelloApiTask): Answer {
    return {
      answer: task.cookie,
    };
  }

  async handleTask() {
    const task = await this.getTask('helloapi');
    if (task.code !== 0) {
      throw new Error(`Could not obtain task: ${task.msg}`);
    }

    console.info('Received task');
    const answer = this.asAnswer(task as HelloApiTask);
    const response = await this.submitAnswer(answer);
    console.info(`Received response: ${JSON.stringify(response)}`);
  }
}
