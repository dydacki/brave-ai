import {TaskHandler} from './TaskHandler.ts';
import {ToolsTask} from '../model/taskModel.ts';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {HumanMessage, SystemMessage} from 'langchain/schema';
import {schemas, parseFunctionCall} from '../utils/FunctionSchemas.ts';

type taskParams = {
  desc: string;
  tool: string;
  date?: string;
};

// noinspection JSUnusedGlobalSymbols
export class ToolsHandler extends TaskHandler {
  private modelChat: any;

  constructor() {
    super();
    this.modelChat = useChatOpenAI().bind({functions: [schemas.decision]});
  }

  private asAnswer(answer: taskParams) {
    return {
      answer: answer,
    };
  }

  private async getFunctionToCall(question: string): Promise<void | taskParams> {
    const systemMessage = new SystemMessage(
      `Fact: Today is ${new Date().toLocaleDateString('en-US')}.\n\nRule: Always use YYYY-MM-DD format for dates.`,
    );
    const message = new HumanMessage(question);
    const response = await this.modelChat.invoke([message, systemMessage]);
    return parseFunctionCall(response)?.args as taskParams;
  }

  async handleTask() {
    const task = (await this.getTask('tools')) as ToolsTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain tools task: ${task.msg}`);
    }

    console.log(`Received task: ${JSON.stringify(task, null, 2)}`);
    const resultingTask = await this.getFunctionToCall(task.question);
    console.log(`Received resulting task: ${JSON.stringify(resultingTask, null, 2)}`);
    if (!resultingTask) {
      throw new Error(`Could not get function to call.`);
    }
    const response = await this.submitAnswer(this.asAnswer(resultingTask));
    console.log(`Response: ${JSON.stringify(response, null, 2)}`);
  }
}
