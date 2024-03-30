import 'dotenv/config';
import {ChatOpenAI, OpenAIEmbeddings} from '@langchain/openai';

export const useChatOpenAI = () => {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
    temperature: 0,
  });
};

export const useEmbeddingsOpenAI = () => {
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
    modelName: 'text-embedding-ada-002',
  });
};
