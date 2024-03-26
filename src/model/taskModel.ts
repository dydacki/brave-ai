import {Task} from './model.js';

export interface HelloApiTask extends Task {
  code: number;
  msg: string;
  cookie: string;
}

export interface ModerationTask extends Task {
  code: number;
  msg: string;
  input: Array<string>;
}

export type ModerationTaskAnswer = Array<0 | 1>;
