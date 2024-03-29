import OpenAi from 'openai';
import {TaskHandler} from './TaskHandler.ts';
import {BloggerTask, BloggerChapterRequest, BloggerChapterRequestRole} from '../model/taskModel.ts';
import {useOpenAi} from '../clients/openAiClient.ts';
import {Answer} from '../model/model.js';

export class BloggerHandler extends TaskHandler {
  private openAiClient: OpenAi;

  constructor() {
    super();
    this.openAiClient = useOpenAi();
  }

  private buildSystemRole(): BloggerChapterRequestRole {
    return {
      role: 'system',
      content: 'Jesteś blogerem kuchennym. Twoim zadaniem jest opisać poszczególne etapy wykonywania pizzy Margheritta',
    };
  }

  private asUserRole(chapterDescription: string): BloggerChapterRequestRole {
    return {
      role: 'user',
      content: chapterDescription,
    };
  }

  private asRequestOptions(
    chatRoles: BloggerChapterRequest,
  ): OpenAi.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
    return {
      model: 'gpt-3.5-turbo',
      messages: chatRoles,
    };
  }

  private buildAnswer(blogChapter: string[]): Answer {
    return {
      answer: blogChapter,
    };
  }

  async getBlogChapter(blogChapter: string): Promise<OpenAi.Chat.Completions.ChatCompletion> {
    const chatRole: BloggerChapterRequestRole = this.buildSystemRole();
    const chatRoles: BloggerChapterRequest = [chatRole];
    chatRoles.push(this.asUserRole(blogChapter));

    return this.openAiClient.chat.completions.create(this.asRequestOptions(chatRoles));
  }

  async getBlogChapters(task: BloggerTask): Promise<string[]> {
    const blogChapters: string[] = [];
    const promises: Promise<OpenAi.Chat.Completions.ChatCompletion>[] = [];

    task.blog.forEach(description => promises.push(this.getBlogChapter(description)));
    const responses = await Promise.all(promises);

    if (
      responses.every(
        response =>
          response.choices &&
          response.choices.length > 0 &&
          response.choices[0].message &&
          response.choices[0].message.content,
      )
    ) {
      blogChapters.push(...responses.map(response => response.choices[0].message.content ?? ''));
      console.log('Blog chapters:', blogChapters);
      return blogChapters;
    }

    throw new Error('Could not obtain blog chapter from OpenAI');
  }

  async handleTask() {
    const task = (await this.getTask('blogger')) as BloggerTask;
    if (task.code !== 0) {
      throw new Error(`Could not obtain blogger task: ${task.msg}`);
    }

    console.info('Received task with input');
    const blogChapters = await this.getBlogChapters(task);
    const answer = this.buildAnswer(blogChapters);
    const response = await this.submitAnswer(answer);
    console.info(`Received response: ${JSON.stringify(response)}`);
  }
}
