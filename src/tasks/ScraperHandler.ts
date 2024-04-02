import {ChatOpenAI} from '@langchain/openai';
import {LLMChain} from 'langchain/chains';
import {PromptTemplate} from '@langchain/core/prompts';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {usePlaywright} from '../clients/playwrightClient.ts';
import {PlaywrightWebBaseLoader} from 'langchain/document_loaders/web/playwright';
import {TaskHandler} from './TaskHandler.ts';
import {ScraperTask} from '../model/taskModel.ts';

// noinspection JSUnusedGlobalSymbols
export class ScraperHandler extends TaskHandler {
  private webCrawler: PlaywrightWebBaseLoader;
  private readonly chatOpenAI: ChatOpenAI;
  private readonly template: string =
    'You are a system design to extract text from HTML text. ' +
    'Answer the question: {question}. Return answer for the question in POLISH language, ' +
    'based on provided article {htmlArticle}, remove html tags. Maximum length for the answer is 200 characters. ' +
    'Be precise. Answer:';

  constructor() {
    super();
    this.webCrawler = usePlaywright('https://tasks.aidevs.pl/text_pizza_history.txt');
    this.chatOpenAI = useChatOpenAI();
  }

  private async getPageContent(): Promise<any> {
    return this.webCrawler.load();
  }

  private async scrapWeb(): Promise<string> {
    let backoff = 0;
    let backoffTime = 1000;
    let pageContents: any;
    do {
      try {
        console.log('Loading page attempt: ', backoff + 1);
        pageContents = await this.getPageContent();
      } catch (error) {
        console.error('Error loading page', error);
        backoffTime *= 2;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    } while (backoff++ < 5 && pageContents.length === 0);

    if (pageContents.length === 0) {
      throw new Error('Could not load page content');
    }

    return pageContents[0].pageContent ?? '';
  }

  private async briefText(question: string, htmlArticle: string): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(this.template);
    const chain = new LLMChain({llm: this.chatOpenAI, prompt});
    const {text} = await chain.invoke({
      prompt,
      question,
      htmlArticle,
    });

    console.log('Answer:', text);
    return text;
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  async handleTask() {
    const pageContents = await this.scrapWeb();

    const task = (await this.getTask('scraper')) as ScraperTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain scraper task: ${task.msg}`);
    }

    console.info('Received scraper task', JSON.stringify(task, null, 2));
    const briefedText = await this.briefText(task.question, pageContents);
    console.log('Briefed text:', briefedText);
    const answer = this.asAnswer(briefedText);
    const response = await this.submitAnswer(answer);
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
