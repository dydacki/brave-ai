import {AxiosInstance} from 'axios';
import {useAxios} from './axiosClient.ts';
import {RenderFormPayload, RenderFormResponse} from '../model/renderFormModel.js';

export class RenderFormClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = useAxios({
      baseUrl: 'https://get.renderform.io',
      debug: false,
      apiKey: '',
    });
  }

  async renderMeme(payload: RenderFormPayload): Promise<RenderFormResponse> {
    return this.axios
      .post('api/v2/render', payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.RENDERFORM_API_KEY,
        },
      })
      .then(response => response.data);
  }
}
