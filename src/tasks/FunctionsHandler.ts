import {TaskHandler} from './TaskHandler.ts';

// noinspection JSUnusedGlobalSymbols
export class FunctionsHandler extends TaskHandler {
  constructor() {
    super();
  }

  private asAnswer(functionDef: any) {
    return {
      answer: functionDef,
    };
  }

  private getFunctionDefinition() {
    return {
      name: 'addUser',
      description: 'Add a new user to the system',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'provide name of the user',
          },
          surname: {
            type: 'string',
            description: 'provide surname of the user',
          },
          year: {
            type: 'number',
            description: 'provide year of birth of the user',
          },
        },
      },
    };
  }

  async handleTask() {
    const task = await this.getTask('functions');
    if (task.code !== 0) {
      throw new Error(`Could not obtain functions task: ${task.msg}`);
    }

    console.info('Received functions task', JSON.stringify(task, null, 2));
    const answer = this.asAnswer(this.getFunctionDefinition());
    const response = await this.submitAnswer(answer);
    console.log(`Received response: ${JSON.stringify(response, null, 2)}`);
  }
}
