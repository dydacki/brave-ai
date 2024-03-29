import 'dotenv/config';
import {ChatOpenAI} from '@langchain/openai';

export const useChatOpenAI = () => {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
    temperature: 0,
  });
};
