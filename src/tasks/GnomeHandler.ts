import OpenAi from 'openai';
import {TaskHandler} from './TaskHandler.ts';
import {useOpenAi} from '../clients/openAiClient.ts';
import {GnomeTask} from '../model/taskModel.ts';

// noinspection JSUnusedGlobalSymbols
export class GnomeHandler extends TaskHandler {
  private openAi: OpenAi;

  constructor() {
    super();
    this.openAi = useOpenAi();
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private async getResponseFromImage(image: string): Promise<string | null> {
    const response = await this.openAi.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'I will give you a drawing of a gnome with a hat on his head. Tell me what is the color of the hat in POLISH with one word only. If any errors occur, return "ERROR" as answer',
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });

    return response.choices[0].message.content;
  }

  async handleTask() {
    const task = (await this.getTask('gnome')) as GnomeTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain gnome task: ${task.msg}`);
    }

    console.log(`Received task: ${task.url}`);
    const response = await this.getResponseFromImage(task.url);
    if (response === null) {
      throw new Error('Could not obtain response from image');
    }
    const answer = this.asAnswer(response);
    const result = await this.submitAnswer(answer);
    console.log(`Submitted answer: ${JSON.stringify(result)}`);
  }
}
