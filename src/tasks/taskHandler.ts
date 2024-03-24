import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import {TaskDevClient} from '../clients/taskDevClient.ts';
import {Task, TaskDevClientConfig} from '../model/model.ts';

const initializeConfig = (): TaskDevClientConfig => {
  const __dirname = fileURLToPath(import.meta.url);
  dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
  });

  return {
    baseUrl: process.env.BASE_URL as string,
    apiKey: process.env.AI_DEVS_API_KEY as string,
    debug: process.env.DEBUG === 'true',
  };
};

let config: TaskDevClientConfig = initializeConfig();
const devClient = new TaskDevClient(config);

const getTask = async (taskName: string): Promise<Task> => {
  const tokenResponse = await devClient.getToken(taskName);
  if (tokenResponse.code !== 0) {
    throw new Error(`Could not obtain token: ${tokenResponse.msg}/`);
  }

  const token = tokenResponse.token as string;
  return await devClient.getTask(token);
};

export {getTask};
