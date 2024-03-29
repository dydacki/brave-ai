import {Task} from './model.ts';

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

export interface BloggerTask extends Task {
  code: number;
  msg: string;
  blog: Array<string>;
}

export type ModerationTaskAnswer = Array<0 | 1>;

export interface BloggerChapterRequestRole {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface BloggerChapterRequest extends Array<BloggerChapterRequestRole> {}
