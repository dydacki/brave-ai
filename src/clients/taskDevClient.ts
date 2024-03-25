import {useAxios} from './axiosClient.ts';
import {AxiosInstance} from 'axios';
import {Answer, TaskDevClientConfig, TokenResponse, AnswerResponse, Task} from '../model/model.ts';

export class TaskDevClient {
  private axios: AxiosInstance;
  private readonly apiKey: string;

  constructor(config: TaskDevClientConfig) {
    this.axios = useAxios(config);
    this.apiKey = config.apiKey;
  }

  private getAuthorizationBody() {
    return {
      apikey: this.apiKey,
    };
  }

  private printErrorDetails(error: any): void {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
  }

  async getToken(taskName: string): Promise<TokenResponse> {
    try {
      const response = await this.axios.post<TokenResponse>(`/token/${taskName}`, this.getAuthorizationBody());
      return response.data;
    } catch (error) {
      this.printErrorDetails(error);
      throw error;
    }
  }

  async submitAnswer(answer: Answer, token: string): Promise<AnswerResponse> {
    try {
      const response = await this.axios.post<AnswerResponse>(`/answer/${token}`, {
        answer: answer.answer,
      });
      return response.data;
    } catch (error) {
      this.printErrorDetails(error);
      throw error;
    }
  }

  async getTask(token: string): Promise<Task> {
    try {
      const response = await this.axios.get<Task>(`/task/${token}`);
      return response.data;
    } catch (error) {
      this.printErrorDetails(error);
      throw error;
    }
  }
}
