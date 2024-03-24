import {HelloApiHandler} from './tasks/HelloApiHandler.ts';
import {TaskHandler} from './tasks/TaskHandler.js';

if (process.argv.length < 3) {
  console.error('Task name is required, start your application with "npm run start [task-name]"');
  process.exit(1);
}

const taskName = process.argv[2];
let handler: TaskHandler | null = null;

switch (taskName) {
  case 'helloapi':
    handler = new HelloApiHandler();
    break;
  default:
    console.error(`Unknown task: ${taskName}`);
    process.exit(1);
}

if (handler) {
  handler
    .handleTask()
    .then(response => {
      console.info('Task completed');
      console.log(JSON.stringify(response, null, 2));
    })
    .catch(error => {
      console.error(`Task failed: ${error}`);
    })
    .finally(() => {
      console.info('Application finished');
      process.exit(0);
    });
}
