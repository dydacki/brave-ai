import {PromptTemplate} from '@langchain/core/prompts';
import {LLMChain} from 'langchain/chains';
import {ChatOpenAI} from '@langchain/openai';
import {TaskHandler} from './TaskHandler.ts';
import {InpromptTask} from '../model/taskModel.ts';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {AnswerResponse} from '../model/model.ts';

export class InpromptHandler extends TaskHandler {
  private readonly langChainClient: ChatOpenAI;
  private readonly mameTemplate: string = 'Return the name from the phrase: {phrase}. Reply with name only. Answer:';
  private readonly questionTemplate: string =
    'Reply to the question: {question} based SOLELY on the info: {info}. Be concise, reply with one single sentence. Answer:';
  private task: InpromptTask | undefined;

  constructor() {
    super();
    this.langChainClient = useChatOpenAI();
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private async getNameFromQuestion(question: string): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(this.mameTemplate);
    const chain = new LLMChain({llm: this.langChainClient, prompt: prompt});
    const {text} = await chain.invoke({
      prompt,
      phrase: question,
    });

    console.log('Answer:', text);
    return text;
  }

  private async getAnswerToQuestion(question: string, info: string): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(this.questionTemplate);
    const chain = new LLMChain({llm: this.langChainClient, prompt: prompt});
    const {text} = await chain.invoke({
      prompt,
      question,
      info,
    });

    console.log('Answer:', text);
    return text;
  }

  private getDataForName(name: string): string | undefined {
    return this.task?.input.find(info => info.includes(name));
  }

  async handleTask() {
    this.task = (await this.getTask('inprompt')) as InpromptTask;
    if (this.task.code !== 0) {
      throw new Error(`Could not obtain inprompt task: ${this.task.msg}`);
    }

    console.info('Received task');
    const name = await this.getNameFromQuestion(this.task.question);
    const data = this.getDataForName(name);
    if (data) {
      const response = await this.getAnswerToQuestion(this.task.question, data);
      const respone: AnswerResponse = await this.submitAnswer(this.asAnswer(response));
      console.log(`Received response: ${JSON.stringify(respone, null, 2)}`);
    }
  }
}
