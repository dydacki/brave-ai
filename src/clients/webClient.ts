import {AxiosInstance} from 'axios';
import {useAxios} from './axiosClient.ts';

export class WebClient {
  private axios: AxiosInstance;

  constructor(baseUrl: string) {
    this.axios = useAxios({baseUrl: baseUrl, debug: false, apiKey: ''});
  }

  async get(url: string): Promise<any> {
    return this.axios.get(url).then(response => response.data);
  }
}
