import {PromptTemplate} from '@langchain/core/prompts';
import {LLMChain} from 'langchain/chains';
import {ChatOpenAI} from '@langchain/openai';
import {TaskHandler} from './TaskHandler.ts';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {AnswerResponse} from '../model/model.ts';

export class LiarHandler extends TaskHandler {
  private readonly langChainClient: ChatOpenAI;
  private readonly prompt: string = 'Is 1kg contained of 1000 grams?';
  private template: string =
    'Return YES if the answer: {answer} to the prompt: {prompt} is true, NO if it is false. Answer:';

  constructor() {
    super();
    this.langChainClient = useChatOpenAI();
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private async guard(answer: string): Promise<string> {
    console.log('Guarding answer', answer);
    const prompt = PromptTemplate.fromTemplate(this.template);
    const chain = new LLMChain({llm: this.langChainClient, prompt});
    const {text} = await chain.invoke({
      prompt: this.prompt,
      answer,
    });
    console.log('Answer:', text);
    return text;
  }

  async handleTask() {
    const task = await this.getTask('liar');
    if (task.code !== 0) {
      throw new Error(`Could not obtain liar task: ${task.msg}`);
    }

    console.info('Received task with input');
    const response: AnswerResponse = await this.postQuery(this.prompt);
    const apiAnswer = response['answer'];
    if (!apiAnswer) {
      throw new Error('Could not obtain answer from OpenAI');
    }

    const taskAnswer = this.asAnswer(await this.guard(apiAnswer as string));
    await this.submitAnswer(taskAnswer);
  }
}
