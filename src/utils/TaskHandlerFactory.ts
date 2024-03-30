import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {TaskHandler} from '../tasks/TaskHandler.js';

export class TaskHandlerFactory {
  private static getDirectoryPath(directory: string): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '..', `/${directory}`);
  }

  private static getDirectoryContents(directory: string): string[] {
    const tasksDir = this.getDirectoryPath(directory);
    return fs.readdirSync(tasksDir).filter(file => file.endsWith('.ts') && file !== 'TaskHandler.ts');
  }

  static async create(taskName: string): Promise<TaskHandler> {
    for (const file of this.getDirectoryContents('tasks')) {
      if (file.toLowerCase().startsWith(taskName.toLowerCase())) {
        const taskModule = await import(path.join(`${this.getDirectoryPath('tasks')}/${file}`));
        const Handler = taskModule[file.replace('.ts', '')];
        return new Handler() as TaskHandler;
      }
    }

    throw new Error(`Could not find task: ${taskName}`);
  }
}
