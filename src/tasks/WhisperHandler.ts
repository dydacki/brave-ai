import {TaskHandler} from './TaskHandler.ts';

export class WhisperHandler extends TaskHandler {
  constructor() {
    super();
  }

  async handleTask() {
    const task = await this.getTask('whisper');
    if (task.code !== 0) {
      throw new Error(`Could not obtain moderation task: ${task.msg}`);
    }

    console.info('Received embedding task', JSON.stringify(JSON.stringify(task, null, 2)));
  }
}
