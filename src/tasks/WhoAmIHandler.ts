import {TaskHandler} from './TaskHandler.ts';
import {LLMChain} from 'langchain/chains';
import {ChatOpenAI} from '@langchain/openai';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {WhoAmITask} from '../model/taskModel.ts';
import {PromptTemplate} from '@langchain/core/prompts';

// noinspection JSUnusedGlobalSymbols
export class WhoAmIHandler extends TaskHandler {
  private readonly langChainClient: ChatOpenAI;
  private info: string = '';
  private answer: string = '';
  private attempt: number = 0;
  private template: string =
    "Guess person's name based on the information about that person: {info} " +
    'Information is provided in Polish. Answer only with the first and the last name of the person. ' +
    'If you can\'t assume the name of the person, answer "I do not know". Answer:';

  constructor() {
    super();
    this.langChainClient = useChatOpenAI();
  }

  private async chatWithModel(): Promise<void> {
    console.log('Chatting with model', this.info);

    const prompt = PromptTemplate.fromTemplate(this.template);
    const chain = new LLMChain({llm: this.langChainClient, prompt});
    const {text} = await chain.invoke({
      prompt,
      info: this.info,
    });

    this.answer = text;
  }

  private appendInfo(newInfo: string) {
    if (!this.info.includes(newInfo)) {
      this.info += this.info ? `, ${newInfo}` : newInfo;
    }
  }

  private rightAnswer(): boolean {
    return this.answer.length > 0 && this.answer !== 'I do not know.';
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getWhoAmITask(): Promise<WhoAmITask> {
    const task = (await this.getTask('whoami')) as WhoAmITask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain Who Am I task: ${task.msg}`);
    }

    return task;
  }

  async handleTask() {
    const task = await this.getWhoAmITask();
    this.appendInfo(task.hint);
    this.attempt++;

    do {
      console.log('Attempt:', this.attempt + 1);
      await this.chatWithModel();
      await this.sleep(2500);
      const task = await this.getWhoAmITask();
      this.appendInfo(task.hint);
    } while (!this.rightAnswer() && this.attempt++ < 6);

    console.log('Answer:', this.answer);

    //just for the sake of refreshing token
    await this.sleep(2500);
    await this.getWhoAmITask();
    const response = await this.submitAnswer(this.asAnswer(this.answer));
    console.log('API response:', JSON.stringify(response, null, 2));
  }
}
