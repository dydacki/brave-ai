import {TaskHandler} from './TaskHandler.ts';
import {useChatOpenAI} from '../clients/langchainClient.ts';
import {KnowledgeTask} from '../model/taskModel.ts';
import {HumanMessage, SystemMessage} from 'langchain/schema';
import {schemas, parseFunctionCall} from '../utils/FunctionSchemas.ts';

type CurrencyParams = {
  currency: string;
};

type PopulationParams = {
  country: string;
};

type GeneralParams = {
  question: string;
};

type CurrencyRates = {
  table: string;
  no: string;
  effectiveDate: string;
  rates: {
    currency: string;
    code: string;
    mid: number;
  }[];
};

type CountryPopulation = {
  name: {
    common: string;
    official: string;
    nativeName: {
      ron: {
        official: string;
        common: string;
      };
    };
  };
  population: number;
};

// noinspection JSUnusedGlobalSymbols
export class KnowledgeHandler extends TaskHandler {
  private modelChat: any;

  constructor() {
    super();
    this.modelChat = useChatOpenAI().bind({
      functions: [...Object.values(schemas)],
    });
  }

  private async getFunctionToCall(question: string): Promise<{funcToCall: string; params: any} | null> {
    const message = new HumanMessage(question);
    const response = await this.modelChat.invoke([message]);

    const functionCall = parseFunctionCall(response);
    if (!functionCall) {
      return null;
    }

    console.log('Function call:', functionCall);
    return {funcToCall: functionCall.name, params: functionCall.args};
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  private async getGeneral(input: GeneralParams): Promise<string> {
    console.log('Fetching general:', input.question);
    const reply = await this.modelChat.invoke([new HumanMessage(input.question)]);

    console.log('Content:', reply);
    return '';
  }

  private async getPopulation(input: PopulationParams): Promise<string> {
    console.log('Fetching population:', input.country);
    // https://restcountries.com/v3.1/all?fields=name,population
    const countryPopulations = await fetch('https://restcountries.com/v3.1/all?fields=name,population');
    const countries = (await countryPopulations.json()) as CountryPopulation[];
    return countries.find(country => country.name.common === input.country)?.population.toString() ?? '';
  }

  private async getCurrency(input: {currency: string}): Promise<string> {
    // https://api.nbp.pl/api/exchangerates/rates/A/eur/last/?format=json
    // https://api.nbp.pl/api/exchangerates/tables/A/2024-04-17/2024-04-17?format=json
    console.log('Fetching currency:', input.currency);
    const response = await fetch(`http://api.nbp.pl/api/exchangerates/rates/A/${input.currency}/last/?format=json`);
    const currencyRates = (await response.json()) as CurrencyRates;
    return currencyRates.rates.find(rate => rate.code === input.currency)?.mid.toString() ?? '';
  }

  async handleTask() {
    const task = (await this.getTask('knowledge')) as KnowledgeTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain knowledge task: ${task.msg}`);
    }

    const functionToCall = await this.getFunctionToCall(task.question);
    let answer = '';
    switch (functionToCall?.funcToCall) {
      case 'currency':
        answer = await this.getCurrency(functionToCall?.params as CurrencyParams);
        break;
      case 'population':
        answer = await this.getPopulation(functionToCall?.params as PopulationParams);
        break;
      case 'general':
        answer = await this.getGeneral(functionToCall?.params as GeneralParams);
        break;
      default:
        break;
    }

    const answerToSubmit = this.asAnswer(answer);
    console.log('Answer:', answerToSubmit);
    const response = await this.submitAnswer(answerToSubmit);
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
