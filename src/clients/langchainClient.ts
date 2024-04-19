import 'dotenv/config';
import {ChatOpenAI} from '@langchain/openai';
import {OpenAIEmbeddings} from 'langchain/embeddings/openai';

export const useChatOpenAI = () => {
  return new ChatOpenAI({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
    model: 'gpt-4-0613',
    temperature: 0,
  });
};

export const useEmbeddingsOpenAI = () => {
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_AI_API_KEY,
    maxConcurrency: 5,
    modelName: 'text-embedding-ada-002',
  });
};
