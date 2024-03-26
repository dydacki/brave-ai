import OpenAi from 'openai';
import {TaskHandler} from './TaskHandler.ts';
import {ModerationTask, ModerationTaskAnswer} from '../model/taskModel.ts';
import {useOpenAi} from '../clients/openAiClient.ts';

export class ModerationHandler extends TaskHandler {
  private openAiClient: OpenAi;

  constructor() {
    super();
    this.openAiClient = useOpenAi();
  }

  private buildAnswer(moderated: ModerationTaskAnswer) {
    return {
      answer: moderated,
    };
  }

  private async moderateText(inputText: string): Promise<0 | 1> {
    const response = await this.openAiClient.moderations.create({
      model: 'text-moderation-latest',
      input: inputText,
    });

    return response.results.some(result => result.flagged) ? 1 : 0;
  }

  private async moderate(input: Array<string>): Promise<Array<0 | 1>> {
    const promises: Array<Promise<0 | 1>> = [];
    input.forEach(inputText => promises.push(this.moderateText(inputText)));
    return await Promise.all(promises);
  }

  async handleTask() {
    const task = (await this.getTask('moderation')) as ModerationTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain moderation task: ${task.msg}`);
    }

    console.info('Received task with input', JSON.stringify(task.input));
    const moderated = await this.moderate(task.input);
    const answer = this.buildAnswer(moderated);
    const response = await this.submitAnswer(answer);
    console.info(`Received response: ${JSON.stringify(response)}`);
  }
}
