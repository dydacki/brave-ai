import {TaskHandler} from './TaskHandler.ts';
import {Answer, AnswerResponse} from '../model/model.ts';
import {HelloApiTask} from '../model/taskModel.ts';

// noinspection JSUnusedGlobalSymbols
export class HelloApiHandler extends TaskHandler {
  constructor() {
    super();
  }

  private taskAsAnswer(task: HelloApiTask): Answer {
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
    const answer: Answer = this.taskAsAnswer(task as HelloApiTask);
    const response: AnswerResponse = await this.submitAnswer(answer);
    console.info(`Received response: ${JSON.stringify(response)}`);
  }
}
