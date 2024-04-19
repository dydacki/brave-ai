import {BaseMessageChunk} from 'langchain/schema';

export const schemas = {
  general: {
    name: 'general',
    description: 'General knowledge',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
        },
      },
    },
  },
  currency: {
    name: 'currency',
    description: 'Get currency exchange rate',
    parameters: {
      type: 'object',
      properties: {
        currency: {
          type: 'string',
          description: 'Currency code',
        },
      },
    },
  },
  population: {
    name: 'population',
    description: 'Get population of a country',
    parameters: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'English name of a country',
        },
      },
    },
  },
};

export const parseFunctionCall = (result: BaseMessageChunk): {name: string; args: any} | null => {
  if (result?.additional_kwargs?.function_call === undefined) {
    return null;
  }
  return {
    name: result.additional_kwargs.function_call.name,
    args: JSON.parse(result.additional_kwargs.function_call.arguments),
  };
};
