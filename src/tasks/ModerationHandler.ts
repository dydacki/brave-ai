import {TaskHandler} from './TaskHandler.js';
import {HelloApiTask} from '../model/taskModel.js';
import {Answer} from '../model/model.js';

export class ModerationHandler extends TaskHandler {
  constructor() {
    super();
  }

  async handleTask() {
    const task = await this.getTask('moderation');
    if (task.code !== 0) {
      throw new Error(`Could not obtain moderation task: ${task.msg}`);
    }

    console.info('Received task');
    // const response = await this.submitAnswer(answer);
    // console.info(`Received response: ${JSON.stringify(response)}`);
  }
}
