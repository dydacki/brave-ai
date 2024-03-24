import axios, {AxiosInstance} from 'axios';
import { TaskDevClientConfig } from '../model/model';

export const useAxcios = (config: TaskDevClientConfig): AxiosInstance => {
    const client = axios.create({
        baseURL: `${config.baseUrl}/`,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000,
    });

    if (config.debug) {
        client.interceptors.request.use((request) => {
            console.log('Sending request:', request);
            return request;
        });
    }

    return client;
}