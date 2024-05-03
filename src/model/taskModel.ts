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

export interface ScraperTask extends Task {
  code: number;
  msg: string;
  input: string;
  question: string;
}

export interface WhoAmITask extends Task {
  code: number;
  msg: string;
  hint: string;
}

export interface SearchTask extends Task {
  question: string;
}

export interface PeopleTask extends Task {
  question: string;
}

export interface KnowledgeTask extends Task {
  question: string;
  [key: string]: any;
}

export interface InpromptTask extends Task {
  input: Array<string>;
  question: string;
}

export interface ToolsTask extends Task {
  question: string;
}

export interface GnomeTask extends Task {
  url: string;
}

export type ModerationTaskAnswer = Array<0 | 1>;

export interface BloggerChapterRequestRole {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MemeTask extends Task {
  image: string;
  text: string;
}

export interface BloggerChapterRequest extends Array<BloggerChapterRequestRole> {}

export interface Friends {
  zygfryd: string[];
  stefan: string[];
  ania: string[];
}
