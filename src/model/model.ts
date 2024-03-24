export interface TaskDevClientConfig {
    baseUrl: string;
    apiKey: string;
    debug?: boolean;
}

export interface Answer {
    answer: string | number | boolean | Record<string, unknown>;
}

export interface Result {
    code: number;
    msg: string;
}

export interface TokenResponse {
    code: number;
    msg: string;
    token?: string;
}

export interface AnswerResponse {
    code: number;
    msg: string;
    [key: string]: unknown;
}

export type Task = Record<string, unknown >;