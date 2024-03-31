import fs from 'fs';
import OpenAi from 'openai';
import {TaskHandler} from './TaskHandler.ts';
import {useOpenAi} from '../clients/openAiClient.ts';
import {getDirectoryPath} from '../utils/FileHandler.ts';

export class WhisperHandler extends TaskHandler {
  private openAiClient: OpenAi;

  constructor() {
    super();
    this.openAiClient = useOpenAi();
  }

  private async getTranscript(): Promise<string> {
    const absolutePath = getDirectoryPath(['misc', 'mateusz.mp3']);
    const transcript = await this.openAiClient.audio.transcriptions.create({
      file: fs.createReadStream(absolutePath),
      model: 'whisper-1',
      language: 'pl',
    });

    console.log(transcript.text);
    return transcript.text;
  }

  private asAnswer(answer: string) {
    return {
      answer: answer,
    };
  }

  async handleTask() {
    const transcript = await this.getTranscript();
    const answer = this.asAnswer(transcript);

    const task = await this.getTask('whisper');
    if (task.code !== 0) {
      throw new Error(`Could not obtain moderation task: ${task.msg}`);
    }

    console.info('Received embedding task', JSON.stringify(JSON.stringify(task, null, 2)));
    const answerResponse = await this.submitAnswer(answer);
    console.info(`Received response: ${JSON.stringify(answerResponse, null, 2)}`);
  }
}
