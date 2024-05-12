import 'dotenv/config';
import {TaskHandler} from './TaskHandler.ts';
import {MdToHtmlTask} from '../model/taskModel.js';
import {ChatOpenAI} from '@langchain/openai';
import {HumanMessage, SystemMessage} from 'langchain/schema';

// noinspection JSUnusedGlobalSymbols
export class Md2htmlHandler extends TaskHandler {
  constructor() {
    super();
  }

  private async solve(taskInput: string): Promise<string> {
    const chatOpenAi = new ChatOpenAI({
      apiKey: process.env['OPEN_AI_API_KEY'],
      model: 'ft:gpt-3.5-turbo-0125:personal:md-2-html:9O3qFsew',
    });

    const response = await chatOpenAi.invoke([new SystemMessage('Markdown to HTML mode'), new HumanMessage(taskInput)]);
    const result = response.content as string;
    return result.replace('<strong>', '<span class="bold">').replace('</strong>', '</span>');
  }

  async handleTask() {
    const task = (await this.getTask('md2html')) as MdToHtmlTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain html task: ${task.msg}`);
    }

    console.info('Received task with input', JSON.stringify(task, null, 2));
    const apiAnswer = await this.solve(task.input);
    console.log('Answer:', apiAnswer);
    const taskAnswer = {
      answer: apiAnswer,
    };
    const reply = await this.submitAnswer(taskAnswer);
    console.log(`Received response: ${JSON.stringify(reply, null, 2)}`);
  }
}
